# Telepathy Protocol (TP)

<!-- Badges -->
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0--draft-blue)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

**A cognitive-sharing protocol for Fay-to-Fay communication within the iFay ecosystem.**

MCP lets AI use tools. A2A lets Agents pass messages. TP lets Fays achieve *telepathy* — establishing shared cognitive spaces within authorized trust boundaries, enabling zero-ambiguity intent transfer through session-level sharing of memory, views, rules, and reasoning engines.

> **认知共享协议** — TP 不是又一个 agent-to-agent 通信协议，而是让 Fay 在授权信任边界内建立共享认知空间的协议。MCP 让 AI 能用工具，A2A 让 Agent 能传话，TP 让 Fay 能"心灵相通"。

## Three Unique Capabilities

| Capability | Description |
|---|---|
| **Transport Agnosticism** | TP messages can travel over A2A, MCP, API, or Prompt — TP cares about semantics, not transport |
| **Protocol Negotiation** | Adaptive bridging when Fays speak different protocol languages, ensuring intent is never lost in translation |
| **Shared Context** | Session-level sharing of memory fragments, view states, rules, and reasoning engines within trust boundaries |

## Quick Start

1. **Explore the Blueprint** — understand why TP exists and how it differs from MCP/A2A:
   - [English Blueprint](./docs/en/blueprint/)
   - [中文蓝图](./docs/zh-CN/blueprint/)

2. **Review the Schema** — see the protocol's data structures:
   - [Draft Schema (JSON)](./schema/draft/schema.json)
   - [Draft Schema (TypeScript)](./schema/draft/schema.ts)
   - [Draft Schema (Documentation)](./schema/draft/schema.mdx)

3. **Read the Specification** — dive into the formal protocol spec:
   - [Draft Specification](./docs/en/specification/draft/)

## Documentation

| Section | Description | Path |
|---|---|---|
| **Blueprint** | Project vision, application scenarios, ecosystem positioning | [`docs/{lang}/blueprint/`](./docs/en/blueprint/) |
| **Specification** | Formal protocol specification (versioned) | [`docs/{lang}/specification/`](./docs/en/specification/) |
| **Developer Guide** | Getting started, architecture, contributing | [`docs/{lang}/develop/`](./docs/en/develop/) |
| **SDK** | Installation, API reference, examples, migration | [`docs/{lang}/sdk/`](./docs/en/sdk/) |
| **Community** | Code of conduct, governance, RFC process | [`docs/{lang}/community/`](./docs/en/community/) |

Supported languages: `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `de`, `fr`, `es`, `ru`

## Repository Structure

```
├── docs/                 # Multi-language documentation (9 languages)
│   └── {lang}/
│       ├── blueprint/    # Project vision and ecosystem positioning
│       ├── specification/# Formal protocol specification (versioned)
│       ├── develop/      # Developer guides
│       ├── sdk/          # SDK documentation
│       ├── community/    # Governance and community docs
│       └── images/       # Shared diagrams and illustrations
├── schema/               # Versioned schema definitions
│   ├── draft/            # Work-in-progress schema
│   └── {YYYY-MM-DD}/    # Released schema versions (immutable)
├── src/                  # TypeScript SDK source code
├── tests/                # Test suites
├── ref/                  # Reference materials
└── .kiro/specs/          # Project specifications
```

## iFay Ecosystem

TP is one of six sibling protocols in the iFay ecosystem:

| Protocol | Full Name | Role |
|---|---|---|
| **ICP** | Interactive Conversation Protocol | Human-AI interaction middleware |
| **TP** | Telepathy Protocol | Fay-to-Fay cognitive sharing |
| **CAP** | Control Authority Protocol | Hardware/client takeover |
| **SSP** | Skill Sharing Protocol | Feed-based skill discovery |
| **DTP** | Data Tunnel Protocol | OS/hardware-to-Fay data channel |
| **FP** | Faying Protocol | Human-iFay identity binding |

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get involved.

## License

This project is licensed under the [MIT License](./LICENSE).
