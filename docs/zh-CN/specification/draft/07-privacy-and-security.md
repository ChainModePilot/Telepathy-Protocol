# 第 07 章 隐私与安全

## 7.1 概述

TP 的核心承诺之一是「人类原型主权隐私」——人类原型对其数据拥有绝对的主权。本章规定确保这一承诺的所有技术机制：

- 端到端加密（§7.2）
- 选择性披露（§7.3）
- 回调凭证（`CallbackCredential`，§7.4）
- 审计日志（§7.5）
- 密钥管理（§7.6）

`tp_secure` 起 MUST 实现本章全部要求；`tp_core` 仅要求传输层 TLS 与消息签名（详见 §02.2）。

## 7.2 端到端加密

### 7.2.1 何时使用 EncryptedPayload

实现 MUST 在以下场景使用 `EncryptedPayload` 包装载荷：

1. 任何携带人类原型隐私数据的消息（医疗、财务、身份、生物特征等）
2. `CognitiveResource.access_policy.requires_encryption = true` 的资源
3. 包含 `host_authorization` 涉及敏感操作时
4. 跨组织（不同的 coFay 域）传输时

实现 SHOULD 默认对 `iFay` 之间的所有 `payload` 加密——加密总比不加密安全，性能代价通常可接受。

### 7.2.2 算法选择

| 用途 | 必备算法 | 备选 |
|------|---------|------|
| 对称加密 | `AES-256-GCM` | `ChaCha20-Poly1305` |
| 密钥协商 | `X25519` 或 `ECDH-P256` | — |
| 签名 | `Ed25519Signature2020` | `EcdsaSecp256k1Signature2019` |

实现 MUST：

- 不再支持 `RSA-OAEP`（已从 schema 中移除）
- 优先使用 `ChaCha20-Poly1305` 在缺少 AES 硬件加速的设备上（如某些边缘设备）
- 使用 `X25519` 作为 ECDH 协商的首选

### 7.2.3 加密结构

`EncryptedPayload` 字段及构造规则：

```
EncryptedPayload {
  encryption_algorithm:  AES-256-GCM | ChaCha20-Poly1305
  encrypted_data:        Base64(对称加密后的密文 || GCM 认证标签)
  key_exchange_info:     KeyExchangeInfo
  selective_disclosure:  SelectiveDisclosure (可选)
  audit_ref:             审计记录 URI
}
```

构造步骤：

1. 生成一次性会话密钥 `K_session`（256 位随机字节）
2. 使用对端的长期公钥与本端私钥执行 ECDH 协商，得到共享秘密 `S`
3. 使用 HKDF 从 `S` 派生「密钥包装密钥」`K_wrap`
4. 使用 `K_wrap` 加密 `K_session`，存入 `key_exchange_info.encrypted_session_key`
5. 使用 `K_session` 加密 `payload` 内容，结果存入 `encrypted_data`
6. 生成审计记录，URI 存入 `audit_ref`

### 7.2.4 解密验证

接收方解密前 MUST：

- 验证 `MessageEnvelope.signature`（外层签名）
- 验证 `audit_ref` 是有效的审计 URI
- 解密成功后 MUST 写入审计日志（详见 §7.5）

解密失败的消息 MUST NOT 被处理，且 MUST 返回 `TP-SEC003`。

## 7.3 选择性披露

### 7.3.1 概念

选择性披露允许数据所有者在加密时声明：「这些字段允许特定接收方看到，其他字段保持加密。」实现可基于零知识证明、可分割签名或基于策略的过滤。

### 7.3.2 SelectiveDisclosure 字段

```
SelectiveDisclosure {
  disclosed_fields: ["field.path1", "field.path2", ...]  // JSONPath 风格
  policy_ref:       "<可选：披露策略 URI>"
}
```

字段路径使用点分 JSONPath 风格：`patient.diagnosis_codes`、`policy.coverage[0].limit_cny`。

### 7.3.3 披露执行

发送方：

- MUST 仅将 `disclosed_fields` 列出的字段以可解密形式包含
- 其余字段 MAY 被完全省略，或以加密占位符（`{"_encrypted": true}`）保留
- MUST 在 `policy_ref` 中记录披露决策的依据（如人类原型授权 ID）

接收方：

- MUST 不尝试推断或暴力解密未列出的字段
- MUST 视未列出字段为不可访问，相关查询返回 `TP-SEC005`

### 7.3.4 披露策略示例

银行 coFay 申请贷款审批，人类原型授权披露「近 12 个月工资流水 + 信用评分」：

```json
{
  "disclosed_fields": [
    "income.salary_records[*].month",
    "income.salary_records[*].amount",
    "credit.score",
    "credit.score_provider"
  ],
  "policy_ref": "fp:auth:zhang-san:bank-icbc:loan-2026-005"
}
```

完整数据中其他字段（消费明细、投资组合）以加密占位符存在，银行 coFay 无法访问。

## 7.4 回调凭证

### 7.4.1 概念

`CallbackCredential` 是 TP 的「电子授权委托书」：

