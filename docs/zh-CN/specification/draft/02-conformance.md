# 第 02 章 合规性

## 2.1 规范性关键字

本规范中以全大写形式出现的关键字 **MUST**、**MUST NOT**、**REQUIRED**、**SHALL**、**SHALL NOT**、**SHOULD**、**SHOULD NOT**、**RECOMMENDED**、**MAY**、**OPTIONAL** 按 [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) 与 [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) 解释，且仅当以全大写形式出现时方为规范性。

| 关键字 | 含义 |
|-------|------|
| **MUST** / **REQUIRED** / **SHALL** | 该项是规范的绝对要求 |
| **MUST NOT** / **SHALL NOT** | 该项是规范的绝对禁止 |
| **SHOULD** / **RECOMMENDED** | 在特定情况下可有合理理由忽略，但实现者必须充分理解后果 |
| **SHOULD NOT** / **NOT RECOMMENDED** | 在特定情况下可有合理理由实施，但实现者必须充分理解后果 |
| **MAY** / **OPTIONAL** | 该项是真正可选的；不实现该项的实体必须能与实现该项的实体互操作 |

## 2.2 一致性级别

TP 实现按所支持的功能集划分为三个一致性级别。Fay 通过 `FayProfile.conformance_level` 字段声明自身级别。级别之间是**严格累进**关系：高级别 MUST 包含所有低级别要求。

| 级别 | 标识符 | 适用场景 |
|------|-------|---------|
| Core | `tp_core` | 最小可互操作实现，适合实验性 Fay、原型、受限设备 |
| Secure | `tp_secure` | 生产可用、保护人类原型隐私的实现 |
| Full | `tp_full` | 完整 TP 实现，覆盖所有可选能力 |

### 2.2.1 `tp_core` 级别要求

`tp_core` 级别的实现 MUST 满足以下要求：

**身份辨识层（详见 §04）**
- MUST 支持 `did:key` 方法的身份验证
- MUST 在所有出站消息的 `MessageEnvelope.sender` 中携带完整 `FayIdentity`
- MUST 验证所有入站消息 `sender` 的 DID 签名
- MUST 在交换 `FayProfile` 时声明 `conformance_level`
- MAY 不支持 `did:web` 与 `did:chain`

**认知分享层（详见 §05）**
- MUST 支持 `delegated_access` 模式的 SharedContext
- MUST 实现 SharedContext 生命周期状态机的所有合法转换
- MUST 支持 `memory_fragment` 与 `view_state` 两类认知资源
- MUST 实现基于 `last_writer_wins` 的同步策略
- MAY 不支持 `collaborative_space` 模式
- MAY 不支持 `reasoning_engine` 与 `environment_context` 资源类型
- MAY 不支持 `crdt` 或 `operational_transform` 同步策略

**目标协商层（详见 §06）**
- MUST 支持 `query`、`execute`、`notify` 三类 `goal_type`
- MUST 实现 Goal 状态机的所有合法转换
- MUST 支持单层 Goal（无子目标）的协商与执行
- MAY 不支持 `subscribe`、`delegate`、`consult`
- MAY 不支持子目标 DAG 分解

**隐私与安全（详见 §07）**
- MUST 在 TLS 1.3 或更高版本的传输通道之上运行（除 prompt_embedding 外）
- MUST 对所有出站消息进行 Ed25519 签名
- MAY 不支持端到端加密
- MAY 不支持选择性披露
- MAY 不支持回调凭证

**协议协商（详见 §08）**
- MUST 实现 `tier_3_natural_language` 通信级别
- MUST 在会话开始时进行协议协商
- MAY 不支持 `tier_1_standardized` 与 `tier_2_ai_generated`

**传输绑定（详见 §09）**
- MUST 支持原生 TP 传输（`native_tp`）
- MAY 不支持其他传输方式

**错误处理（详见 §10）**
- MUST 返回符合 §10 错误码规范的 `TPError` 结构
- MUST 在所有错误响应中保留 `correlation_id`

### 2.2.2 `tp_secure` 级别要求

`tp_secure` 级别的实现 MUST 满足 `tp_core` 全部要求，**并且**：

