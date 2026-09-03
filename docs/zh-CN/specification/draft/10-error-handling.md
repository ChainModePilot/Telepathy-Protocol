# 第 10 章 错误处理

## 10.1 概述

TP 的错误处理设计原则：

- **统一格式**：所有错误使用 `TPError` 结构（详见 schema）
- **类别前缀**：错误码按层分类（`ID`、`CTX`、`GOAL`、`SEC`、`NEG`、`TRA`、`VAL`、`VER`、`SYS`）
- **可恢复性分类**：每个错误明确归类为「可重试」、「需协商」或「终态」
- **关联请求**：错误响应 MUST 通过 `correlation_id` 关联原请求

本章规定：

- 错误码体系（§10.2）
- TPError 结构与传输（§10.3）
- 可恢复性分类（§10.4）
- 错误恢复策略（§10.5）
- 完整错误码索引（§10.6）

## 10.2 错误码体系

### 10.2.1 命名规则

错误码格式：`TP-<CATEGORY><CODE>`

- `TP-` 前缀固定
- `<CATEGORY>` 是 2-4 字母的层标识
- `<CODE>` 是 3 位数字，从 001 开始

### 10.2.2 类别索引

| 类别 | 来源章 | 含义 |
|------|-------|------|
| `ID` | §04 | 身份辨识层错误 |
| `CTX` | §05 | 共享语境层错误 |
| `GOAL` | §06 | 目标协商层错误 |
| `SEC` | §07 | 隐私与安全错误 |
| `NEG` | §08 | 协议协商错误 |
| `TRA` | §09 | 传输绑定错误 |
| `VAL` | 跨层 | 数据校验错误 |
| `VER` | 跨层 | 协议版本错误 |
| `SYS` | 跨层 | 系统/资源/超时错误 |

每章已列出该类别下的具体错误码。本章 §10.6 给出全集索引。

## 10.3 TPError 结构

### 10.3.1 字段约束

| 字段 | 约束 |
|------|------|
| `error_code` | MUST 符合 `TP-<CAT><NUM>` 格式 |
| `message` | MUST 非空，MUST 是人类可读 |
| `details` | OPTIONAL；可携带结构化错误详情 |
| `recovery_suggestions` | OPTIONAL；建议的恢复动作列表 |
| `correlation_id` | MUST 与原请求的 `message_id` 一致 |

### 10.3.2 message_type = error

错误响应的 `MessageEnvelope.message_type` MUST 为 `"error"`，`payload` MUST 为 `TPError` 对象。

```json
{
  "tp_version": "1.0.0",
  "message_id": "<新 UUID>",
  "sender": { /* 错误返回方 */ },
  "receiver": { /* 原请求发送方 */ },
  "timestamp": "<ISO 8601>",
  "correlation_id": "<原请求 message_id>",
  "message_type": "error",
  "payload": {
    "error_code": "TP-CTX007",
    "message": "Time-limited access permission has expired",
    "details": {
      "context_id": "ctx:claim-2026-001",
      "resource_id": "res:diagnosis-2026-001",
      "expired_at": "2026-05-27T10:35:00.000Z"
    },
    "recovery_suggestions": [
      "Request a new credential with extended validity",
      "Re-establish a new SharedContext"
    ],
    "correlation_id": "<原请求 message_id>"
  },
  "signature": "<base64>"
}
```

### 10.3.3 错误信息本地化

`message` 字段 SHOULD 使用英语作为通用语；如需本地化，可在 `details.localized_messages` 中提供：

```json
{
  "error_code": "TP-CTX007",
  "message": "Time-limited access permission has expired",
  "details": {
    "localized_messages": {
      "zh-CN": "时间限制权限已过期",
      "ja": "時間制限付き権限の有効期限が切れています"
    }
  }
}
```

## 10.4 可恢复性分类

### 10.4.1 三类错误

每个错误码 MUST 归入下列三类之一：

