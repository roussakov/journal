# Production infrastructure (IaC)

Terraform for the **production** stack described in [ARCHITECTURE.md](../ARCHITECTURE.md):

| Component | Provider | Free tier |
|-----------|----------|-----------|
| Next.js MCP server | Vercel Hobby | Personal / non-commercial |
| Postgres + pgvector | Neon | Free (0.5 GB, scale-to-zero) |
| Embeddings | Vercel AI Gateway | Via `VERCEL_OIDC_TOKEN` on Vercel |

Local dev (`docker compose` + Ollama) is unchanged — this only provisions **production**.

## What Terraform creates

1. **Vercel project** — `apps/web`, pnpm monorepo build, GitHub push-to-deploy
2. **Neon project** — Postgres 17, pgvector, schema via `pnpm db:migrate` (same Drizzle track as local)
3. **Vercel env vars** — `DATABASE_URL` (pooled, **production target only**), embedding config, pool settings, `MCP_API_KEY` (production + preview targets for non-DB vars)

Neon is provisioned directly and wired to Vercel. That matches the architecture outcome of “Neon via Marketplace” (`DATABASE_URL` on Vercel) without requiring the Marketplace UI. You can still install the [Neon Vercel integration](https://vercel.com/integrations/neon) later for dashboard billing sync; import the existing Neon project instead of creating a duplicate.

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) ≥ 1.5
- HCP Terraform workspace **`journal-prod`** in org **`Journal`**
- `pnpm install` at repo root (for `db:migrate` during apply)
- API tokens (never commit — use `infra/terraform/hcp.env`):

