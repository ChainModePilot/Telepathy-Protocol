// Copyright (c) iFay Contributors. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.

/**
 * Telepathy Protocol (TP) — TypeScript Type Definitions (Draft)
 *
 * These types correspond 1-to-1 with the JSON Schema definitions in schema.json.
 * Required / optional modifiers are consistent with the JSON Schema "required" arrays.
 *
 * Organized by the three-layer architecture:
 *   1. 身份辨识层 (Identity Recognition Layer)
 *   2. 认知分享层 (Cognitive Sharing Layer)
 *   3. 目标协商层 (Goal Negotiation Layer)
 *   + 协议协商 (Protocol Negotiation)
 *   + 消息信封与传输 (Message Envelope & Transport)
 *   + 错误处理 (Error Handling)
 */

// ---------------------------------------------------------------------------
// Primitives & Aliases
// ---------------------------------------------------------------------------

/** Opaque JSON Schema object. */
export type JSONSchema = Record<string, unknown>;

// ===========================================================================
// 身份辨识层 Identity Recognition Layer
// ===========================================================================

// ---------------------------------------------------------------------------
// FayIdentity — Fay 身份标识
// ---------------------------------------------------------------------------

export interface FayIdentity {
  fay_id: string;                    // 全局唯一标识符
  fay_type: "iFay" | "coFay";       // Fay 类型
  host_id?: string;                  // 宿主标识（iFay 时 MUST 存在）
  did: DIDIdentifier;               // DID 标识符
}

export interface DIDIdentifier {
  method: "did:key" | "did:web" | "did:chain";  // DID 方法
  value: string;                     // DID 值
  proof: DIDProof;                   // DID 证明
}

export interface DIDProof {
  type: "Ed25519Signature2020" | "EcdsaSecp256k1Signature2019";
  created: string;                   // ISO 8601
  verification_method: string;       // 验证方法 URI
  proof_value: string;               // Base64 编码的签名
}

// ---------------------------------------------------------------------------
// FayProfile — Fay 档案
// ---------------------------------------------------------------------------

export interface FayProfile {
  identity: FayIdentity;             // 身份引用
  capabilities: CapabilityDescriptor[];  // 能力描述列表
  sharing_willingness: SharingWillingness;  // 共享意愿
  status: FayStatus;                 // 当前运行状态
  host_authorization: HostAuthorization;  // 宿主授权边界
  conformance_level?: "tp_core" | "tp_secure" | "tp_full";  // 一致性级别声明
  json_ld_context?: string;          // 可选 JSON-LD 语义标注
}

export interface CapabilityDescriptor {
  capability_id: string;
  name: string;
  version: string;                   // semver
  input_schema: JSONSchema;
  output_schema: JSONSchema;
  access_level: "public" | "authenticated" | "authorized" | "host_delegated";
  description?: string;
  tags?: string[];                   // 语义标签
}

export interface SharingWillingness {
  shareable_resource_types: CognitiveResourceType[];  // 愿意共享的资源类型
  preferred_mode: "delegated_access" | "collaborative_space" | "both";
  max_concurrent_contexts: number;   // 最大并发共享语境数
}

export interface FayStatus {
  availability: "online" | "busy" | "away" | "offline";
  current_contexts: number;          // 当前活跃共享语境数
  last_active: string;               // ISO 8601
}

export interface HostAuthorization {
  fp_authorization_ref: string;      // FP 协议授权引用
  authorized_resource_types: CognitiveResourceType[];
  authorized_operations: string[];
  max_sharing_duration: string;      // ISO 8601 duration
  restrictions: AuthorizationRestriction[];
}

export interface AuthorizationRestriction {
  restriction_type: string;          // 如 "no_medical_data", "no_financial_data"
  description: string;
}

// ===========================================================================
// 认知分享层 Cognitive Sharing Layer
// ===========================================================================

// ---------------------------------------------------------------------------
// SharedContext — 共享语境
// ---------------------------------------------------------------------------

export interface SharedContext {
  context_id: string;                // 全局唯一标识符
  participants: FayIdentity[];       // 参与方
  mode: "delegated_access" | "collaborative_space";  // 共享模式
  mounted_resources: MountedResource[];  // 已挂载的认知资源
  access_control: AccessControlList;  // 访问控制
  lifecycle: ContextLifecycle;       // 生命周期
  sync_state: SyncState;            // 同步状态
}

export interface MountedResource {
  resource: CognitiveResource;       // 认知资源引用
  mount_point: string;               // 挂载点路径
  owner_fay_id: string;              // 资源所有者
  permissions: ResourcePermissions;  // 权限
}

export interface ResourcePermissions {
  [fay_id: string]: {
    read: boolean;
    write: boolean;
    time_limited?: string;           // ISO 8601 duration
  };
}