| 类别 | 含义 | 处理 |
|------|------|------|
| **Retriable** | 临时性、可重试 | 实现 SHOULD 自动重试（带退避） |
| **Negotiable** | 需要协商或调整后重试 | 实现 SHOULD 调整请求后重试 |
| **Terminal** | 终态错误，重试无意义 | 实现 MUST 向上层报告失败 |

### 10.4.2 自动恢复指南

| 类别 | 推荐重试策略 | 最大重试次数 |
|------|------------|-------------|
| Retriable | 指数退避（initial 1s, factor 2, max 60s） | 5 |
| Negotiable | 协商后立即重试一次 | 1（每次协商） |
| Terminal | 不重试 | 0 |

`MessageEnvelope.trace_info` SHOULD 记录重试次数。超过最大重试次数后 MUST 升级为 Terminal 错误。

## 10.5 错误恢复策略

### 10.5.1 身份层错误恢复

| 错误码 | 类别 | 恢复 |
|-------|------|------|
| `TP-ID001` | Terminal | 修正 FayIdentity 后重新发起 |
| `TP-ID002` | Retriable | 重试（DNS / 网络问题） |
| `TP-ID003` | Terminal | 检查签名实现 |
| `TP-ID004` | Retriable | 重新生成 message_id 后重试 |
| `TP-ID005` | Negotiable | 同步时钟后重试 |
| `TP-ID006` | Terminal | 修复客户端实现 |
| `TP-ID007`-`TP-ID010` | Negotiable | 重新申请人类原型授权 |

### 10.5.2 共享语境错误恢复

| 错误码 | 类别 | 恢复 |
|-------|------|------|
| `TP-CTX001` | Terminal | context 不存在，需重新建立 |
| `TP-CTX002` | Terminal | 非参与方，需重新创建 context 并加入 |
| `TP-CTX003` | Terminal | 非法状态转换，检查实现逻辑 |
| `TP-CTX004` | Terminal | 终态 context，需创建新 context |
| `TP-CTX005`-`TP-CTX008` | Negotiable | 协商更新 ACL 或权限 |
| `TP-CTX011` | Terminal | 模式不允许，需重新创建为 collaborative_space |
| `TP-CTX012`-`TP-CTX014` | Negotiable | 调整资源后重新挂载 |
| `TP-CTX020` | Negotiable | 应用冲突解决后重试 |
| `TP-CTX021` | Retriable | 重新同步 |

### 10.5.3 目标协商错误恢复

| 错误码 | 类别 | 恢复 |
|-------|------|------|
| `TP-GOAL001` | Terminal | 修正 goal_id |
| `TP-GOAL002` | Negotiable | 修正参数后重新提议 |
| `TP-GOAL003` | Terminal | 对端不支持该 goal_type |
| `TP-GOAL004` | Terminal | 检查状态机实现 |
| `TP-GOAL005` | Terminal | 协商已超限，重启会话 |
| `TP-GOAL006`-`TP-GOAL009` | Negotiable | 修正 schema 或输出后重试 |
| `TP-GOAL010` | Terminal | 修正 DAG 后重新提议 |
| `TP-GOAL011` | Terminal | 父级取消，需重新规划 |
| `TP-GOAL012` | Negotiable | 调整约束或重新协商 |
| `TP-GOAL020`-`TP-GOAL022` | Negotiable | 缩减咨询链或重试 |

### 10.5.4 安全错误恢复

| 错误码 | 类别 | 恢复 |
|-------|------|------|
| `TP-SEC001`-`TP-SEC003` | Terminal | 加密参数错误，检查实现 |
| `TP-SEC004` | Terminal | 签名错误，检查密钥 |
| `TP-SEC005` | Terminal | 字段不可披露 |
| `TP-SEC010`-`TP-SEC014` | Negotiable | 重新申请凭证 |
| `TP-SEC011` | Terminal | 凭证已撤销 |
| `TP-SEC020` | Terminal | 审计写入失败，安全策略要求阻止操作 |
| `TP-SEC030` | Terminal | 密钥已撤销，需轮换 |

### 10.5.5 协议协商错误恢复

