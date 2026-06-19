# Journal MCP

Save journal entries to Postgres with embeddings. v1 tool: **`create_entry`**.

## Setup

```bash
brew install ollama
ollama pull nomic-embed-text
brew services start ollama

cp .env.example .env
pnpm install
docker compose up -d
pnpm db:migrate
```

Ollama runs on your Mac (not Docker) — required for Zscaler/corporate networks.

## Dev

```bash
docker compose up -d   # if not already running
pnpm dev               # starts Ollama + MCP server → http://localhost:3000/api/mcp
```

## Cursor

MCP: [`.cursor/mcp.json`](.cursor/mcp.json) · Prompt: [`docs/INSTRUCTIONS.md`](docs/INSTRUCTIONS.md)
