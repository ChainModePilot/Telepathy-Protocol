# Contributing to Telepathy Protocol

Thank you for your interest in contributing to the Telepathy Protocol (TP) project! This document explains how to get involved, from reporting issues to submitting pull requests.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Contribution Workflow](#contribution-workflow)
- [Commit Message Convention](#commit-message-convention)
- [Code Review Process](#code-review-process)
- [Issue Labels](#issue-labels)
- [Development Setup](#development-setup)

## Code of Conduct

All participants in this project are expected to follow our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before contributing.

## Contribution Workflow

We use a standard **fork → branch → pull request** workflow.

### 1. Fork the Repository

Fork the repository to your own GitHub account using the "Fork" button.

### 2. Clone and Set Up

```bash
git clone https://github.com/<your-username>/iFay-Skill.git
cd iFay-Skill
git remote add upstream https://github.com/<org>/iFay-Skill.git
```

### 3. Create a Feature Branch

Always branch from `main`. Use a descriptive branch name:

```bash
git checkout -b feat/shared-context-lifecycle
```

Branch naming convention:

| Prefix | Purpose |
|--------|---------|
| `feat/` | New feature or enhancement |
| `fix/` | Bug fix |
| `docs/` | Documentation changes |
| `schema/` | Schema definition changes |
| `refactor/` | Code refactoring (no behavior change) |
| `test/` | Adding or updating tests |
| `chore/` | Maintenance tasks (CI, tooling, etc.) |

### 4. Make Your Changes

- Keep commits focused and atomic.
- Follow the [commit message convention](#commit-message-convention) below.
- Ensure your changes pass all existing tests.

### 5. Push and Open a Pull Request

```bash
git push origin feat/shared-context-lifecycle
```

Open a pull request against the `main` branch of the upstream repository. Fill out the [PR template](./.github/pull-request-template.md) completely.

### 6. Address Review Feedback

Respond to reviewer comments and push additional commits to your branch. Avoid force-pushing after a review has started unless requested.

## Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `schema` | Schema definition changes (JSON/TS/MDX) |
| `style` | Formatting, missing semicolons, etc. (no logic change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |
| `chore` | Build process, CI, or auxiliary tool changes |
| `perf` | Performance improvement |
| `ci` | CI configuration changes |
| `revert` | Reverts a previous commit |

### Scope

The scope is optional and indicates the area of the codebase affected:

- `spec` — protocol specification
- `schema` — schema definitions (JSON/TS/MDX)
- `sdk` — TypeScript SDK
- `blueprint` — blueprint documents
- `docs` — general documentation
- `i18n` — translations
- `ci` — CI/CD pipeline

### Examples

```
feat(schema): add SharedStateRef to draft schema

docs(blueprint): add cross-protocol translation scenario

fix(sdk): correct MessageEnvelope timestamp validation

schema(draft): mark retryPolicy as optional in ConsultationRequest

docs(i18n): add Japanese translation for blueprint chapter 1
```

### Breaking Changes

If a commit introduces a breaking change, add `BREAKING CHANGE:` in the footer:

```
feat(schema)!: rename ContextReference to SharedContextRef

BREAKING CHANGE: ContextReference has been renamed to SharedContextRef.
Update all imports and references accordingly.
```

## Code Review Process

Every pull request requires review before merging.

### Review Criteria

Reviewers evaluate PRs against the following criteria:

1. **Correctness** — Does the change do what it claims? Are edge cases handled?
2. **Consistency** — Does it follow existing patterns and conventions?
3. **Schema Consistency** — For schema changes, are `schema.json`, `schema.ts`, and `schema.mdx` kept in sync?
4. **Documentation** — Are relevant docs updated? Are new features documented?
5. **Tests** — Are there adequate unit tests and property-based tests for new functionality?
6. **Backward Compatibility** — Does the change break existing interfaces? If so, is a migration guide provided?

### Review Flow

1. Author opens a PR and fills out the PR template.
2. At least **one maintainer** must approve the PR.
3. For schema changes or specification changes, **two maintainers** must approve.
4. CI checks must pass (linting, tests, schema consistency validation).
5. Once approved, a maintainer merges the PR using **squash merge**.

### Response Time

- Maintainers aim to provide an initial review within **3 business days**.
- If no review is received within 5 business days, feel free to ping in the PR comments.

## Issue Labels

We use the following labels to categorize and triage issues:

### Type Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working as expected |
| `feature` | New feature request or enhancement |
| `rfc` | Request for Comments — protocol evolution proposal |
| `documentation` | Documentation improvements or additions |
| `schema` | Related to schema definitions (JSON/TS/MDX) |
| `translation` | Translation-related issues (new translations, outdated translations) |
| `question` | General question about the project |

### Priority Labels

| Label | Description |
|-------|-------------|
| `priority: critical` | Blocks release or causes data loss |
| `priority: high` | Important, should be addressed soon |
| `priority: medium` | Normal priority |
| `priority: low` | Nice to have, no urgency |

### Status Labels

| Label | Description |
|-------|-------------|
| `status: triage` | Needs initial assessment |
| `status: accepted` | Accepted and ready for implementation |
| `status: in-progress` | Currently being worked on |
| `status: needs-info` | Waiting for more information from the reporter |
| `status: blocked` | Blocked by another issue or external dependency |

### Scope Labels

| Label | Description |
|-------|-------------|
| `scope: spec` | Protocol specification |
| `scope: sdk` | TypeScript SDK |
| `scope: blueprint` | Blueprint documents |
| `scope: ci` | CI/CD pipeline |
| `scope: i18n` | Internationalization and translations |

## Development Setup

### Prerequisites

- Node.js >= 18
- npm or yarn

### Getting Started

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Format code
npx prettier --write .
```

### Schema Changes

When modifying schema definitions, always update all three files together:

1. `schema/draft/schema.json` — JSON Schema definition
2. `schema/draft/schema.ts` — TypeScript type definitions
3. `schema/draft/schema.mdx` — Human-readable documentation

Refer to the [Schema Versioning](./schema/CHANGELOG.md) documentation for version management rules.

---

If you have questions about contributing, feel free to open an issue with the `question` label. We're happy to help!
