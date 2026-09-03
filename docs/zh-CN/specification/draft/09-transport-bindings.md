# 第 09 章 传输绑定

## 9.1 概述

TP 是**传输无关**的——`MessageEnvelope` 可以承载于多种底层协议。本章规定五种传输绑定：

- 原生 TP（`native_tp`）——基于 WebSocket 或 HTTP/2（§9.2）
- A2A JSON-RPC（`a2a_jsonrpc`）——通过 A2A 协议传递（§9.3）
- MCP Tool Call（`mcp_tool_call`）——封装为 MCP 工具调用（§9.4）
- REST API（`rest_api`）——通过 HTTP 请求体（§9.5）
- Prompt Embedding（`prompt_embedding`）——嵌入自然语言 Prompt（§9.6）

每种绑定 MUST 保持 `MessageEnvelope` 语义不变，只改变传输形式。

## 9.2 原生 TP

### 9.2.1 端点形式

`native_tp` 是 TP 的首选传输。`tp_core` 起 MUST 支持。两种模式：

| 模式 | 端点 | 适用 |
|------|------|------|
| WebSocket | `wss://{host}/tp/v1` | 长会话、双向推送 |
| HTTP/2 | `https://{host}/tp/v1` | 短交互、负载均衡场景 |

### 9.2.2 WebSocket 模式

握手与帧格式：

- WebSocket 子协议名：`tp.v1`
- 单帧 = 单条 `MessageEnvelope`，编码为 UTF-8 JSON
- 推荐使用 `permessage-deflate` 压缩
- 关闭码：`1000` 正常、`1008` 协议错误（携带 `TPError`）

心跳：

- 服务端 MUST 每 30 秒发送 WebSocket Ping
- 客户端 MUST 在 10 秒内回 Pong
- 连续 2 次 Pong 超时 MUST 关闭连接，关闭码 `1008`

### 9.2.3 HTTP/2 模式

每个 `MessageEnvelope` 通过单个 HTTP/2 请求传递：

```
POST /tp/v1 HTTP/2
Content-Type: application/tp+json
TP-Contract-Ref: <contract_id>
TP-Message-Id: <message_id>

{ /* MessageEnvelope */ }
```

响应：

- 200 OK + `MessageEnvelope`（响应消息）
- 202 Accepted（异步处理；后续通过 callback 或下次轮询）
- 4xx/5xx + `TPError`

服务端 MAY 使用 HTTP/2 Server Push 推送多条消息。客户端 SHOULD 实现长轮询作为兜底。

## 9.3 A2A JSON-RPC 绑定

### 9.3.1 映射规则

A2A 是 Google 发布的 Agent 间通信协议。TP 通过 A2A 传递时：

| TP 概念 | A2A 概念 | 映射 |
|--------|---------|------|
| `MessageEnvelope` | A2A Message | TP 信封作为 A2A Message 的 `body` |
| `Goal` (proposed) | A2A Task | TP Goal 转换为 A2A Task |
| `MessageType` | JSON-RPC method | 见 §9.3.2 |
| `FayIdentity` | A2A AgentCard | A2A 的 AgentCard 通过 `metadata` 字段携带 TP 身份 |

### 9.3.2 方法名映射

| TP MessageType | A2A JSON-RPC method |
|----------------|----------------------|
| `identity_proof` | `tp.identity.proof` |
| `profile_exchange` | `tp.profile.exchange` |
| `negotiate_request` | `tp.negotiate.request` |
| `negotiate_response` | `tp.negotiate.response` |
| `context_create` | `tp.context.create` |
| `context_update` | `tp.context.update` |
| `context_sync` | `tp.context.sync` |
| `context_revoke` | `tp.context.revoke` |
| `resource_mount` | `tp.resource.mount` |
| `resource_unmount` | `tp.resource.unmount` |
| `resource_notify` | `tp.resource.notify` |
| `goal_propose` | `tp.goal.propose` |
| `goal_negotiate` | `tp.goal.negotiate` |
| `goal_accept` | `tp.goal.accept` |
| `goal_reject` | `tp.goal.reject` |
| `goal_result` | `tp.goal.result` |
| `consultation_request` | `tp.consultation.request` |
| `consultation_response` | `tp.consultation.response` |
| `error` | `tp.error` |

### 9.3.3 请求示例

```json
{
  "jsonrpc": "2.0",
  "id": "<correlation>",
  "method": "tp.goal.propose",
  "params": {
    "tp_envelope": { /* 完整 MessageEnvelope */ }
  }
}
```

### 9.3.4 字段保留

A2A 桥接时 TP 的扩展字段（`protocol_contract_ref`、`trace_info`）MUST 完整保留在 `tp_envelope` 中。A2A 桥接器 MUST NOT 修改 TP 信封内容——签名验证依赖原始字节。

`tp_full` 必备。

## 9.4 MCP Tool Call 绑定

### 9.4.1 映射规则

MCP（Model Context Protocol）由 Anthropic 发布，是 AI 模型调用工具的协议。TP over MCP 时：

- TP 端点暴露为 MCP 工具集
- 每个 `MessageType` 映射为一个 MCP tool
- TP `MessageEnvelope` 作为 tool 的 input 参数

### 9.4.2 工具命名

工具名约定：`tp_<message_type>`，例如 `tp_goal_propose`、`tp_resource_mount`。

工具 schema：

```json
{
  "name": "tp_goal_propose",
  "description": "Propose a Goal via Telepathy Protocol",
  "input_schema": {
    "type": "object",
    "properties": {
      "tp_envelope": {
        "type": "object",
        "description": "Complete TP MessageEnvelope"
      }
    },
    "required": ["tp_envelope"]
  }
}
```

