# Separate embedding providers per environment

- **Status:** accepted
- **Relates to:** [host-ollama-firewall.md](../2026-06-20/host-ollama-firewall.md) (local delivery mechanism changed later)

## Context

Local dev should work offline-ish and avoid paid API calls. Production runs on Vercel serverless without a local Ollama process. Different models produce different vector dimensions.

## Decision

| Environment | Provider | Model | Dimensions |
|-------------|----------|-------|------------|
| Local | `ollama` | `nomic-embed-text` | 768 |
| Production | `vercel-gateway` | `openai/text-embedding-3-small` | 1536 |

- Switch via `EMBEDDING_PROVIDER` + related env vars (`packages/embeddings`)
- Embed input built by `formatEntryEmbedText()` — title, rewritten text, location, people, tags, mood
- **Hard rule:** never mix models or dimensions in the same database. Local and prod are separate DBs.

## Consequences

**Positive:** Free local embeddings; prod uses managed gateway with OIDC on Vercel; dimension check at embed time catches misconfiguration.

**Negative:** Cannot copy a local DB dump to prod and expect search to work; semantic search quality may differ between envs.

## Cost

- **Local Ollama:** $0 (runs on developer machine)
- **Prod:** AI Gateway / OpenAI embedding pricing — `text-embedding-3-small` is ~$0.02 per 1M tokens; personal journal volume is negligible (cents/month at typical usage)