**身份辨识层**
- MUST 支持 `did:web` 方法
- MUST 验证 `HostAuthorization.fp_authorization_ref` 的可验证性（向 FP 协议查询）
- MUST 拒绝 `host_authorization` 缺失或过期的 iFay 请求

**认知分享层**
- MUST 支持 `collaborative_space` 模式
- MUST 实现 SharedContext 的访问控制列表（ACL）执行
- MUST 在 `lifecycle.state = revoked` 时立即终止所有正在进行的资源访问
- MUST 在审计日志中记录所有 SharedContext 状态转换

**隐私与安全**
- MUST 支持端到端加密（`AES-256-GCM` 或 `ChaCha20-Poly1305`）
- MUST 支持选择性披露（`SelectiveDisclosure`）
- MUST 支持回调凭证（`CallbackCredential`）
- MUST 在所有人类原型隐私数据传输中使用 `EncryptedPayload`
- MUST 支持凭证撤销（`revocation_endpoint`）
- MUST 维护审计日志，记录所有凭证使用与隐私数据访问

**协议协商**
- MUST 支持 `tier_2_ai_generated`
- MUST 实现 `security_level = "high"` 的协议契约

**目标协商层**
- MUST 支持 `consult` goal_type 与咨询模式
- MUST 在咨询请求中验证 `authorization_scope`

### 2.2.3 `tp_full` 级别要求

`tp_full` 级别的实现 MUST 满足 `tp_secure` 全部要求，**并且**：

**身份辨识层**
- MUST 支持 `did:chain` 方法

**认知分享层**
- MUST 支持所有四类 `CognitiveResourceType`
- MUST 支持 `crdt` 与 `operational_transform` 同步策略中的至少一种
- MUST 支持 SharedContext 的事件驱动过期（`expiration_event`）

**目标协商层**
- MUST 支持所有 `goal_type`
- MUST 支持子目标 DAG 分解，且 MUST 检测并拒绝循环依赖
- MUST 支持链式咨询（`chained_from`）

**协议协商**
- MUST 支持 `tier_1_standardized`

**传输绑定**
- MUST 至少支持以下三种传输方式：`native_tp`、`a2a_jsonrpc`、`mcp_tool_call`
- SHOULD 支持 `rest_api` 与 `prompt_embedding`

## 2.3 互操作性原则

### 2.3.1 级别协商

当两个 Fay 建立 TP 会话时：

1. 双方 MUST 在 `FayProfile` 交换阶段披露各自的 `conformance_level`。
2. 后续交互的有效能力集为**双方级别的交集**——以低级别一方为准。
3. 高级别一方 MUST 不得使用低级别一方不支持的功能；如必须使用，MUST 主动降级或拒绝建立会话。

### 2.3.2 未知字段处理

实现 MUST 遵循以下未知字段处理规则：

| 场景 | 处理 |
|------|------|
| 接收方收到包含未知字段的合法消息 | MUST 忽略未知字段，继续处理已知字段 |
| 接收方收到 `additionalProperties: false` 的对象内的未知字段 | MUST 拒绝消息，返回 `TP-VAL003` 错误 |
| 接收方收到 `MessageType` 枚举外的值 | MUST 拒绝消息，返回 `TP-VAL001` 错误 |
| 接收方收到 `MessageEnvelope.tp_version` 主版本号高于自身支持 | MUST 拒绝消息，返回 `TP-VER001` 错误 |
| 接收方收到 `MessageEnvelope.tp_version` 次版本号高于自身支持 | SHOULD 尝试处理已知部分，未知字段按上一行规则忽略 |

### 2.3.3 降级策略

当一方因能力不足无法满足请求时：

- **优先降级而非拒绝**：例如，请求方提议 `tier_1_standardized` 而响应方仅支持 `tier_3_natural_language`，响应方 MUST 在 `negotiate_response` 中提议 `tier_3_natural_language`，而非直接拒绝。
- **降级 MUST 是显式的**：通过 `ProtocolContract` 明确记录最终选定的级别。
- **隐式降级 MUST NOT 发生**：不允许在不通知对方的情况下静默降低安全级别或加密强度。

## 2.4 测试与验证

### 2.4.1 一致性测试套件

正式版本（`2025-10-25` 及之后）发布时 MUST 附带一致性测试套件。该套件 MUST：