| Variable | Where to get it |
|----------|-----------------|
| `TF_API_TOKEN` | [HCP → User settings → Tokens](https://app.terraform.io/app/settings/tokens) |
| `VERCEL_API_TOKEN` | [Vercel account tokens](https://vercel.com/account/tokens) |
| `NEON_API_KEY` | [Neon → API keys](https://console.neon.tech/app/settings/api-keys) |
| `NEON_ORG_ID` | Neon console → **Organization settings** → Organization ID (`org-…`) |

Set the workspace **Execution Mode** to **Local** in HCP ([journal-prod settings](https://app.terraform.io/app/Journal/workspaces/journal-prod/settings/general)). The Neon migration step runs `pnpm db:migrate` on your machine via `local-exec`; remote HCP runs cannot do that.

Also add `VERCEL_API_TOKEN` and `NEON_API_KEY` as **sensitive workspace variables** in HCP if you run plans/applies from the UI later.

## Quick start (HCP + local CLI)

```bash
cd infra/terraform
cp hcp.env.example hcp.env   # or edit the existing hcp.env
# Paste TF_API_TOKEN, VERCEL_API_TOKEN, NEON_API_KEY, NEON_ORG_ID into hcp.env

cp terraform.tfvars.example terraform.tfvars
# Set vercel_production_hostname from Vercel → Project → Settings → Domains

chmod +x apply.sh
./apply.sh init
./apply.sh plan
./apply.sh apply
```

State is stored in HCP workspace `journal-prod`; credentials load from `hcp.env` (gitignored).

## Quick start (local state only)

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # edit if needed

export VERCEL_API_TOKEN="..."
export NEON_API_KEY="..."
# Remove or comment out the `cloud {}` block in versions.tf first

terraform init
terraform plan
terraform apply
```

After apply:

```bash
terraform output vercel_production_hostname   # e.g. journal-ten-nu.vercel.app (Vercel-assigned, not always {project_name}.vercel.app)
terraform output mcp_endpoint_url
terraform output -raw mcp_api_key   # save for ChatGPT connector later
```

Push to `master` (or your `production_branch`) to trigger the first Vercel deployment.

GitHub must be connected to your Vercel account for `enable_git_integration = true`.

## Free-tier guardrails (encoded in Terraform)

| Setting | Value | Why |
|---------|-------|-----|
| Vercel plan | Hobby (default account) | No paid build machines or team features |
| Neon `history_retention_seconds` | 21600 | Free tier max (6h) |
| Neon `suspend_timeout_seconds` | 0 | Free tier cannot set custom suspend interval |
| `DATABASE_POOL_MAX` | 1 | Serverless-friendly pool size |
| Prod vector dims | 1536 | Separate DB from local 768 — never mix |

## Manual alternatives

| Step | IaC | Manual |
|------|-----|--------|
| Vercel project | `vercel_project.web` | Vercel dashboard → Import `roussakov/journal`, root `apps/web` |
| Neon DB | `neon_project.journal` | Neon dashboard or Vercel Marketplace |
| Prod schema | `null_resource.prod_migrations` | `DATABASE_URL=<neon> pnpm db:migrate` |
| Env vars | `vercel_project_environment_variables` | Vercel dashboard — see `.env.production.example` |

## Post-deploy configuration (not in this IaC)

Per ARCHITECTURE.md and TODO.md — configure after first deploy:

- Re-enable MCP Bearer auth (`MCP_API_KEY` is provisioned but not wired in app v1)
- ChatGPT Custom GPT connector pointing at `https://<project>.vercel.app/api/mcp`

AI Gateway env vars are in `ai_gateway.tf`. On Vercel, `VERCEL_OIDC_TOKEN` is injected automatically; set `ai_gateway_api_key` in tfvars only for local gateway testing.

## PR preview environments

Label-gated ephemeral previews per PR. **Not** managed by Terraform — [pr-preview.yml](../.github/workflows/pr-preview.yml) + `neonctl`. Decision record: [pr-preview-environments.md](../docs/adr/2026-06-23/pr-preview-environments.md).

### How it works

1. Add the **`preview`** label to a PR targeting `master`.
2. GHA runs typecheck, build, `terraform plan`, creates/resets a Neon branch `preview/pr-{number}-{slug}`, migrates, deploys via `vercel build` + `vercel deploy --prebuilt`.
3. PR comment (`<!-- journal-preview-env -->`) shows App URL, MCP URL, Neon branch.
4. On PR close/merge, [pr-preview-cleanup.yml](../.github/workflows/pr-preview-cleanup.yml) deletes the Neon branch.

`DATABASE_URL` for previews is injected per workflow run — never stored in Vercel project preview env (requires Terraform apply of the production-only `DATABASE_URL` target).

### GitHub secrets (only)

Non-secret IDs and app config are **hardcoded** in [pr-preview.yml](../.github/workflows/pr-preview.yml) and [pr-preview-cleanup.yml](../.github/workflows/pr-preview-cleanup.yml). Update those files if Vercel/Neon project IDs, production hostname, or pool settings change.

| Name | Type | Value / source |
|------|------|----------------|
| `TF_API_TOKEN` | secret | Same as `hcp.env` — [HCP tokens](https://app.terraform.io/app/settings/tokens) |
| `VERCEL_TOKEN` | secret | Same as `hcp.env` `VERCEL_API_TOKEN` (either `VERCEL_TOKEN` or `VERCEL_API_TOKEN` name works) |
| `NEON_API_KEY` | secret | Same as `hcp.env` |
| `NEON_ORG_ID` | secret | Same as `hcp.env` (`org-…`) |

Add in repo **Settings → Secrets and variables → Actions → Secrets**. No repository variables required. Paste token values with no trailing newline.

`DATABASE_URL` is **not** stored in GitHub — set per run from `neonctl` after the preview branch exists.

Create the **`preview`** label in GitHub (Issues → Labels) if it does not exist.

### Rollout checklist (before first test)

- [ ] **Apply Terraform locally** — `DATABASE_URL` production-only must reach Vercel prod:
  ```bash
  cd infra/terraform && ./apply.sh plan && ./apply.sh apply
  ```
- [ ] **GitHub secrets** — table above (no repository variables needed)
- [ ] **Merge workflows to `master`** — `pr-preview.yml`, `pr-preview-cleanup.yml`, `preview-branch-name.sh`
- [ ] **Open test PR** → add `preview` label
- [ ] **Verify** — PR comment (Ready), MCP endpoint responds, Neon branch in console
- [ ] **Push again** — new Vercel URL in comment; DB reset from `main`
- [ ] **Close PR** — Neon branch deleted; comment shows **Destroyed**

### Testing matrix

| Test | Expected |
|------|----------|
| PR without `preview` label | No preview workflow |
| Add `preview` label | Full pipeline; comment posted |
| Push to labeled PR | DB reset; new deploy URL in comment |
| Broken migration on PR | Workflow fails; no deploy URL |
| Close PR with label | Neon branch deleted |
| Remove `preview` label (PR open) | No cleanup; branch remains |
| Two labeled PRs at once | Separate Neon branches and URLs |

### Free-tier notes

- Neon branch limit — close stale preview PRs promptly.
- Preview URLs are public on Vercel Hobby (no password protection).
- Vercel preview deployments are not deleted on cleanup (harmless).

Prod `deploy.yml` (merge → `terraform apply` → migrate → `vercel deploy --prod`) remains in [TODO.md](../TODO.md).

## State

Default with `cloud {}`: remote state in HCP workspace **`journal-prod`**. Credentials in `hcp.env` (see above).