export interface AccessControlList {
  default_policy: "deny_all" | "read_only" | "read_write";
  per_resource_overrides: ResourcePermissions[];
}

export interface ContextLifecycle {
  state: "proposed" | "active" | "suspended" | "expired" | "revoked";
  creation_time: string;             // ISO 8601
  expiration?: string;               // ISO 8601（时间过期）
  expiration_event?: string;         // 事件过期条件
  revocation_reason?: string;
  last_state_change: string;         // ISO 8601
}

export interface SyncState {
  version: number;                   // 单调递增版本号
  last_sync_time: string;           // ISO 8601
  conflict_resolution: "last_writer_wins" | "crdt" | "operational_transform";
  pending_changes: number;
}

// ---------------------------------------------------------------------------
// CognitiveResource — 认知资源
// ---------------------------------------------------------------------------

export type CognitiveResourceType =
  | "memory_fragment"      // 会话级部分长期记忆
  | "view_state"           // 界面/数据视图的实时状态
  | "reasoning_engine"     // 推理逻辑和决策规则
  | "environment_context"; // 动态环境信息

export interface CognitiveResource {
  resource_id: string;               // 唯一标识符
  resource_type: CognitiveResourceType;
  content_ref: InlineContent | ReferenceContent;  // 内容引用
  access_policy: ResourceAccessPolicy;
  schema_ref: string;                // 资源结构 Schema 引用
  metadata: ResourceMetadata;
}

// 小数据嵌入（推荐 < 64KB）
export interface InlineContent {
  mode: "inline";
  data: unknown;                     // 直接嵌入的数据
  size_bytes: number;
}

// 大数据 URI 引用（> 64KB MUST 使用）
export interface ReferenceContent {
  mode: "reference";
  uri: string;                       // 资源 URI
  content_type: string;              // MIME type
  size_bytes: number;
  checksum?: string;                 // SHA-256
}

export interface ResourceAccessPolicy {
  owner_fay_id: string;
  visibility: "private" | "shared" | "public";
  requires_encryption: boolean;
}

export interface ResourceMetadata {
  created_at: string;                // ISO 8601
  updated_at: string;               // ISO 8601
  version: number;
  description?: string;
}

// ---------------------------------------------------------------------------
// 隐私保护体系 Privacy Protection
// ---------------------------------------------------------------------------

export interface EncryptedPayload {
  encryption_algorithm: "AES-256-GCM" | "ChaCha20-Poly1305";
  encrypted_data: string;            // Base64
  key_exchange_info: KeyExchangeInfo;
  selective_disclosure?: SelectiveDisclosure;
  audit_ref: string;                 // 审计记录引用
}

export interface KeyExchangeInfo {
  method: "ECDH-P256" | "X25519";
  public_key: string;                // Base64
  encrypted_session_key: string;
}

export interface SelectiveDisclosure {
  disclosed_fields: string[];        // 允许披露的字段路径
  policy_ref?: string;
}

// ---------------------------------------------------------------------------
// 凭证 Credentials
// ---------------------------------------------------------------------------

export interface CallbackCredential {
  credential_id: string;
  scope: CredentialScope;
  expiration: string;                // ISO 8601
  resource_reference: string;
  issuer_fay_id: string;
  encrypted_token: string;
  revocation_endpoint?: string;
}

export interface CredentialScope {
  resources: string[];               // 可访问资源列表（minItems: 1）
  operations: string[];              // 允许操作列表（minItems: 1）
  constraints?: Record<string, unknown>;
}

// ===========================================================================
// 目标协商层 Goal Negotiation Layer
// ===========================================================================

// ---------------------------------------------------------------------------
// Goal — 结构化协作目标
// ---------------------------------------------------------------------------

export type GoalType =
  | "query"       // 查询
  | "execute"     // 执行
  | "subscribe"   // 订阅
  | "notify"      // 通知
  | "delegate"    // 委托
  | "consult";    // 咨询

export type GoalStatus =
  | "proposed"
  | "negotiating"
  | "accepted"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled"
  | "rejected";

export interface Goal {
  goal_id: string;                   // 唯一标识符
  goal_type: GoalType;
  description: GoalDescription;      // 结构化描述
  parameters: TypedParameters;       // 类型化参数
  constraints: GoalConstraint[];     // 执行约束
  sub_goals: SubGoalReference[];     // 子目标引用（DAG）
  context_ref: string;               // 关联的 SharedContext ID
  status: GoalStatus;
  result?: GoalResult;               // 完成/失败时的结果
}

export interface GoalDescription {
  summary: string;                   // 简要描述
  detailed?: string;                 // 详细描述
  output_schema: JSONSchema;         // 期望输出 Schema
}

