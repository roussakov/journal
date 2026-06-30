# apps/web repositories and services

- **Status:** accepted
- **Relates to:** [entry-attachments-noop-mvp.md](entry-attachments-noop-mvp.md), [clerk-mcp-oauth-auth.md](../2026-06-25/clerk-mcp-oauth-auth.md)

## Context

`create_entry` lived entirely inside the MCP tool: validate, embed, insert. That was fine for v1, but attachments needed entry lookups, upload logic, and a place to plug in real storage later — without bloating the MCP tool handler or the App Router pages/API routes.

The inline MCP path had to keep working while the layered version was built.

## Decision

Keep **entrypoints** thin; put use-case logic in `src/server/`:

| Layer | Where | Does what |
|-------|-------|-----------|
| App Router | `app/` | Pages and API route handlers — parse HTTP, auth, call services |
| MCP tools | `tools/` | MCP tool handlers — parse tool input, call services |
| Services | `src/server/services/` | Use cases (create entry, upload) |
| Repositories | `src/server/repositories/` | Drizzle only |
| Shared | `src/auth/`, `src/lib/`, packages | Roles, logger, schemas, DB client |

Rules:

- `server-only` on repositories and services (no accidental client imports).
- Repositories stay in `apps/web` for now — move to a package only if a second runtime needs them.
- Client UI in `app/**/_components/` until something is reused.

**`create_entry` cutover:** `CREATE_ENTRY_SERVICE_ENABLED` (default off). Flag off → inline logic in `tools/create-entry.ts`. Flag on → `create-entry-service` + `entry-repository`. Same MCP response either way (entry id + attachments link).

**Auth:** Pages call `guardAdminPage()`; API routes call `checkAdminAccess()`. Both use `userIsAdmin()`. Services do not re-check auth.

## Consequences

**Good:** Pages, API routes, and MCP tools stay small; storage swap in step 2 does not touch UI; MCP keeps working while the service path matures.

**Cost:** Two `create_entry` implementations until `CREATE_ENTRY_SERVICE_ENABLED` is enabled in preview/prod.

**Later:** Flip the flag when ready; consider an `(admin)` layout if many pages need `guardAdminPage()`.
