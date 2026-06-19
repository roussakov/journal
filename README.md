# Journal MCP

Tools-only MCP server that saves journal entries to Postgres with pgvector embeddings. v1 exposes **`create_entry`** only — test locally with **Cursor** or **MCP Inspector**.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for Postgres, Ollama, pgAdmin)

## First-time setup

```bash
cp .env.example .env
pnpm install
pnpm docker:up
docker exec $(docker ps -qf name=ollama) ollama pull nomic-embed-text
pnpm db:migrate
pnpm dev
```

MCP endpoint: **http://localhost:3000/api/mcp**

## Daily dev

```bash
pnpm docker:up    # if Docker isn't running
pnpm dev
```

## Docker scripts

| Command | Effect |
|---------|--------|
| `pnpm docker:up` | Start services, **keep data** |
| `pnpm docker:down` | Stop services, **keep data** |
| `pnpm docker:reset` | Wipe volumes + restart → `init.sql` runs again, then `pnpm db:migrate` |

Postgres `init.sql` only enables the `vector` extension on a **fresh volume**. Table schema comes from Drizzle migrations.

## Cursor

1. Ensure `pnpm dev` is running.
2. MCP config is in [`.cursor/mcp.json`](.cursor/mcp.json) — points at `http://localhost:3000/api/mcp`.
3. Host behavior is in [`docs/INSTRUCTIONS.md`](docs/INSTRUCTIONS.md) (via [`.cursor/rules/journal-assistant.mdc`](.cursor/rules/journal-assistant.mdc)).

Reload MCP servers in Cursor after starting the app.

## MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

Connect to `http://localhost:3000/api/mcp` and call `create_entry`.

## pgAdmin (optional)

1. Open http://localhost:5050 — `admin@example.com` / `admin`
2. The **journal** server is pre-configured (connects to the `postgres` container)
3. Browse `entries` after calling `create_entry`

## Monorepo scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Next.js MCP server (`apps/web`) |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm db:generate` | Generate migration from schema changes |

## Project layout

```
apps/web/              Next.js MCP connector (/api/mcp)
packages/db/           Drizzle + Postgres
packages/embeddings/   Ollama embedText() (v1)
packages/schemas/      Zod input schemas
docker-compose.yml     postgres + ollama + pgadmin
docs/INSTRUCTIONS.md   Host prompt (Cursor / future ChatGPT)
```

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for diagrams and environment details. Deferred work: [`TODO.md`](TODO.md).

## Notes

- **Auth:** MCP Bearer token verification is **not enabled** in v1 local dev (see TODO).
- **Ollama cold start:** First embed after container start may be slow.
- **768 vs 1536 dims:** Local uses `nomic-embed-text` (768). Production will use a separate DB with 1536-dim embeddings — never mix providers in one database.