export interface GoalConstraint {
  constraint_type: "deadline" | "priority" | "resource_limit" | "custom";
  value: unknown;
  required: boolean;
}

export interface SubGoalReference {
  sub_goal_id: string;
  depends_on: string[];              // 依赖的子目标 ID（MUST 构成 DAG）
}

export interface GoalResult {
  goal_id: string;
  status: "completed" | "failed";
  output?: Record<string, unknown>;  // 成功时，符合 output_schema
  error?: GoalError;                 // 失败时
}

export interface GoalError {
  error_code: string;
  error_message: string;
  recovery_suggestions?: string[];
}

// ---------------------------------------------------------------------------
// 咨询模式 Consultation
// ---------------------------------------------------------------------------

export interface ConsultationRequest {
  consultation_id: string;
  query_type: string;
  required_info_schema: JSONSchema;
  authorization_scope: AuthorizationScope;
  callback_config?: CallbackConfig;
  chained_from?: string;             // 链式咨询前序 ID
}

export interface ConsultationResponse {
  consultation_id: string;
  status: "fulfilled" | "partial" | "rejected";
  data?: Record<string, unknown>;
  rejection_reason?: string;
}

export interface AuthorizationScope {
  required_permissions: string[];
  host_delegation?: HostDelegation;
}

export interface HostDelegation {
  host_id: string;
  delegated_permissions: string[];
  fp_authorization_ref: string;
}

export interface CallbackConfig {
  callback_url?: string;
  callback_credential?: CallbackCredential;
  timeout_ms: number;
  retry_policy?: RetryPolicy;
}

export interface RetryPolicy {
  max_retries: number;
  backoff_strategy: "fixed" | "exponential";
  initial_delay_ms: number;
}

// ===========================================================================
// 协议协商 Protocol Negotiation
// ===========================================================================

export type CommunicationTier =
  | "tier_1_standardized"    // 标准化例程：预约定参数表，最高效率
  | "tier_2_ai_generated"    // AI 生成例程：动态生成交互协议
  | "tier_3_natural_language"; // 自然语言兜底：最低效率，最高灵活性

export interface ProtocolContract {
  contract_id: string;
  transport_method: TransportMethod;
  communication_tier: CommunicationTier;
  security_level: "basic" | "standard" | "high";
  contract_expiration: string;       // ISO 8601
  negotiation_trace: NegotiationStep[];
}

export interface TransportMethod {
  protocol: "native_tp" | "a2a_jsonrpc" | "mcp_tool_call" | "rest_api" | "prompt_embedding";
  endpoint?: string;
  version?: string;
}

export interface NegotiationStep {
  step: number;
  initiator_fay_id: string;
  proposed: TransportMethod[];
  selected?: TransportMethod;
  timestamp: string;
}

// ===========================================================================
// 消息信封与传输 Message Envelope & Transport
// ===========================================================================

export type MessageType =
  // 身份辨识层
  | "identity_proof"
  | "profile_exchange"
  // 认知分享层
  | "context_create"
  | "context_update"
  | "context_sync"
  | "context_revoke"
  | "resource_mount"
  | "resource_unmount"
  | "resource_notify"
  // 目标协商层
  | "goal_propose"
  | "goal_negotiate"
  | "goal_accept"
  | "goal_reject"
  | "goal_result"
  | "consultation_request"
  | "consultation_response"
  // 协议层
  | "negotiate_request"
  | "negotiate_response"
  | "error";

export interface MessageEnvelope {
  tp_version: string;                // semver
  message_id: string;                // UUID v7
  sender: FayIdentity;
  receiver: FayIdentity;
  timestamp: string;                 // ISO 8601
  message_type: MessageType;
  payload: unknown;                  // 根据 message_type 确定具体类型
  correlation_id?: string;           // 请求-响应配对
  signature?: string;                // Ed25519 签名 (Base64)
  protocol_contract_ref?: string;    // 协商的 ProtocolContract 引用
  trace_info?: TraceInfo;            // 跨协议追踪
}

export interface TraceInfo {
  original_protocol: string;         // 原始协议类型
  original_message_id: string;       // 原始消息 ID
  hop_count: number;
}

// ===========================================================================
// 保留类型 Retained Types
// ===========================================================================

export interface TypedParameters {
  schema_ref: string;
  values: Record<string, unknown>;
}

// ===========================================================================
// 错误处理 Error Handling
// ===========================================================================

export interface TPError {
  error_code: string;                // 如 "TP-ID001"，带类别前缀
  message: string;                   // 人类可读描述
  details?: Record<string, unknown>; // 结构化错误详情
  recovery_suggestions?: string[];   // 恢复建议
  correlation_id?: string;           // 关联的请求 ID
}
