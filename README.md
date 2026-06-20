# Journal MCP

Save journal entries to Postgres with embeddings. v1 tool: **`create_entry`**.

## Setup

```bash
brew install ollama
ollama pull nomic-embed-text
brew services start ollama

cp .env.example .env
pnpm install
pnpm dev:prepare   # docker compose + migrations (also runs automatically before pnpm dev)
```

Ollama runs on your Mac (not Docker) — required for Zscaler/corporate networks.

## Dev

```bash
pnpm dev               # starts Ollama, Postgres, migrations, then MCP server → http://localhost:3000/api/mcp
```

## Cursor

MCP: [`.cursor/mcp.json`](.cursor/mcp.json) · Prompt: [`docs/INSTRUCTIONS.md`](docs/INSTRUCTIONS.md)
