# Free-tier production infrastructure

- **Status:** accepted
- **Relates to:** [embedding-providers-by-environment.md](embedding-providers-by-environment.md), [postgres-pgvector-drizzle.md](postgres-pgvector-drizzle.md)

## Context

Personal journal — not a commercial product. Wanted production reachable from ChatGPT without a monthly infra bill, while keeping infra reproducible (not click-ops only).

## Decision

Provision production on **free or pay-per-use** tiers, codified in `infra/terraform/`:

| Component | Choice | Tier / notes |
|-----------|--------|----------------|
| App host | Vercel | Hobby (personal / non-commercial) |
| Postgres | Neon | Free — 0.5 GB, 6h history retention, scale-to-zero |
| Embeddings | Vercel AI Gateway | OIDC on Vercel; optional API key for local testing |
| State | HCP Terraform | Remote state workspace `journal-prod` |

Guardrails in Terraform: `DATABASE_POOL_MAX=1` for serverless, prod `EMBEDDING_DIMENSIONS=1536`, Neon free-tier limits encoded.

`DATABASE_POOL_MAX=1`: Vercel serverless gives each warm function instance its own DB pool. A pool of 1 per instance keeps total Neon connections low and within free-tier limits; `DATABASE_URL` uses Neon's pooler for multiplexing behind that. Local dev uses a higher pool (10) for a long-lived process.

Neon is provisioned directly in Terraform (same outcome as Vercel Marketplace `DATABASE_URL` injection; Marketplace UI optional later for billing sync).

Terraform wiring landed 2026-06-20; decision date reflects when the stack was chosen.

## Consequences

**Positive:** ~$0 fixed monthly infra for a solo journal; IaC documents exact prod shape; same Drizzle migrations as local.

**Negative:** Cold starts (Neon suspend, Vercel serverless); Hobby limits (no team features, build concurrency); free tier caps require monitoring if usage grows.

**Follow-up:** ChatGPT connector, re-enable `MCP_API_KEY` auth, single GitHub Actions deploy pipeline ([github-actions-deploy.md](../2026-06-20/github-actions-deploy.md)).

## Cost (monthly estimate)

| Item | Typical cost |
|------|----------------|
| Vercel Hobby | $0 |
| Neon free | $0 |
| AI Gateway embeddings | ~$0–1 at personal volume |
| HCP Terraform (remote state) | $0 on free tier |
| **Infra subtotal** | **~$0–1/mo** |
