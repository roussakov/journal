# TODO — deferred from v1

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
- [ ] Wire `vercel-gateway` embedding provider (`text-embedding-3-small`, 1536 dims)
- [ ] Prod migration for `vector(1536)` (separate DB from local)

## DevEx & ops

- [ ] CI/CD
- [ ] Structured tags column (optional — tags in body work for v1)
