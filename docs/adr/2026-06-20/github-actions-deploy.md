# GitHub Actions as sole deploy orchestrator

- **Status:** proposed
- **Relates to:** [free-tier-production.md](../2026-06-19/free-tier-production.md)

## Context

Today: Vercel Git integration can auto-deploy on push; Terraform apply runs locally via `infra/terraform/apply.sh` with `local-exec` for prod migrations. Multiple triggers make it unclear what deployed prod and in what order.

## Decision (intended)

**Single pipeline** — `.github/workflows/deploy.yml` as the only prod orchestrator:

| Event | Actions |
|-------|---------|
| PR | typecheck → build → `terraform plan` → optional Vercel preview |
| Merge to `master` | `terraform apply` → `pnpm db:migrate` (Neon) → `vercel deploy --prod` → smoke test `/api/mcp` |

Supporting choices:

- Disable Vercel Git auto-deploy (`enable_git_integration = false` in Terraform)
- Remove Terraform `null_resource.prod_migrations` local-exec
- HCP Terraform for **remote state only**; workflow runs Terraform CLI with GitHub secrets
- Branch protection requires CI green (rebase check already in [pr.yml](../../../.github/workflows/pr.yml))

## Consequences

**Positive:** One audit trail for prod changes; no "Terraform applied but Vercel didn't deploy" drift; PRs show infra diff.

**Negative:** Engineering effort to build workflow; secrets management in GitHub; migrate off local `apply.sh` habit.

**Not done yet:** Only `pr.yml` (rebase check) exists. Full deploy workflow is in [TODO.md](../../../TODO.md).

## Cost

- **GitHub Actions:** free minutes for private repos within GitHub plan limits — sufficient for this repo
- **Removes** dependency on local machine for prod migrations (no laptop-needed apply)
