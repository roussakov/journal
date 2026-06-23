# Ollama on host (corporate firewall workaround)

- **Status:** accepted
- **Relates to:** [embedding-providers-by-environment.md](../2026-06-19/embedding-providers-by-environment.md)

## Context

Original plan ran Ollama inside docker-compose alongside Postgres. Corporate network (Zscaler / firewall) blocks container image pulls or network access needed for in-container Ollama setup.

## Decision

Run **Ollama on the host Mac** via Homebrew, not in Docker:

- `brew install ollama && ollama pull nomic-embed-text`
- `pnpm dev` runs `brew services start ollama` before docker-compose
- `OLLAMA_BASE_URL=http://127.0.0.1:11434/api` in `.env`
- Postgres and pgAdmin remain in docker-compose

Treat as **temporary** until firewall constraints allow Ollama in compose again. Embedding provider choice is unchanged — only how Ollama is run locally.

## Consequences

**Positive:** Unblocks local embedding e2e on locked-down corporate laptops.

**Negative:** Dev setup is macOS-specific in scripts; one more host process to manage; diverges from ARCHITECTURE diagram that once showed Ollama in compose.

**Follow-up:** Move Ollama back into `docker-compose.yml` when network policy allows; update README and diagrams.

## Cost

$0 — Ollama and `nomic-embed-text` are free locally. Extra friction is developer time, not dollars.
