# Label-gated PR preview environments

- **Status:** accepted
- **Relates to:** [github-actions-deploy.md](../2026-06-20/github-actions-deploy.md), [free-tier-production.md](../2026-06-19/free-tier-production.md), [defer-mcp-auth.md](../2026-06-19/defer-mcp-auth.md)

## Context

We need to test PRs against a real Vercel deployment and Postgres schema without touching production data or sharing one preview database across PRs. Terraform today wires `DATABASE_URL` to both Vercel `production` and `preview` targets, so any Vercel preview would hit prod Neon `main`.

Prod deploy orchestration (`deploy.yml` on merge) remains deferred; preview is additive to existing [pr.yml](../../../.github/workflows/pr.yml) rebase checks.

## Decision

**Label-gated ephemeral previews** — GitHub Actions + `neonctl`, not Terraform, own preview DB lifecycle.

| Area | Choice |
|------|--------|
| **Trigger** | `preview` label on PR to `master` (`labeled`, `synchronize`, `reopened`) |
| **Neon identity** | Branch `preview/pr-{number}-{slug}` via [preview-branch-name.sh](../../../.github/scripts/preview-branch-name.sh) |
| **Neon data** | `branches create` (first push) then **`branches reset --parent`** on every push — fresh prod `main` snapshot + PR migrations |
| **DB isolation** | `DATABASE_URL` from `neonctl connection-string` per workflow run; baked into `vercel build` — never in Vercel project preview env |
| **Terraform** | `DATABASE_URL` → `production` only; other vars stay `production` + `preview`; PR workflow runs **`terraform plan` only** |
| **Vercel deploy** | `vercel pull` → `vercel build` → `vercel deploy --prebuilt` in GHA (no remote rebuild) |
| **Feedback** | Single upserted PR comment (`<!-- journal-preview-env -->`) with URLs, Neon branch, truncated plan |
| **Cleanup** | [pr-preview-cleanup.yml](../../../.github/workflows/pr-preview-cleanup.yml) on PR **close/merge** only — delete Neon branch; no Vercel deployment delete |
| **Label removal** | No cleanup while PR stays open (branch remains until close) |
| **Auth** | Unchanged — MCP auth still deferred |
| **Migration failure** | Fail job; no Vercel deploy |

**Isolation model:** Terraform = long-lived prod. Ephemeral preview branches = GHA + `neonctl`.

**Accepted trade-off:** Preview-only writes are lost on each push (intentional clean slate). Public preview URLs on Hobby (no password protection).

## Consequences

**Positive:** Per-PR DB + app isolation; prod-shaped data for testing; fast warm redeploys (reuse branch name + GHA caches); infra drift visible via `terraform plan` on preview PRs.

**Negative:** Neon free-tier branch limits — must close stale preview PRs; manual `./apply.sh apply` still required for Terraform changes until `deploy.yml` exists; build runs twice (CI validation + `vercel build`); preview URLs are not stable across pushes (comment is canonical).

**Operational:** Monitor Neon branch count; first preview apply of Terraform `DATABASE_URL` split must happen before first labeled PR.

**Not in scope:** `deploy.yml` prod pipeline, disabling Vercel git integration, removing `null_resource.prod_migrations`.

## Cost

- **Neon:** one branch per labeled open PR; storage duplicated per branch on free tier — cleanup on close is essential
- **GitHub Actions:** ~3–6 min cold, ~2–4 min warm per preview run; within Hobby/private-repo free minutes for expected volume
- **Vercel Hobby:** preview deployments supported; inactive deployments left in place after cleanup (harmless)
