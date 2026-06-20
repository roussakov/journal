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

## Deploy pipeline

- [ ] **Single deploy pipeline — GitHub Actions as sole orchestrator** — one workflow file in repo, no split triggers:
  - **Source of truth:** `.github/workflows/deploy.yml` defines PR checks and prod deploy; `infra/terraform/` defines cloud resources; nothing else auto-runs on push
  - **Disable side triggers:** Vercel Git integration off (`enable_git_integration = false`); remove Terraform `null_resource.prod_migrations` local-exec; no manual `./apply.sh` for prod
  - **On PR:** typecheck → build → `terraform plan` → optional Vercel preview via `vercel deploy` (no prod DB)
  - **On merge to `master`:** `terraform apply` → `pnpm db:migrate` (Neon prod) → `vercel deploy --prod`
  - **HCP Terraform:** remote state only; workflow runs `terraform` CLI (same as `apply.sh`, credentials from GitHub secrets)
  - **Secrets (GitHub):** `TF_API_TOKEN`, `VERCEL_API_TOKEN`, `NEON_API_KEY`, `NEON_ORG_ID`; `DATABASE_URL` from Terraform output or Neon API after apply
  - **Also in workflow:** post-deploy smoke test (`/api/mcp`); branch protection requires CI green; document rollback (Vercel rollback + no Drizzle down migrations)
- [ ] ChatGPT Custom GPT connector (HTTPS)
- [x] Wire `vercel-gateway` embedding provider (`text-embedding-3-small`, 1536 dims)

## DevEx & ops

- [ ] Structured tags column (optional — tags in body work for v1)