| 错误码 | 类别 | 恢复 |
|-------|------|------|
| `TP-NEG001`-`TP-NEG002` | Terminal | 修正候选列表后重试 |
| `TP-NEG003` | Negotiable | 增加候选传输方式 |
| `TP-NEG004` | Terminal | 安全级别冲突，无法协作 |
| `TP-NEG005`-`TP-NEG006` | Negotiable | 降级到 tier_3 重试 |
| `TP-NEG010`-`TP-NEG012` | Negotiable | 重新协商契约 |
| `TP-NEG020` | Retriable | 重试，超限后 Terminal |

### 10.5.6 传输绑定错误恢复

| 错误码 | 类别 | 恢复 |
|-------|------|------|
| `TP-TRA001` | Terminal | hop 超限，需直连 |
| `TP-TRA002` | Retriable | 桥接器问题，重试 |
| `TP-TRA010`-`TP-TRA011` | Retriable | 网络超时，重试 |
| `TP-TRA020`-`TP-TRA021` | Negotiable | 协商更换传输方式 |
| `TP-TRA030`-`TP-TRA031` | Terminal | Prompt 模式限制 |

## 10.6 完整错误码索引

### 身份辨识层（TP-ID0XX）

| 码 | 类别 | 描述 |
|----|------|------|
| TP-ID001 | Terminal | FayIdentity 字段缺失或格式错误 |
| TP-ID002 | Retriable | DID 公钥解析失败 |
| TP-ID003 | Terminal | 签名验证失败 |
| TP-ID004 | Retriable | 检测到重放 |
| TP-ID005 | Negotiable | 时间戳超出窗口 |
| TP-ID006 | Terminal | payload.identity 与 sender 不一致 |
| TP-ID007 | Negotiable | HostAuthorization 缺失 |
| TP-ID008 | Negotiable | fp_authorization_ref 无效 |
| TP-ID009 | Negotiable | 操作超出 HostAuthorization 范围 |
| TP-ID010 | Negotiable | 一致性级别声明不匹配 |

### 共享语境层（TP-CTX0XX）

| 码 | 类别 | 描述 |
|----|------|------|
| TP-CTX001 | Terminal | context_id 不存在 |
| TP-CTX002 | Terminal | 非参与方 |
| TP-CTX003 | Terminal | 非法状态转换 |
| TP-CTX004 | Terminal | 终态执行操作 |
| TP-CTX005 | Negotiable | default_policy 拒绝 |
| TP-CTX006 | Negotiable | per_resource 权限不足 |
| TP-CTX007 | Negotiable | time_limited 已过期 |
| TP-CTX008 | Negotiable | suspended 状态写入 |
| TP-CTX011 | Terminal | delegated_access 模式非拥有方写入 |
| TP-CTX012 | Negotiable | 资源数据超大小限制 |
| TP-CTX013 | Negotiable | 校验和不匹配 |
| TP-CTX014 | Negotiable | 挂载点冲突 |
| TP-CTX015 | Negotiable | 资源类型未声明 |
| TP-CTX016 | Negotiable | 资源类型超出授权 |
| TP-CTX020 | Negotiable | 同步冲突 |
| TP-CTX021 | Retriable | 同步版本断层 |

### 目标协商层（TP-GOAL0XX）

| 码 | 类别 | 描述 |
|----|------|------|
| TP-GOAL001 | Terminal | goal_id 不存在或重复 |
| TP-GOAL002 | Negotiable | 参数不符合 schema |
| TP-GOAL003 | Terminal | goal_type 不支持 |
| TP-GOAL004 | Terminal | 状态机非法转换 |
| TP-GOAL005 | Terminal | 协商超过 10 次 |
| TP-GOAL006 | Negotiable | output_schema 缺失或无效 |
| TP-GOAL007 | Terminal | context_ref 不存在或非 active |
| TP-GOAL008 | Terminal | context_ref="none" 但要求审计 |
| TP-GOAL009 | Negotiable | output 不符合 schema |
| TP-GOAL010 | Terminal | DAG 循环依赖 |
| TP-GOAL011 | Terminal | 父级取消 |
| TP-GOAL012 | Negotiable | required 约束不可满足 |
| TP-GOAL020 | Terminal | 咨询链超过 5 跳 |
| TP-GOAL021 | Negotiable | 缺少 authorization_scope |
| TP-GOAL022 | Retriable | 异步咨询超时 |

