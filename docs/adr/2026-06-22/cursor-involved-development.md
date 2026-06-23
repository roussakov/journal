# Cursor-first development with human ownership

- **Status:** accepted
- **Relates to:** [tools-only-mcp.md](../2026-06-19/tools-only-mcp.md), [free-tier-production.md](../2026-06-19/free-tier-production.md)

## Context

Greenfield personal project with a clear initial scope (MCP `create_entry`, pgvector, later search). Could have used a no-code tool, a managed journal SaaS, or fully outsourced implementation. The goal is a **custom, MCP-native journal** with full control over schema, embeddings, hosting, and where data lives.

## Decision

Build with **Cursor as the primary IDE and agent surface**, while the owner **stays very involved** in architecture and review—not hands-off delegation.

**Why Cursor:** tight local loop (chat → MCP tool call → Postgres on `localhost`), rules and plans live in-repo, and the same codebase later serves ChatGPT in production. The agent accelerates implementation; **control stays with the owner** over every durable choice.

Concrete practices:

| Practice | Why |
|----------|-----|
| **Living `ARCHITECTURE.md`** with diagrams and env matrices | System truth stays inspectable; agents and future self share one map |
| **ADRs (`docs/adr/`)** | Major choices recorded by date and topic, with cross-references |
| **`.cursor/rules/`** | Steer agent behavior without bloating every chat |
| **`docs/INSTRUCTIONS.md`** | Host prompt for when/how to call `create_entry` — same file for Cursor and ChatGPT |
| **Conventional Commits + PRs + branch protection** | Human review gate; agent proposes diffs, human merges |
| **Terraform for prod** | Infra decisions are code, not dashboard memory |
| **Explicit TODO.md** | Deferred scope is written down, not lost in chat history |

ChatGPT is the production *host* target, not the dev environment.

**Why stay involved:** Journal entries are personal data. Embedding model, metadata shape, auth timing, and infra limits are painful to unwind once shipped. Agent speed helps with scaffolding; **judgment and ownership** stay human.

## Consequences

**Positive:** Fast iteration with audit trail; repo documents *why* not just *what*; full control over data model and deployment path.

**Negative:** Higher owner time than SaaS; docs must stay in sync when decisions change.

**Trade-off accepted:** More attention up front in exchange for control over data, behavior, and evolution of the system.
