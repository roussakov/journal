# Auth knowledge gaps

Personal study backlog — areas where depth is thin and mistakes are expensive. Tied to choices already in this repo (Clerk, MCP OAuth, `publicMetadata.role`).

**Status:** open — revisit and strike items as understanding solidifies.

---

## JWT nuances

What I need to internalize, not just “decode and read claims”:

| Topic | Why it matters here |
|-------|---------------------|
| **Structure** — header, payload, signature; what each part is for | Clerk session tokens and MCP OAuth tokens are JWT-shaped; confusing parts leads to wrong trust assumptions |
| **Signing vs encryption** — JWS (signed) vs JWE (encrypted); most auth tokens are JWS | Tokens are often readable by the client; signing proves integrity, not secrecy |
| **Claims** — `sub`, `iss`, `aud`, `exp`, `iat`, `nbf`; registered vs private/custom | `sessionClaims.metadata.role` is custom; must know what Clerk puts in the token vs what requires an API call |
| **Verification** — who verifies (resource server vs client), clock skew, `exp` / `nbf` | Our MCP route verifies OAuth tokens server-side; browser must never treat JWT payload as authorization |
| **Session token vs OAuth access token** — different lifetimes, audiences, and where each is valid | MCP uses `oauth_token`; web UI uses session cookies / session JWT — different paths in `auth()` |
| **Stale claims** — metadata updated in Clerk may lag in an existing session until refresh | Role changes in Dashboard may not apply until re-login or token refresh |
| **Never trust the client** — JWT in localStorage/cookies proves identity to *your* server after verify; client-side decode alone is not auth | `publicMetadata` is server-authoritative; `unsafeMetadata` is not |

**Study prompts**

- What happens if I change a user’s `publicMetadata.role` while they have an active MCP OAuth token?
- Which claims does Clerk put in session JWT vs OAuth access token vs what only `clerkClient().users.getUser()` returns?
- Why does our MCP check use `publicMetadata` from the Backend API instead of only `sessionClaims`?

**Resources**