### 隐私与安全（TP-SEC0XX）

| 码 | 类别 | 描述 |
|----|------|------|
| TP-SEC001 | Terminal | 加密算法不支持 |
| TP-SEC002 | Terminal | 密钥协商失败 |
| TP-SEC003 | Terminal | 解密失败 |
| TP-SEC004 | Terminal | 载荷签名失败 |
| TP-SEC005 | Terminal | 访问未披露字段 |
| TP-SEC010 | Negotiable | 凭证不存在或过期 |
| TP-SEC011 | Terminal | 凭证已撤销 |
| TP-SEC012 | Terminal | holder 不一致 |
| TP-SEC013 | Negotiable | scope 不含操作 |
| TP-SEC014 | Negotiable | scope 不含资源 |
| TP-SEC020 | Terminal | 审计写入失败 |
| TP-SEC030 | Terminal | 密钥已撤销 |

### 协议协商（TP-NEG0XX）

| 码 | 类别 | 描述 |
|----|------|------|
| TP-NEG001 | Terminal | candidate_transports 为空 |
| TP-NEG002 | Terminal | candidate_tiers 为空 |
| TP-NEG003 | Negotiable | 无共同传输 |
| TP-NEG004 | Terminal | 安全级别冲突 |
| TP-NEG005 | Negotiable | tier_1 capability 不一致 |
| TP-NEG006 | Negotiable | tier_2 不支持 |
| TP-NEG010 | Negotiable | 缺少 contract_ref |
| TP-NEG011 | Negotiable | 契约不存在 |
| TP-NEG012 | Negotiable | 契约已过期 |
| TP-NEG020 | Retriable | 协商超时 |

### 传输绑定（TP-TRA0XX）

| 码 | 类别 | 描述 |
|----|------|------|
| TP-TRA001 | Terminal | hop 超过 5 |
| TP-TRA002 | Retriable | 桥接失败 |
| TP-TRA010 | Retriable | WebSocket 心跳超时 |
| TP-TRA011 | Retriable | HTTP 超时 |
| TP-TRA020 | Negotiable | A2A 版本不兼容 |
| TP-TRA021 | Negotiable | MCP 工具不可用 |
| TP-TRA030 | Terminal | Prompt 中无 tp-envelope |
| TP-TRA031 | Terminal | Prompt 不允许加密资源 |

### 数据校验（TP-VAL0XX）

| 码 | 类别 | 描述 |
|----|------|------|
| TP-VAL001 | Terminal | MessageType 枚举值未知 |
| TP-VAL002 | Terminal | payload 不符合 schema |
| TP-VAL003 | Terminal | 含 additionalProperties: false 处出现未知字段 |
| TP-VAL004 | Terminal | 必填字段缺失 |
| TP-VAL005 | Terminal | 字段类型不匹配 |

### 协议版本（TP-VER0XX）

| 码 | 类别 | 描述 |
|----|------|------|
| TP-VER001 | Terminal | 主版本不兼容 |
| TP-VER002 | Negotiable | 次版本超前但可降级 |
| TP-VER003 | Terminal | tp_version 字符串非法 |

### 系统错误（TP-SYS0XX）

| 码 | 类别 | 描述 |
|----|------|------|
| TP-SYS001 | Retriable | 内部超时 |
| TP-SYS002 | Retriable | 资源耗尽（CPU/内存/连接数） |
| TP-SYS003 | Retriable | 上游依赖不可达（FP / SSP / 数据库） |
| TP-SYS004 | Retriable | 限流（rate limit） |
| TP-SYS005 | Terminal | 内部 bug（panic） |
