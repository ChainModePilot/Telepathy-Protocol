# 第 11 章 数据模型

## 11.1 概述

本章是规范文本与 Schema 三件套（`schema/{version}/`）之间的索引桥梁。规范 §04 - §10 描述了**行为**——状态机、流程、约束、错误恢复；本章索引每个数据结构在 Schema 中的精确定义位置，并说明三件套同步规则。

## 11.2 Schema 三件套

每个版本目录包含三个等价表达：

| 文件 | 用途 | 验证工具 |
|------|------|---------|
| `schema.json` | JSON Schema Draft 2020-12 | `ajv`、`jsonschema`、`hyperjump` |
| `schema.ts` | TypeScript 类型定义 | TypeScript 编译器 |
| `schema.mdx` | 人类可读字段文档 | 渲染为静态文档 |

**同步规则**：

- 任何字段添加、删除、类型变更 MUST 同时在三个文件中完成
- `schema.mdx` 中字段顺序 SHOULD 与 `schema.json` 中 `properties` 顺序一致
- 三个文件的 `$id` / 标题 / 版本注释 MUST 一致
- CI 流程 MUST 包含一致性校验（详见 §11.4）

## 11.3 数据结构索引

下表索引每个核心数据结构在规范行为章与 Schema 中的位置。

### 11.3.1 身份辨识层

| 数据结构 | 规范章 | schema.json 路径 | schema.ts 类型名 |
|---------|-------|----------------|----------------|
| `FayIdentity` | §4.2.1 | `$defs.FayIdentity` | `FayIdentity` |
| `DIDIdentifier` | §4.2.2 | `$defs.DIDIdentifier` | `DIDIdentifier` |
| `DIDProof` | §4.2.3 | `$defs.DIDProof` | `DIDProof` |
| `FayProfile` | §4.3 | `$defs.FayProfile` | `FayProfile` |
| `CapabilityDescriptor` | §4.3.4 | `$defs.CapabilityDescriptor` | `CapabilityDescriptor` |
| `SharingWillingness` | §4.3.4 | `$defs.SharingWillingness` | `SharingWillingness` |
| `FayStatus` | §4.3.4 | `$defs.FayStatus` | `FayStatus` |
| `HostAuthorization` | §4.4 | `$defs.HostAuthorization` | `HostAuthorization` |
| `AuthorizationRestriction` | §4.4 | `$defs.AuthorizationRestriction` | `AuthorizationRestriction` |

### 11.3.2 共享语境层

| 数据结构 | 规范章 | schema.json 路径 | schema.ts 类型名 |
|---------|-------|----------------|----------------|
| `SharedContext` | §5.2、§5.3 | `$defs.SharedContext` | `SharedContext` |
| `MountedResource` | §5.4.3 | `$defs.MountedResource` | `MountedResource` |
| `ResourcePermissions` | §5.5 | `$defs.ResourcePermissions` | `ResourcePermissions` |
| `AccessControlList` | §5.5.1 | `$defs.AccessControlList` | `AccessControlList` |
| `ContextLifecycle` | §5.3 | `$defs.ContextLifecycle` | `ContextLifecycle` |
| `SyncState` | §5.6.1 | `$defs.SyncState` | `SyncState` |
| `CognitiveResource` | §5.4 | `$defs.CognitiveResource` | `CognitiveResource` |
| `CognitiveResourceType` | §5.4.1 | `$defs.CognitiveResourceType` | `CognitiveResourceType` |
| `InlineContent` | §5.4.2 | `$defs.InlineContent` | `InlineContent` |
| `ReferenceContent` | §5.4.2 | `$defs.ReferenceContent` | `ReferenceContent` |
| `ResourceAccessPolicy` | §5.4 | `$defs.ResourceAccessPolicy` | `ResourceAccessPolicy` |
| `ResourceMetadata` | §5.4 | `$defs.ResourceMetadata` | `ResourceMetadata` |

### 11.3.3 目标协商层

| 数据结构 | 规范章 | schema.json 路径 | schema.ts 类型名 |
|---------|-------|----------------|----------------|
| `Goal` | §6.3、§6.4 | `$defs.Goal` | `Goal` |
| `GoalType` | §6.2 | `$defs.GoalType` | `GoalType` |
| `GoalStatus` | §6.3.1 | `$defs.GoalStatus` | `GoalStatus` |
| `GoalDescription` | §6.4.1 | `$defs.GoalDescription` | `GoalDescription` |
| `TypedParameters` | §6.4.1 | `$defs.TypedParameters` | `TypedParameters` |
| `GoalConstraint` | §6.4.1 | `$defs.GoalConstraint` | `GoalConstraint` |
| `SubGoalReference` | §6.5 | `$defs.SubGoalReference` | `SubGoalReference` |
| `GoalResult` | §6.4.5 | `$defs.GoalResult` | `GoalResult` |
| `GoalError` | §6.4.5 | `$defs.GoalError` | `GoalError` |
| `ConsultationRequest` | §6.6 | `$defs.ConsultationRequest` | `ConsultationRequest` |
| `ConsultationResponse` | §6.6 | `$defs.ConsultationResponse` | `ConsultationResponse` |
| `AuthorizationScope` | §6.6.2 | `$defs.AuthorizationScope` | `AuthorizationScope` |
| `HostDelegation` | §6.6.2 | `$defs.HostDelegation` | `HostDelegation` |
| `CallbackConfig` | §6.6.3 | `$defs.CallbackConfig` | `CallbackConfig` |
| `RetryPolicy` | §6.6.3 | `$defs.RetryPolicy` | `RetryPolicy` |

