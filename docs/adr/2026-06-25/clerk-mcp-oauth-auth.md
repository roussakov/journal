# Clerk auth and MCP OAuth with admin RBAC

- **Status:** accepted
- **Relates to:** [defer-mcp-auth.md](../2026-06-19/defer-mcp-auth.md), [free-tier-production.md](../2026-06-19/free-tier-production.md), [pr-preview-environments.md](../2026-06-23/pr-preview-environments.md)
- **Supersedes:** [defer-mcp-auth.md](../2026-06-19/defer-mcp-auth.md)

## Context

MCP auth was deferred in v1 so `create_entry` could ship on localhost without friction. Production and preview MCP URLs were not safe to expose publicly without authentication.

Requirements after initial v1:

- Authenticate MCP clients (Cursor, future ChatGPT connector) over HTTPS
- Restrict MCP tool access to trusted users only (signup disabled; single admin initially)
- Use a managed auth provider suitable for a solo/personal journal on a dev Clerk instance (no custom domain yet)
- Follow the MCP authorization spec (OAuth discovery via protected resource metadata)

The earlier plan provisioned `MCP_API_KEY` in Terraform for Bearer auth. That was never wired in app code. Clerk was added for app-level auth; MCP should reuse Clerk rather than a separate static API key.

## Decision

### App auth (Clerk)

- **`@clerk/nextjs`** in `apps/web` with `clerkMiddleware()` in `apps/web/middleware.ts` (project root — `app/` is not under `src/`)
- **`ClerkProvider`** inside `<body>` in `app/layout.tsx` with `<Show>`, `<SignInButton>`, `<SignUpButton>`, `<UserButton>`
- Clerk keys in repo-root `.env` (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) — loaded via existing `next.config.ts` dotenv path
- Sign-up disabled in Clerk Dashboard; users invited manually

### MCP auth (OAuth + admin role)

- Wrap MCP route handler with **`withMcpAuth`** from `mcp-handler` and **`verifyClerkToken`** from `@clerk/mcp-tools/next`
- MCP clients authenticate with **Clerk OAuth access tokens** (`auth({ acceptsToken: 'oauth_token' })`)
- **Admin gate:** after token verification, load user via `clerkClient().users.getUser(userId)` and require `publicMetadata.role === "admin"`
- **`UserRole`** type and `CustomJwtSessionClaims` in `apps/web/src/auth/roles.ts`; session token customized in Clerk Dashboard with `"metadata": "{{user.public_metadata}}"` for future web-route checks
- **Protected resource metadata** at `GET /.well-known/oauth-protected-resource/mcp` via `protectedResourceHandlerClerk()` — required for MCP OAuth discovery (RFC 9728)
- MCP route: `export const runtime = "nodejs"` (Postgres, embeddings, Clerk Backend API)
- `required: true` on `withMcpAuth` — unauthenticated or non-admin requests receive **401** with `WWW-Authenticate` pointing at the metadata URL

### Explicitly not chosen

- **`MCP_API_KEY` Bearer auth** — superseded for MCP; Terraform may still provision the var until infra is cleaned up
- **`<SignedIn>` / `<SignedOut>`** — use Clerk Core 3 `<Show when="signed-in|signed-out">`
- **`authMiddleware()`** — use `clerkMiddleware()` only
- **Org-based RBAC** — personal/single-tenant app; `publicMetadata.role` is sufficient for now

## Consequences

**Positive:** MCP endpoint is no longer open; OAuth flow works with Cursor and other MCP clients that support protected resource metadata; one identity provider for web UI and MCP; admin-only tool access matches disabled signup model.

**Negative:** MCP clients must complete OAuth (more setup than a static API key); each MCP request with admin check may call Clerk Backend API (`getUser`) for `publicMetadata.role`; OAuth access tokens do not carry custom metadata claims — role is not read from `sessionClaims` on the MCP path.

**Operational:** Clerk development instance is acceptable until a production domain exists. Preview and prod deploys need Clerk env vars in Vercel (not yet in Terraform — set manually or extend TF).

**Follow-up:**

- Add Clerk env vars to Terraform / Vercel project config for preview and production
- Remove or repurpose unused `MCP_API_KEY` Terraform variable if Bearer auth is permanently dropped
- Extend `UserRole` and per-tool permissions when non-admin roles are needed
- Evaluate caching `publicMetadata.role` or custom OAuth token claims if Clerk API latency becomes an issue

## Cost

Clerk Hobby/dev instance — no incremental infra cost for v1. Clerk machine/OAuth token pricing may apply when MCP OAuth leaves beta (per Clerk docs).
