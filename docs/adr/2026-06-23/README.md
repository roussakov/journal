# 2026-06-23 — PR preview environments

Label-gated preview deploys: isolated Neon branches per PR, Vercel prebuilt deploys from GitHub Actions, cleanup on PR close.

| Topic | File | Status |
|-------|------|--------|
| PR preview environments | [pr-preview-environments.md](pr-preview-environments.md) | accepted |

**Builds on:** [2026-06-20](../2026-06-20/) — [github-actions-deploy.md](../2026-06-20/github-actions-deploy.md) (preview slice implemented; full prod `deploy.yml` still deferred).

**Implementation:** [pr-preview.yml](../../../.github/workflows/pr-preview.yml), [pr-preview-cleanup.yml](../../../.github/workflows/pr-preview-cleanup.yml), [preview-branch-name.sh](../../../.github/scripts/preview-branch-name.sh).