### 9.4.3 双向通信

MCP 通信方向是单向的（AI 模型 → 工具）。TP over MCP 的反向通信通过：

- **轮询**：定义 `tp_poll_messages` 工具，AI 主动查询是否有待收消息
- **回调注册**：定义 `tp_register_callback` 工具，让响应消息通过预注册的 webhook 推送

`tp_full` 必备。

## 9.5 REST API 绑定

### 9.5.1 映射规则

REST API 绑定将每个 `MessageType` 映射为 HTTP 端点：

```
POST /tp/v1/identity/proof          → identity_proof
POST /tp/v1/profile/exchange        → profile_exchange
POST /tp/v1/negotiate/request       → negotiate_request
POST /tp/v1/negotiate/response      → negotiate_response
POST /tp/v1/context/create          → context_create
POST /tp/v1/context/{id}/update     → context_update
POST /tp/v1/context/{id}/sync       → context_sync
POST /tp/v1/context/{id}/revoke     → context_revoke
POST /tp/v1/resource/mount          → resource_mount
POST /tp/v1/resource/unmount        → resource_unmount
POST /tp/v1/resource/notify         → resource_notify
POST /tp/v1/goal/propose            → goal_propose
POST /tp/v1/goal/{id}/negotiate     → goal_negotiate
POST /tp/v1/goal/{id}/accept        → goal_accept
POST /tp/v1/goal/{id}/reject        → goal_reject
POST /tp/v1/goal/{id}/result        → goal_result
POST /tp/v1/consultation/request    → consultation_request
POST /tp/v1/consultation/{id}/response → consultation_response
```

### 9.5.2 请求格式

请求体始终是完整的 `MessageEnvelope`：

```
POST /tp/v1/goal/propose HTTP/1.1
Host: hospital-east.gov.cn
Content-Type: application/tp+json
TP-Version: 1.0.0
TP-Contract-Ref: <contract_id>

{ /* MessageEnvelope */ }
```

响应体：

- 200 OK + `MessageEnvelope`（同步响应）
- 202 Accepted + `{"correlation_id": "..."}`（异步，后续通过 webhook 或轮询）
- 4xx/5xx + `TPError`

### 9.5.3 反向消息

REST 是请求-响应模式，响应方推送消息给发起方需要：

- 发起方在 `negotiate_request` 中提供 webhook URL
- 响应方通过 POST 该 URL 推送消息
- webhook 端点 MUST 用相同的 TP 签名机制验证调用方

`tp_full` SHOULD 支持。

## 9.6 Prompt Embedding 绑定

### 9.6.1 适用场景

Prompt Embedding 是最终降级手段：当一方完全无法解析结构化 TP 消息时（例如纯文本 LLM 接口），TP 消息以特殊格式嵌入自然语言 Prompt。

仅适用于 `tier_3_natural_language` 通信级别。

### 9.6.2 嵌入格式

TP 消息以 fenced code block 包裹，前后附自然语言上下文：

```
我（fay:patient-zhang-3389，iFay）希望按 Telepathy Protocol 与你协作。
请处理以下 TP 消息：

```tp-envelope
{
  "tp_version": "1.0.0",
  "message_id": "...",
  /* 完整 MessageEnvelope */
}
```

如你支持 TP，请以同样格式回复一个 TP 消息。
否则请以自然语言说明无法处理的原因。
```

### 9.6.3 解析与生成

接收方（如另一个 LLM）：

- MUST 识别 `\`\`\`tp-envelope` 代码块
- MUST 解析其中的 JSON 为 `MessageEnvelope`
- MUST 按 §9.6.2 格式生成响应

实现 SHOULD：

- 在 Prompt 前缀提供 TP 协议简要说明（500 字内）
- 在解析失败时降级为自然语言对话，而非直接报错

### 9.6.4 安全考量

Prompt Embedding 模式的安全级别 MUST 限制为 `basic`：

- 无 TLS 保证（取决于承载渠道）
- 签名 MAY 失效（LLM 可能重新生成内容导致字节变化）
- 不适用于人类原型隐私数据

实现 MUST 在使用此绑定时拒绝任何 `requires_encryption: true` 的资源传输。

`tp_full` SHOULD 支持。

## 9.7 跨协议追踪

当消息跨越多个传输绑定（例如 TP-A2A-MCP）时，每跳 MUST 更新 `MessageEnvelope.trace_info`：

```json
{
  "trace_info": {
    "original_protocol": "native_tp",
    "original_message_id": "<最初的 message_id>",
    "hop_count": 2
  }
}
```

`hop_count` MUST ≤ 5；超过 MUST 拒绝并返回 `TP-TRA001`。

## 9.8 桥接器要求

桥接器（在两种传输间转换 TP 消息的中间件）MUST：

1. 完整保留 `MessageEnvelope` 字节内容用于签名验证
2. 更新 `trace_info`
3. 不修改 `payload`、`signature`、`sender`、`receiver`
4. 在审计日志记录桥接事件
5. 失败时返回 `TP-TRA002` 给发起方

## 9.9 传输绑定错误码

| 错误码 | 触发条件 |
|-------|---------|
| `TP-TRA001` | `hop_count` 超过 5 |
| `TP-TRA002` | 桥接失败 |
| `TP-TRA010` | WebSocket 心跳超时 |
| `TP-TRA011` | HTTP 超时 |
| `TP-TRA020` | A2A 桥接器版本不兼容 |
| `TP-TRA021` | MCP 工具不可用 |
| `TP-TRA030` | Prompt 中无法识别 tp-envelope 代码块 |
| `TP-TRA031` | Prompt Embedding 不允许传输加密资源 |