- **有时效**：明确的 `expiration` 时间
- **有范围**：限定的 `resources` 与 `operations`
- **可撤销**：通过 `revocation_endpoint` 即时失效
- **可审计**：每次使用 MUST 记录

适用场景：咨询模式（§6.6）、跨域数据访问、临时第三方接入。

### 7.4.2 凭证字段约束

| 字段 | 约束 |
|------|------|
| `credential_id` | UUID，全局唯一 |
| `scope.resources` | 至少 1 项；MUST 是显式列举的资源标识符（不允许通配符） |
| `scope.operations` | 至少 1 项；MUST 是显式列举的操作（如 `read`, `write`, `disclose_diagnosis`） |
| `expiration` | ISO 8601；MUST 不超过 `HostAuthorization.max_sharing_duration` |
| `resource_reference` | 引用具体资源（如 `ctx:xxx/mount-point` 或 `res:xxx`） |
| `issuer_fay_id` | 签发方 fay_id，MUST 等于资源拥有方 |
| `encrypted_token` | 实际授权令牌，加密存储 |
| `revocation_endpoint` | URI；`tp_secure` 起必填 |

### 7.4.3 签发流程

资源拥有方签发凭证时 MUST：

1. 验证请求方 `authorization_scope` 与人类原型 `HostAuthorization` 兼容
2. 生成 `credential_id`（UUID v4 或 v7）
3. 生成密钥对：使用拥有方私钥签名一个内嵌结构 `{credential_id, scope, expiration, issuer_fay_id, holder_fay_id}`
4. 用接收方公钥加密签名结果，存入 `encrypted_token`
5. 在审计日志记录凭证签发事件

### 7.4.4 凭证使用

凭证持有方使用时 MUST：

1. 解密 `encrypted_token` 获得签名
2. 验证签名（确保非伪造）
3. 验证当前时间未超过 `expiration`
4. 在请求时附带 `credential_id` 与签名摘要
5. 资源拥有方收到请求后 MUST：
   - 检查凭证未撤销（查询本地撤销列表或 `revocation_endpoint`）
   - 验证操作在 `scope.operations` 内
   - 验证目标资源在 `scope.resources` 内
   - 在审计日志记录使用事件

### 7.4.5 撤销

签发方在以下情况 MUST 主动撤销凭证：

- 人类原型撤回授权
- `HostAuthorization` 被 FP 协议失效
- 检测到异常使用模式（如频率异常、IP 异常）
- 业务流程完成（如理赔评估结束）

撤销实现：

- 签发方 MUST 维护撤销列表（CRL）或在线撤销端点（OCSP-like）
- `revocation_endpoint` MUST 支持简单的 GET 查询：`GET <endpoint>?credential_id=<id>` 返回 `{"revoked": true|false, "revoked_at": "<ISO 8601>"}`
- 接收方 SHOULD 缓存撤销查询结果，TTL ≤ 60 秒
- 撤销 MUST 是不可逆的——一旦撤销不可重新激活，须重新签发

### 7.4.6 凭证链与传递

`CallbackCredential` MUST NOT 被任意转发：

- `holder_fay_id`（隐含于 `encrypted_token`）固定接收方
- 如需让第三方访问，资源拥有方 MUST 重新签发凭证给第三方
- 链式咨询（§6.6.4）中每一跳 MUST 重新签发凭证

## 7.5 审计日志

### 7.5.1 必须审计的事件

`tp_secure` 起 MUST 在审计日志记录：

| 事件类型 | 触发时机 |
|---------|---------|
| `identity_verified` | DID 验证成功 |
| `host_auth_verified` | HostAuthorization 验证成功 |
| `host_auth_failed` | HostAuthorization 验证失败 |
| `context_created` | SharedContext 进入 `active` |
| `context_state_changed` | SharedContext 状态转换 |
| `resource_mounted` | 资源挂载 |
| `resource_accessed` | 资源被读取 |
| `resource_modified` | 资源被修改 |
| `credential_issued` | 凭证签发 |
| `credential_used` | 凭证被使用 |
| `credential_revoked` | 凭证被撤销 |
| `consultation_initiated` | 咨询发起 |
| `consultation_completed` | 咨询完成 |
| `privacy_data_decrypted` | 隐私数据被解密 |

### 7.5.2 审计记录字段

每条审计记录 MUST 包含：

```json
{
  "audit_id": "<UUID>",
  "event_type": "<上表事件类型>",
  "timestamp": "<ISO 8601>",
  "actor_fay_id": "<触发方 fay_id>",
  "subject_fay_id": "<被作用方 fay_id>",
  "resource_ref": "<相关资源标识>",
  "operation": "<具体操作>",
  "result": "success | failure",
  "context_ref": "<相关 SharedContext>",
  "host_authorization_ref": "<相关 FP 授权>",
  "details": { /* 事件特定详情 */ }
}
```

实现 MUST NOT 在审计日志中记录：

- 实际数据内容（如诊断详情、财务数字）
- 凭证令牌明文
- 加密密钥
- 签名值（仅记录签名是否有效）

