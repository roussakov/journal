# Journal MCP

Save journal entries to Postgres with embeddings. v1 tool: **`create_entry`**.

## Setup

```bash
# Ollama on host — temporary (firewall); not in docker-compose
brew install ollama
ollama pull nomic-embed-text
brew services start ollama

cp .env.example .env
pnpm install
pnpm dev:prepare   # docker compose + migrations (also runs automatically before pnpm dev)
```

Ollama runs on the host Mac, not in Docker — temporary workaround for corporate firewall / Zscaler blocking container pulls or network access. Move Ollama into compose once that is resolved.

## Dev

```bash
pnpm dev               # starts Ollama, Postgres, migrations, then MCP server → http://localhost:3000/api/mcp
```

## Cursor

MCP: [`.cursor/mcp.json`](.cursor/mcp.json) · Prompt: [`docs/INSTRUCTIONS.md`](docs/INSTRUCTIONS.md)