- [JWT.io introduction](https://jwt.io/introduction)
- [Clerk — Customize session token](https://clerk.com/docs/guides/sessions/customize-session-tokens)
- [Clerk — Session tokens](https://clerk.com/docs/guides/sessions/session-tokens)

---

## OAuth 2.0 and the RFCs in play

This app’s MCP flow touches several specs. Learn them as a chain, not in isolation.

### Core OAuth 2.0

| Concept | One-line |
|---------|----------|
| **Resource owner** | The human (you) |
| **Client** | Cursor / MCP Inspector — wants access on your behalf |
| **Authorization server** | Clerk — issues tokens after you sign in |
| **Resource server** | Our Next.js app (`/api/mcp`) — holds journal tools |
| **Authorization code + PKCE** | How browser/native clients get tokens without embedding a secret |
| **Bearer token** | `Authorization: Bearer <token>` on MCP requests after OAuth |
| **Scopes** | What the client is allowed to ask for; Clerk returns scopes checked in `verifyClerkToken` |

### RFC 9728 — Protected Resource Metadata

**What:** `GET /.well-known/oauth-protected-resource/mcp`  
**File:** `apps/web/app/.well-known/oauth-protected-resource/mcp/route.ts`

The resource server advertises: “I am protected; here is which authorization server to use.”

Generated at runtime from `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + request origin — not a static file.

- [RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728)
- [MCP authorization (draft)](https://modelcontextprotocol.io/specification/draft/basic/authorization)

### RFC 8414 — Authorization Server Metadata

**What:** Clerk exposes `/.well-known/oauth-authorization-server` on its Frontend API host.

The client discovers authorize/token/JWKS endpoints from Clerk, not from our app.

- [RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414)

### End-to-end flow (this repo)

```
Cursor → POST /api/mcp (no token)
       ← 401 + link to /.well-known/oauth-protected-resource/mcp
Cursor → GET metadata (our route)
       ← authorization_servers: [Clerk FAPI URL]
Cursor → GET Clerk /.well-known/oauth-authorization-server
       ← authorize, token, jwks endpoints
Cursor → OAuth with Clerk (you sign in as admin)
       ← access token
Cursor → POST /api/mcp (Bearer token)
       → verifyClerkToken + userHasAdminRole → tools allowed
```

**Study prompts**

- Why must `.well-known` routes stay public while `/api/mcp` is protected?
- What is the difference between resource metadata (9728) and authorization server metadata (8414)?
- Where does dynamic client registration fit for MCP clients?

**Resources**

- [Clerk — Build an MCP server](https://clerk.com/docs/nextjs/guides/ai/mcp/build-mcp-server)
- [Clerk — Verify OAuth tokens (Next.js)](https://clerk.com/docs/guides/development/verifying-oauth-access-tokens)

---

## Clerk user management model

How Clerk represents users and what to use when.

### Core objects

| Object | Role |
|--------|------|
| **User** | Person; profile, emails, `publicMetadata` / `privateMetadata` / `unsafeMetadata` |
| **Session** | Active sign-in; backs `auth()` and session JWT |
| **Client** | Browser/device instance tied to sessions |
| **Organization** | Optional multi-tenant boundary; members, org roles, org permissions |
| **Organization membership** | User ↔ org link with org-level role |
| **OAuth application / machine token** | MCP clients after OAuth — `auth({ acceptsToken: 'oauth_token' })` |

### Metadata types (critical distinction)

| Type | Who can write | Who can read | Use for |
|------|---------------|--------------|---------|
| `publicMetadata` | Backend API only | Frontend + session (if customized) | App roles like `{ "role": "admin" }` — **what we use** |
| `privateMetadata` | Backend API only | Backend API only | Sensitive server-only flags |
| `unsafeMetadata` | Client can write | Client | User preferences — not for authorization |

### Session customization

Dashboard → **Sessions** → **Customize session token**:

```json
{
  "metadata": "{{user.public_metadata}}"
}
```

Makes `sessionClaims.metadata.role` available without an extra API call on web routes. MCP still loads `publicMetadata` via Backend API in `userHasAdminRole()` for the OAuth path.

**Study prompts**

- When should I use `auth().protect()` vs checking `sessionClaims` vs fetching the user from Backend API?
- What is the difference between Clerk **application roles** (metadata) and **organization roles** (`org:admin`, custom permissions)?

**Resources**

- [Clerk — Users](https://clerk.com/docs/guides/users/overview)
- [Clerk — Metadata](https://clerk.com/docs/guides/users/extending)
- [Clerk — Basic RBAC with metadata](https://clerk.com/docs/guides/secure/basic-rbac)
- [Clerk — Organizations overview](https://clerk.com/docs/guides/organizations/overview)

---

## Scaling patterns: orgs vs non-orgs

### Non-org (single-tenant / personal app) — **current journal shape**

Best when: one user or a small fixed set of admins; no customer workspaces.

| Pattern | Pros | Cons |
|---------|------|------|
| **`publicMetadata.role`** (`admin`, later `editor`, …) | Simple; matches current code; easy in dev instance | No per-tenant isolation; role logic is yours to maintain |
| **Allowlist by user ID** | Maximum control for tiny teams | Does not scale; painful to operate |
| **API keys / machine tokens** | Good for scripts and MCP automation | Separate from user identity; rotation and auditing |

**This repo today:** non-org, `publicMetadata.role === "admin"`, signup disabled, MCP OAuth required.

### Org-based (multi-tenant B2B)

Best when: each customer is a workspace; members share data inside an org; billing per org.

| Pattern | Pros | Cons |
|---------|------|------|
| **Clerk Organizations** | Built-in invites, roles, permissions; `auth().has({ permission })` | More concepts; org context required on every query |
| **Org in DB** — `entries.org_id` + RLS or app-layer checks | Data isolation at storage layer | Must keep Clerk org ID ↔ DB in sync |
| **Org roles** — `org:admin`, `org:member`, custom permissions | Fine-grained, dashboard-managed | Overkill for a personal journal |

### Decision heuristic

```
Personal journal, only you (+ maybe 1–2 admins)?
  → metadata roles, no orgs (current path)

Multiple customers, each with their own data boundary?
  → Clerk Organizations + org_id on every row + permission checks

Public product, millions of users, simple “my account” only?
  → users only, no orgs; optional metadata or Clerk Billing features
```

### If journal grows

1. **Add roles** — extend `UserRole` in `apps/web/src/auth/roles.ts`; permission map per MCP tool.
2. **Add orgs** — enable Organizations in Clerk; add `org_id` to `entries`; switch from `publicMetadata.role` to `auth().has({ permission: '...' })` or org roles.
3. **Do not mix blindly** — org permissions and app-level metadata roles solve different problems; pick one primary model per resource.

**Study prompts**

- If a second person should write to *my* journal but not *yours*, do I need orgs or just two user accounts with separate DB rows?
- Where would `org_id` live in our schema, and what breaks if it is nullable during migration?

**Resources**

- [Clerk — Roles and permissions](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions)
- [Clerk — Verify user permissions](https://clerk.com/docs/guides/organizations/verify-user-permissions)

---

## Repo map (what to read after studying)

| Topic | Code |
|-------|------|
| Role type + session claims | `apps/web/src/auth/roles.ts` |
| Admin check (Backend API) | `apps/web/src/auth/admin.ts` |
| MCP OAuth + admin gate | `apps/web/app/api/[transport]/route.ts` |
| Resource metadata discovery | `apps/web/app/.well-known/oauth-protected-resource/mcp/route.ts` |
| Clerk middleware | `apps/web/middleware.ts` |
| Deferred auth history | `docs/adr/2026-06-19/defer-mcp-auth.md` |

---

## Progress tracker

Strike through when comfortable explaining it to someone else without docs.

- [ ] JWT structure, verification, and stale-claim behavior
- [ ] OAuth 2.0 roles (client, AS, RS) and authorization code + PKCE
- [ ] RFC 9728 vs RFC 8414 and how MCP clients use both
- [ ] Clerk metadata types and when to use each
- [ ] Session token customization vs Backend API user fetch
- [ ] Non-org RBAC vs Clerk Organizations — when to switch
- [ ] Trace a full Cursor → `/api/mcp` OAuth flow with logging