### 7.5.3 审计存储与查询

实现 MUST：

- 将审计日志存储为**只追加（append-only）**结构
- 保留期 MUST ≥ 90 天（合规要求可能更长）
- 提供查询接口供人类原型审查自身相关事件
- 防止审计日志被篡改（推荐使用哈希链或不可变存储）

实现 SHOULD：

- 提供按时间、事件类型、资源 ID 的查询索引
- 支持导出为标准格式（JSON Lines、CSV）以便外部分析
- 接入 SIEM 系统或日志聚合平台

### 7.5.4 人类原型查询权

人类原型 MUST 能通过自身的 iFay 查询所有与自己相关的审计记录。查询接口由实现自定义，但 MUST 满足：

- 查询响应时间 SHOULD ≤ 5 秒（最近 7 天数据）
- 结果 MUST 按时间倒序
- 结果格式 MUST 人类可读（不仅是机器格式）

## 7.6 密钥管理

### 7.6.1 长期身份密钥

每个 Fay 的 DID 关联一对长期身份密钥：

- 私钥 MUST NOT 离开 Fay 的安全边界（HSM、TEE、安全 enclave 优先）
- 公钥通过 DID 解析公开
- 密钥轮换通过更新 DID 文档完成；旧公钥 MUST 保留 90 天用于历史签名验证

### 7.6.2 会话密钥

每次加密通信使用一次性会话密钥（`K_session`）：

- MUST 不重用
- MUST 在使用后立即销毁（清零内存）
- MUST NOT 持久化到存储

### 7.6.3 密钥轮换

实现 MUST 支持长期密钥轮换：

- 默认轮换周期 SHOULD ≤ 12 个月
- 轮换 MUST 提前在 DID 文档中声明新密钥
- 在过渡期内（≥ 7 天），新旧密钥 MUST 同时有效
- 过渡期后旧密钥 MUST 标记为「仅验证（verify-only）」并在 90 天后失效

### 7.6.4 密钥泄露应急

检测到密钥泄露时 Fay MUST：

1. 立即通过 DID 文档撤销泄露的密钥
2. 撤销所有该密钥签发的有效凭证
3. 通过审计日志识别泄露期间的可疑活动
4. 通知所有最近交互的对端（通过 SharedContext 广播）
5. 在 24 小时内向相关人类原型（iFay）或运维方（coFay）报告

## 7.7 端到端加密示例

承接 §05.7：A 挂载诊断资源时，`requires_encryption: true`。完整的加密挂载消息：

```json
{
  "tp_version": "1.0.0",
  "message_id": "01902c4f-1a2b-7000-8000-000000000012",
  "sender": { /* fay:patient-zhang-3389 */ },
  "receiver": { /* fay:insurance-co-pingan */ },
  "timestamp": "2026-05-27T08:35:02.000Z",
  "message_type": "resource_mount",
  "payload": {
    "context_id": "ctx:claim-2026-001",
    "mounted_resource": {
      "resource": {
        "resource_id": "res:diagnosis-2026-001",
        "resource_type": "memory_fragment",
        "content_ref": {
          "mode": "inline",
          "data": {
            "encryption_algorithm": "AES-256-GCM",
            "encrypted_data": "<base64-ciphertext>",
            "key_exchange_info": {
              "method": "X25519",
              "public_key": "<base64-ephemeral-public-key>",
              "encrypted_session_key": "<base64-wrapped-session-key>"
            },
            "selective_disclosure": {
              "disclosed_fields": [
                "diagnosis_codes",
                "treatment_dates",
                "cost_total_cny"
              ],
              "policy_ref": "fp:auth:zhang-san:hospital-east:claim-2026-001"
            },
            "audit_ref": "audit://patient-zhang-3389/2026-05-27/disclosure-001"
          },
          "size_bytes": 1842
        },
        "access_policy": { /* ... */ },
        /* ... */
      },
      /* ... */
    }
  },
  "signature": "<base64-envelope-signature>"
}
```

`payload.mounted_resource.resource.content_ref.data` 字段是 `EncryptedPayload`，而非 §05.7 中的明文。

## 7.8 安全层错误码

| 错误码 | 触发条件 |
|-------|---------|
| `TP-SEC001` | 加密算法不支持 |
| `TP-SEC002` | 密钥协商失败 |
| `TP-SEC003` | 解密失败（密文损坏或密钥错误） |
| `TP-SEC004` | 签名验证失败（载荷层，区别于 §04 的信封层 TP-ID003） |
| `TP-SEC005` | 尝试访问选择性披露未列出的字段 |
| `TP-SEC010` | 凭证不存在或已过期 |
| `TP-SEC011` | 凭证已撤销 |
| `TP-SEC012` | 凭证 holder 与请求方不一致 |
| `TP-SEC013` | 凭证 scope 不包含请求的操作 |
| `TP-SEC014` | 凭证 scope 不包含请求的资源 |
| `TP-SEC020` | 审计日志写入失败（应阻止操作以保安全） |
| `TP-SEC030` | 密钥已被声明撤销 |
