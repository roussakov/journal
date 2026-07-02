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

- [x] MCP OAuth via Clerk (`withMcpAuth` + admin `publicMetadata.role`) — ADR: [clerk-mcp-oauth-auth.md](docs/adr/2026-06-25/clerk-mcp-oauth-auth.md)
- [ ] Add Clerk env vars to Terraform (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
- [ ] Remove `MCP_API_KEY` from Terraform and `.env.example` / `.env.production.example`
- [ ] OAuth 2.1 for public connectors (ChatGPT) — partial via Clerk MCP OAuth; validate ChatGPT connector requirements

## Deploy pipeline

- [x] **PR preview environments** — label `preview` → [pr-preview.yml](.github/workflows/pr-preview.yml) (Neon branch + Vercel prebuilt deploy); cleanup on PR close. ADR: [pr-preview-environments.md](docs/adr/2026-06-23/pr-preview-environments.md). Rollout: [infra/README.md — PR preview environments](infra/README.md#pr-preview-environments).
- [ ] **Single deploy pipeline — GitHub Actions as sole orchestrator** — one workflow file in repo, no split triggers:
  - **Source of truth:** `.github/workflows/deploy.yml` defines prod deploy; `infra/terraform/` defines cloud resources; nothing else auto-runs on push
  - **Disable side triggers:** Vercel Git integration off (`enable_git_integration = false`); remove Terraform `null_resource.prod_migrations` local-exec; no manual `./apply.sh` for prod
  - **On PR:** typecheck → build → `terraform plan` (covered by `pr-preview.yml` when `preview` label is set; general PR checks in `pr.yml`)
  - **On merge to `master`:** `terraform apply` → `pnpm db:migrate` (Neon prod) → `vercel deploy --prod`
  - **HCP Terraform:** remote state only; workflow runs `terraform` CLI (same as `apply.sh`, credentials from GitHub secrets)
  - **Secrets (GitHub):** `TF_API_TOKEN`, `VERCEL_API_TOKEN`, `NEON_API_KEY`, `NEON_ORG_ID`; `DATABASE_URL` from Terraform output or Neon API after apply
  - **Also in workflow:** post-deploy smoke test (`/api/mcp`); branch protection requires CI green; document rollback (Vercel rollback + no Drizzle down migrations)
- [ ] ChatGPT Custom GPT connector (HTTPS)
- [x] Wire `vercel-gateway` embedding provider (`text-embedding-3-small`, 1536 dims)

## Attachments

- [ ] **Vision captioning for uploaded media** — after Vercel Blob + `attachments` table; caption images/videos via AI Gateway (`google/gemini-3.1-flash-lite`), embed caption text with existing `text-embedding-3-small` for entry–attachment ranking. Plan: [docs/plans/vision-model-selection.md](docs/plans/vision-model-selection.md)

## DevEx & ops

- [ ] **Shell script tests with bats-core** — adopt [bats-core](https://github.com/bats-core/bats-core) for `.sh` scripts (start with `.github/scripts/preview-branch-name.sh`; extend to `infra/terraform/apply.sh`, `docker/pgadmin/entrypoint.sh`); run in CI alongside PR checks
- [ ] Structured tags column (optional — tags in body work for v1)
