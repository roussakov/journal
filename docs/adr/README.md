# Architecture Decision Records

Decisions are grouped by **date** — one folder per decision session, topic files inside. ADRs capture **why**; [ARCHITECTURE.md](../../ARCHITECTURE.md) captures **how/what** (diagrams, env tables).

## Layout

```
docs/adr/
  README.md                 ← this file + batch index
  YYYY-MM-DD/               ← date of the decision session (no version suffix)
    README.md               ← what this batch covers
    topic-slug.md           ← one major decision per file
```

**New decisions:** create a new `YYYY-MM-DD/` folder when you have a new decision session. Do not add version labels to folder names (`v1`, `v2`) — dates are enough.

**Cross-references:** link across folders with relative paths, e.g. `[embedding providers](../2026-06-19/embedding-providers-by-environment.md)`.

## When to write an ADR

Create a topic file when a decision is hard to reverse, has cost/security trade-offs, or spans multiple packages. Skip routine refactors and dependency bumps.

## Topic file format

```markdown
# Title

- **Status:** accepted | proposed | superseded
- **Relates to:** (optional links to prior ADRs)
- **Supersedes / Superseded by:** (optional)

## Context
## Decision
## Consequences
## Cost (if applicable)
```

## Batches

| Folder | Topics | Status |
|--------|--------|--------|
| [2026-06-19](2026-06-19/) | MCP interface, monorepo, Postgres/pgvector, embeddings, free-tier prod, deferred auth | accepted |
| [2026-06-20](2026-06-20/) | Host Ollama workaround, GitHub Actions deploy | mixed |
| [2026-06-22](2026-06-22/) | Cursor-involved development, entry metadata model | accepted |
| [2026-06-23](2026-06-23/) | PR preview environments (Neon + Vercel via GHA) | accepted |
| [2026-06-25](2026-06-25/) | Clerk app auth, MCP OAuth, admin RBAC | accepted |

## Roles

| Doc | Purpose |
|-----|---------|
| `docs/adr/` | Why choices were made |
| `ARCHITECTURE.md` | Current system shape (update when implementation changes) |
| `TODO.md` | Deferred work referenced from ADR consequences |
