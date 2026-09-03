# 第 12 章 术语表

本章规范化定义本规范中使用的所有专有术语。术语首次出现时 SHOULD 链接到本章。术语首字母大写形式为规范术语；小写形式为普通词。

## 12.1 核心实体

### Fay

参与 Telepathy Protocol 通信的基本实体。每个 Fay 代表某个**人类原型**（个人或组织）行事，分两类：

- **iFay**：代表个人的人类原型
- **coFay**：承担社会公共职能的服务型 Fay（医院、银行、社保机构等）

详见 §04 与蓝图第 1 章。

### iFay

代表个人人类原型的 Fay。每个 iFay MUST 有 `host_id` 指向其人类原型。

### coFay

承担社会公共职能或组织级业务的 Fay。MAY 不绑定单一 `host_id`。

### Human Prime（人类原型）

Fay 所代表的真实人类或组织。通过 FP（Faying Protocol）与 iFay 建立绑定。蓝图第 1 章详述。

### Host（DID 上下文中的「宿主」）

注：在 TP 规范的早期版本中，「Host」一词曾用于指代「人类原型」。当前版本统一使用「Human Prime / 人类原型」。**仅当出现在 MCP 架构 `Host → Client → Server` 模型中时**，"Host" 仍保留 MCP 原义，与 TP 的 Human Prime 概念无关。

## 12.2 协议层概念

### TP / Telepathy Protocol

本规范定义的认知共享协议，是 iFay 协议族中 Fay ↔ Fay 通信的协议。

### 三层架构

TP 的核心架构由三层组成（详见 §3.1）：

- **身份辨识层（Identity Recognition Layer）**——回答「你是谁？你代表谁？」
- **认知分享层（Cognitive Sharing Layer）**——回答「我们共享什么？」
- **目标协商层（Goal Negotiation Layer）**——回答「我们要一起做什么？」

### 横切关注点（Cross-Cutting Concern）

贯穿三层的辅助机制：隐私与安全（§07）、协议协商（§08）、错误处理（§10）。

### 一致性级别（Conformance Level）

实现支持的功能集级别（详见 §02.2）：

- `tp_core`——最小可互操作实现
- `tp_secure`——生产可用、保护人类原型隐私
- `tp_full`——完整实现，覆盖全部可选能力

## 12.3 身份辨识层

### FayIdentity

Fay 的全局唯一身份标识，包含 `fay_id`、`fay_type`、`host_id`、`did`。

### FayProfile

Fay 在会话建立时交换的「名片」，包含身份、能力、共享意愿、状态、人类原型授权。

### DID（Decentralized Identifier）

去中心化标识符。TP 支持三级方法：`did:key`（低）、`did:web`（中）、`did:chain`（高）。

### HostAuthorization

人类原型授予 Fay 的「电子委托书」。引用 FP 协议授权（`fp_authorization_ref`），声明授权范围、操作类型、时长限制。

### Capability / CapabilityDescriptor

Fay 提供的能力描述，包含输入/输出 schema、访问级别、版本。

## 12.4 认知分享层

### SharedContext

「共享语境」——认知资源的临时挂载空间。是 TP 的灵魂概念，对应蓝图中的「心灵感应空间」。

### Cognitive Resource（认知资源）

可共享的认知单元，分四类：

- `memory_fragment`——会话级部分长期记忆
- `view_state`——界面/数据视图状态
- `reasoning_engine`——推理逻辑与决策规则
- `environment_context`——动态环境信息

### Mounted Resource

已挂载到 SharedContext 的认知资源，附带挂载点路径与权限。

### 共享模式（Sharing Mode）

SharedContext 的两种语义：

- `delegated_access`——拥有方保留权威，他方通过受控接口访问
- `collaborative_space`——多方共同维护，通过同步机制保持一致

### ACL（Access Control List）

SharedContext 的访问控制配置，含默认策略与按资源覆盖。

### Sync State / 冲突解决

SharedContext 的同步状态与冲突策略（`last_writer_wins` / `crdt` / `operational_transform`）。

## 12.5 目标协商层

### Goal

结构化协作目标，统一了传统协议中分裂的「Intent」与「Task」。

### Goal Type

Goal 的六种类型：`query` / `execute` / `notify` / `subscribe` / `delegate` / `consult`。

### Goal Status

Goal 的状态机：`proposed` → `negotiating` → `accepted` → `in_progress` → `completed` / `failed` / `cancelled` / `rejected`。

### Sub-Goal DAG

Goal 的子目标依赖图，MUST 是有向无环图（Directed Acyclic Graph）。

### Consultation（咨询）

特殊的 Goal 类型（`goal_type = consult`），用于跨方授权数据访问。详见 §6.6。

### CallbackCredential

回调凭证——TP 的「电子授权委托书」。有时效、有范围、可撤销、可审计。详见 §7.4。

## 12.6 隐私与安全

### EncryptedPayload

加密载荷，用于传输人类原型隐私数据。详见 §7.2。

### Selective Disclosure（选择性披露）

数据所有者声明仅特定字段对接收方可见的机制。详见 §7.3。

### 端到端加密（E2EE）

发送方到接收方之间数据全程加密，中间节点无法解密。

### 审计日志（Audit Log）

不可篡改的操作记录。详见 §7.5。

