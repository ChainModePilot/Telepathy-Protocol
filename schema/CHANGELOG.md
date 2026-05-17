# Schema Changelog

All notable changes to the Telepathy Protocol (TP) schema definitions are documented in this file.

## Format Convention

This changelog follows a format inspired by [Keep a Changelog](https://keepachangelog.com/).

- **Date**: Release or update date in `YYYY-MM-DD` format.
- **Version**: Schema version identifier — either `draft` (work-in-progress) or a date-based release tag (`YYYY-MM-DD`).
- **Change Types**:
  - `Added` — new types, fields, or capabilities introduced.
  - `Changed` — modifications to existing types or fields.
  - `Deprecated` — types or fields marked for future removal.
  - `Removed` — types or fields deleted from the schema.
  - `Fixed` — corrections to schema definitions (e.g. wrong type, missing constraint).
  - `Security` — changes addressing security or privacy concerns.

Each version directory (`schema/{version}/`) contains three synchronized files:
- `schema.json` — JSON Schema (Draft 2020-12)
- `schema.ts` — TypeScript type definitions
- `schema.mdx` — Human-readable documentation

---

## [draft] — 2025-04-04

Initial schema definition for the Telepathy Protocol, derived from the
[telepathy-protocol design document](../.kiro/specs/telepathy-protocol/design.md).

### Added

**Identity**
- `FayIdentifier` — Identifies a Fay participant (iFay or coFay) with optional host binding.

**Intent & Parameters**
- `Intent` — Core payload describing the communication purpose of a Fay.
- `TypedParameters` — Schema-referenced typed parameter container.
- `Constraint` — Execution constraint attached to an intent.
- `ContextReference` — Reference to a shared context for intent scoping.

**Capability**
- `CapabilityDeclaration` — Describes a service a Fay can provide, supporting dynamic discovery.
- `Condition` — Pre/post-condition for capability execution.

**Task**
- `TaskMessage` — Executable work unit passed between Fays with decomposition support.
- `TaskPayload` — Payload referencing a capability and its input.
- `TaskResult` — Result of a completed or failed task.
- `TaskError` — Error information for a failed task.
- `SubtaskReference` — Reference to a subtask with dependency declarations.
- `TaskContext` — Environment and state information for task execution.
- `SharedStateRef` — Reference to a shared state resource with access mode control.

**Encryption & Privacy**
- `EncryptedPayload` — Encrypted structure for transmitting Host privacy data.
- `KeyExchangeInfo` — Key exchange information for hybrid encryption (RSA-OAEP, ECDH-P256, X25519).
- `SelectiveDisclosure` — Controls which fields of encrypted data may be disclosed.

**Consultation**
- `ConsultationRequest` — Fay-to-Fay consultation request with authorization and callback support.
- `ConsultationResponse` — Response to a consultation request (fulfilled, partial, or rejected).
- `CallbackConfig` — Configuration for asynchronous consultation callbacks.
- `RetryPolicy` — Retry policy for callback operations.
- `CallbackCredential` — Credential authorizing access to specific resources during consultation.
- `CredentialScope` — Defines the access scope of a callback credential.

**Authorization**
- `AuthorizationScope` — Authorization scope for consultation requests.
- `HostDelegation` — Host-delegated authorization details with FP protocol reference.

**Message Envelope**
- `MessageEnvelope` — Outer wrapper for all TP communication (routing, tracing, version control).