### 11.3.4 隐私与安全

| 数据结构 | 规范章 | schema.json 路径 | schema.ts 类型名 |
|---------|-------|----------------|----------------|
| `EncryptedPayload` | §7.2.3 | `$defs.EncryptedPayload` | `EncryptedPayload` |
| `KeyExchangeInfo` | §7.2.3 | `$defs.KeyExchangeInfo` | `KeyExchangeInfo` |
| `SelectiveDisclosure` | §7.3 | `$defs.SelectiveDisclosure` | `SelectiveDisclosure` |
| `CallbackCredential` | §7.4 | `$defs.CallbackCredential` | `CallbackCredential` |
| `CredentialScope` | §7.4.2 | `$defs.CredentialScope` | `CredentialScope` |

### 11.3.5 协议协商

| 数据结构 | 规范章 | schema.json 路径 | schema.ts 类型名 |
|---------|-------|----------------|----------------|
| `ProtocolContract` | §8.3 | `$defs.ProtocolContract` | `ProtocolContract` |
| `CommunicationTier` | §8.2 | `$defs.CommunicationTier` | `CommunicationTier` |
| `TransportMethod` | §8.3.1 | `$defs.TransportMethod` | `TransportMethod` |
| `NegotiationStep` | §8.3.1 | `$defs.NegotiationStep` | `NegotiationStep` |

### 11.3.6 消息信封与跨切

| 数据结构 | 规范章 | schema.json 路径 | schema.ts 类型名 |
|---------|-------|----------------|----------------|
| `MessageEnvelope` | §3.3 | `$defs.MessageEnvelope` | `MessageEnvelope` |
| `MessageType` | §3.3 | `$defs.MessageType` | `MessageType` |
| `TraceInfo` | §9.7 | `$defs.TraceInfo` | `TraceInfo` |
| `TPError` | §10.3 | `$defs.TPError` | `TPError` |

## 11.4 一致性校验

### 11.4.1 校验规则

实现的 CI MUST 校验以下属性：

1. **结构同构**：`schema.json` 中每个 `$defs.X` 在 `schema.ts` 中有对应 `interface X` 或 `type X`
2. **字段对齐**：每个字段在三个文件中名称、类型、必填性一致
3. **枚举对齐**：每个枚举（如 `MessageType`）在 JSON 与 TS 中值集相同
4. **文档完整**：`schema.mdx` 为每个 `$defs.X` 提供条目

### 11.4.2 校验工具

参考实现可使用：

- `jsonschema` Python 库或 `ajv` Node.js 库 → 验证 schema.json 格式
- TypeScript 编译器 → 验证 schema.ts 语法
- 自研脚本 → 比对 JSON 与 TS 的结构等价性
- Markdown 解析器 → 检查 schema.mdx 条目覆盖率

`tp_full` 实现 SHOULD 在 CI 中跑这些校验；`tp_core` 与 `tp_secure` MAY 跳过但 SHOULD 在发布前手动审查。

## 11.5 版本与变更追踪

### 11.5.1 版本目录

Schema 版本以发布日期命名：

```
schema/
├── draft/             # 工作中，允许不兼容变更
├── 2025-10-25/        # 第一个正式版本（计划）
├── {YYYY-MM-DD}/      # 后续版本
└── CHANGELOG.md       # 跨版本变更日志
```

### 11.5.2 CHANGELOG 格式

`schema/CHANGELOG.md` 按版本倒序列出，每个版本下：

- 版本号 + 发布日期
- `Added` / `Changed` / `Deprecated` / `Removed` / `Fixed` / `Security` 分类的变更项
- 每项 MUST 引用受影响的 `$defs` 名称

### 11.5.3 弃用流程

字段从首次声明弃用到移除 MUST 经过：

| 阶段 | 时长 | 标记 |
|------|------|------|
| 弃用声明 | ≥ 1 个次版本 | `schema.mdx` 标 `[DEPRECATED]` |
| 观察期 | ≥ 1 个次版本 | 字段仍可用，但 SHOULD 不使用 |
| 移除 | 主版本变更 | 从三件套删除 |

详见 §02.5。

## 11.6 跨语言绑定建议

虽然规范本身只要求 JSON 与 TypeScript 两种表示，社区可基于 `schema.json` 自动生成其他语言绑定：

| 语言 | 推荐工具 |
|------|---------|
| Python | `datamodel-code-generator`、`pydantic` |
| Go | `quicktype`、`go-jsonschema` |
| Rust | `typify`、`schemars` |
| Java | `jsonschema2pojo` |

实现 MUST 保证生成的绑定与 `schema.json` 字段名/类型一致；不一致的实现 MUST 在文档中明确说明差异。

## 11.7 数据契约的事实标准

当本规范文本（`docs/{lang}/specification/`）与 Schema 之间出现冲突时：

- **Schema 是数据契约的事实标准**——字段、类型、必填性以 Schema 为准
- **规范是行为契约的事实标准**——状态机、流程、约束、错误恢复以规范为准
- 任一方发现冲突 MUST 通过 GitHub Issue 报告，由 RFC 流程裁决修正方向

详见 §1.7。