## 12.7 协议协商

### ProtocolContract

协议协商的产物，固化双方约定的传输方式、通信级别、安全级别。

### Communication Tier（通信级别）

三级语言能力（详见 §8.2）：

- `tier_1_standardized`——预约定参数表，最高效率
- `tier_2_ai_generated`——AI 生成例程，中等效率
- `tier_3_natural_language`——自然语言兜底，最高灵活

### Transport Method（传输方式）

承载 TP 消息的底层协议：`native_tp` / `a2a_jsonrpc` / `mcp_tool_call` / `rest_api` / `prompt_embedding`。

### 降级策略（Downgrade Policy）

协商失败时双方达成更低能力级别的协议。安全级别 MUST NOT 隐式降级（§8.4.4）。

## 12.8 消息信封与传输

### MessageEnvelope

所有 TP 通信的统一外层结构。传输无关，可承载于任何受支持的传输方式。

### Message Type

`MessageType` 枚举的取值，区分不同消息载荷类型。19 个值，见 §3.3 与 schema。

### Correlation ID

请求-响应配对标识，使用原请求的 `message_id`。

### Trace Info

跨协议追踪信息。每跳传输绑定 MUST 更新 `hop_count`。

### Bridge / Bridging（桥接）

将 TP 消息从一种传输方式转换到另一种的中间件操作。详见 §9.8。

## 12.9 姊妹协议

### FP（Faying Protocol）

人类原型 ↔ iFay 的身份绑定协议。TP 中通过 `fp_authorization_ref` 引用其授权。

### ICP（Interactive Conversation Protocol）

人 ↔ Fay 的自然语言交互协议。

### CAP（Control Authority Protocol）

Fay → 硬件/客户端的接管协议。

### SSP（Skill Sharing Protocol）

Fay 技能发现协议。

### DTP（Data Tunnel Protocol）

硬件/OS → Fay 的数据通道协议。

### A2A（Agent-to-Agent Protocol）

Google 发布的 Agent 间任务委派协议。TP 可承载于 A2A（详见 §9.3）。

### MCP（Model Context Protocol）

Anthropic 发布的 AI 模型与外部工具连接协议。TP 可承载于 MCP（详见 §9.4）。

## 12.10 规范性术语

### MUST / MUST NOT / SHOULD / SHOULD NOT / MAY

按 [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) / [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) 解释。详见 §2.1。

### Conformance（一致性 / 合规性）

实现满足规范要求的程度。一致性级别由 `FayProfile.conformance_level` 声明。

### Interoperability（互操作性）

不同实现之间能正确通信的能力。详见 §2.3。

## 12.11 错误处理

### TPError

统一错误结构。详见 §10.3。

### Recoverability（可恢复性）

错误的恢复分类：

- `Retriable`——可重试
- `Negotiable`——需协商
- `Terminal`——终态

详见 §10.4。

### Error Code

错误码格式 `TP-<CATEGORY><NUMBER>`。完整索引见 §10.6。

## 12.12 缩略语索引

| 缩略语 | 全称 |
|-------|------|
| TP | Telepathy Protocol |
| FP | Faying Protocol |
| ICP | Interactive Conversation Protocol |
| CAP | Control Authority Protocol |
| SSP | Skill Sharing Protocol |
| DTP | Data Tunnel Protocol |
| A2A | Agent-to-Agent Protocol |
| MCP | Model Context Protocol |
| DID | Decentralized Identifier |
| ACL | Access Control List |
| DAG | Directed Acyclic Graph |
| E2EE | End-to-End Encryption |
| HKDF | HMAC-based Key Derivation Function |
| CRDT | Conflict-free Replicated Data Type |
| OT | Operational Transform |
| SemVer | Semantic Versioning |
| RFC | Request for Comments |
| TLS | Transport Layer Security |
| HSM | Hardware Security Module |
| TEE | Trusted Execution Environment |
| SIEM | Security Information and Event Management |
| CRL | Certificate Revocation List |
| OCSP | Online Certificate Status Protocol |
| URI | Uniform Resource Identifier |
| UUID | Universally Unique Identifier |

## 12.13 引用规范

本规范引用以下外部规范：

- **RFC 2119** Key words for use in RFCs to Indicate Requirement Levels — https://www.rfc-editor.org/rfc/rfc2119
- **RFC 8174** Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words — https://www.rfc-editor.org/rfc/rfc8174
- **RFC 8785** JSON Canonicalization Scheme (JCS) — https://www.rfc-editor.org/rfc/rfc8785
- **JSON Schema Draft 2020-12** — https://json-schema.org/draft/2020-12/release-notes
- **W3C DID Core** Decentralized Identifiers v1.0 — https://www.w3.org/TR/did-core/
- **Ed25519Signature2020** — https://w3c-ccg.github.io/lds-ed25519-2020/
- **SemVer 2.0.0** Semantic Versioning — https://semver.org/spec/v2.0.0.html
- **Keep a Changelog 1.1.0** — https://keepachangelog.com/en/1.1.0/

姊妹协议规范（独立维护）：

- **A2A** Agent-to-Agent Protocol — Google
- **MCP** Model Context Protocol — Anthropic

iFay 协议族其他成员（FP/ICP/CAP/SSP/DTP）的规范在各自 spec 中维护。
