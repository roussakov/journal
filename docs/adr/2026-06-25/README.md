# 2026-06-25 — Clerk and MCP OAuth auth

Authentication for the web app and MCP endpoint: Clerk session middleware, MCP OAuth via protected resource metadata, admin-only tool access.

| Topic | File | Status |
|-------|------|--------|
| Clerk + MCP OAuth + admin RBAC | [clerk-mcp-oauth-auth.md](clerk-mcp-oauth-auth.md) | accepted |

**Supersedes:** [defer-mcp-auth.md](../2026-06-19/defer-mcp-auth.md).

**Implementation:** `apps/web/middleware.ts`, `apps/web/app/layout.tsx`, `apps/web/app/api/[transport]/route.ts`, `apps/web/app/.well-known/oauth-protected-resource/mcp/route.ts`, `apps/web/src/auth/`.
