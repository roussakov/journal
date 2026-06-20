# TODO — deferred from v1

## Schema & migrations (high priority)

- [ ] **Revisit migration strategy and strict schema definitions** — unconstrained `vector` vs fixed `vector(N)` per env; restore `entries_embedding_hnsw_idx` for `search_entries`; single vs split Drizzle tracks; align `entries.ts`, SQL migrations, and prod/local dimension policy (768 vs 1536)

## MCP tools

- [ ] `list_entries`
- [ ] `get_entry`
- [ ] `update_entry`
- [ ] `delete_entry`
- [ ] `search_entries` (pgvector similarity)

## Auth & security

- [ ] Re-enable MCP Bearer auth (`MCP_API_KEY` + `withMcpAuth`)
- [ ] OAuth 2.1 for public connectors (ChatGPT)

## Deployment & prod infrastructure

- [ ] Vercel Hobby deploy (`apps/web`)
- [ ] Neon Postgres via Vercel Marketplace
- [ ] ChatGPT Custom GPT connector (HTTPS)
- [x] Wire `vercel-gateway` embedding provider (`text-embedding-3-small`, 1536 dims)
- [ ] Prod migration for `vector(1536)` (separate DB from local)

## DevEx & ops

- [ ] CI/CD
- [ ] Structured tags column (optional — tags in body work for v1)