- 对每个一致性级别提供独立测试集
- 覆盖所有 MUST 与 SHOULD 要求
- 提供基准 Fay 实现，可作为对端进行黑盒测试
- 输出可机器解析的合规报告

`draft` 阶段的实现 MAY 跳过完整一致性测试，但 SHOULD 至少通过 §2.2.1 列出的 `tp_core` 必备项。

### 2.4.2 自我声明

实现可在自身文档或 `FayProfile` 中声明所支持的级别。声明 MUST 是诚实的；夸大的合规声明可能导致：

- 互操作性失败（对端依赖未实现的功能）
- 安全漏洞（如声明 `tp_secure` 但未实现端到端加密）
- 审计与合规风险

## 2.5 向后兼容性

### 2.5.1 版本演进规则

| 变更类型 | 允许的版本递增 |
|---------|---------------|
| 添加可选字段 | 次版本（minor） |
| 添加新的 `MessageType` 值 | 次版本（minor） |
| 添加新的一致性级别能力 | 次版本（minor） |
| 修改字段类型 | 主版本（major） |
| 删除字段 | 主版本（major） |
| 将 OPTIONAL 字段改为 REQUIRED | 主版本（major） |
| 修改 `MessageType` 枚举值 | 主版本（major） |
| 修改一致性级别要求 | 主版本（major） |

### 2.5.2 弃用流程

在主版本变更之前，被弃用的字段或行为 MUST 经过以下流程：

1. **声明弃用**：在 `schema.mdx` 中标注 `[DEPRECATED]`，给出弃用原因与替代方案。
2. **观察期**：至少持续一个次版本周期，期间字段仍 MUST 可用。
3. **移除**：在下一个主版本中移除。

## 2.6 合规等级速查

下表汇总各级别支持的关键能力，用于快速选型。✅ = MUST，🟡 = SHOULD，⚪ = MAY（OPTIONAL）。

| 能力 | tp_core | tp_secure | tp_full |
|------|:------:|:---------:|:-------:|
| `did:key` 身份验证 | ✅ | ✅ | ✅ |
| `did:web` 身份验证 | ⚪ | ✅ | ✅ |
| `did:chain` 身份验证 | ⚪ | ⚪ | ✅ |
| FP 授权引用验证 | ⚪ | ✅ | ✅ |
| `delegated_access` SharedContext | ✅ | ✅ | ✅ |
| `collaborative_space` SharedContext | ⚪ | ✅ | ✅ |
| `memory_fragment` 资源 | ✅ | ✅ | ✅ |
| `view_state` 资源 | ✅ | ✅ | ✅ |
| `reasoning_engine` 资源 | ⚪ | ⚪ | ✅ |
| `environment_context` 资源 | ⚪ | ⚪ | ✅ |
| `last_writer_wins` 同步 | ✅ | ✅ | ✅ |
| `crdt` 或 `operational_transform` 同步 | ⚪ | ⚪ | ✅ |
| `query` / `execute` / `notify` Goal | ✅ | ✅ | ✅ |
| `consult` Goal | ⚪ | ✅ | ✅ |
| `subscribe` / `delegate` Goal | ⚪ | ⚪ | ✅ |
| 子目标 DAG | ⚪ | ⚪ | ✅ |
| Ed25519 消息签名 | ✅ | ✅ | ✅ |
| 端到端加密 | ⚪ | ✅ | ✅ |
| 选择性披露 | ⚪ | ✅ | ✅ |
| 回调凭证 | ⚪ | ✅ | ✅ |
| 凭证撤销 | ⚪ | ✅ | ✅ |
| 审计日志 | ⚪ | ✅ | ✅ |
| `tier_1_standardized` 通信级别 | ⚪ | ⚪ | ✅ |
| `tier_2_ai_generated` 通信级别 | ⚪ | ✅ | ✅ |
| `tier_3_natural_language` 通信级别 | ✅ | ✅ | ✅ |
| `native_tp` 传输 | ✅ | ✅ | ✅ |
| `a2a_jsonrpc` 传输 | ⚪ | ⚪ | ✅ |
| `mcp_tool_call` 传输 | ⚪ | ⚪ | ✅ |
| `rest_api` / `prompt_embedding` 传输 | ⚪ | ⚪ | 🟡 |
