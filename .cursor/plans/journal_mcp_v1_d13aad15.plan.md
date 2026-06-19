---
name: Journal MCP v1
overview: "Greenfield pnpm monorepo: Next.js MCP connector with create_entry only, Postgres+pgvector and Ollama embeddings via docker-compose, Cursor-ready instructions docs, and ARCHITECTURE.md as the living design record. Deployment deferred."
todos:
  - id: scaffold-monorepo
    content: "Scaffold pnpm workspace: apps/web, packages/db, packages/embeddings, packages/schemas, root scripts"
    status: pending
  - id: docker-compose
    content: Add docker-compose.yml (postgres + ollama + pgAdmin), docker/postgres/init.sql, .env.example, .env.production.example
    status: pending
  - id: db-schema
    content: Drizzle schema entries + vector(768), migrations, HNSW index, db:migrate script
    status: pending
  - id: embeddings-package
    content: "packages/embeddings: embedText(), getEmbeddingModel() with ollama + vercel-gateway stub"
    status: pending
  - id: mcp-create-entry
    content: Next.js MCP route + create_entry tool (sync Ollama embed + INSERT) + server instructions
    status: pending
  - id: docs-instructions
    content: docs/INSTRUCTIONS.md + .cursor/rules/journal-assistant.mdc (pointer only), .cursor/mcp.json
    status: pending
  - id: architecture-todo
    content: ARCHITECTURE.md with all 7 diagrams + env comparison matrix; TODO.md; README; .env.production.example
    status: pending
isProject: false
---

# Journal MCP App — v1 Plan

Greenfield repo at [`/Users/aroussakov/projects/journal`](/Users/aroussakov/projects/journal) (empty today).

## Goal

Tools-only MCP server that saves journal entries to Postgres with pgvector embeddings. Test locally via **Cursor chat** or **MCP Inspector** — not ChatGPT. Deployment and remaining tools deferred to [`TODO.md`](TODO.md).

## Architecture

All diagrams below are **required content** for [`ARCHITECTURE.md`](ARCHITECTURE.md) at implementation time. They must be kept in sync when the system changes.

### 1. System context — both environments

High-level view: same app code, different infrastructure per environment.

```mermaid
flowchart TB
  subgraph localEnv [Local environment — v1 active]
    direction TB
    LocalHost["MCP host: Cursor or MCP Inspector"]
    LocalApp["Next.js pnpm dev :3000"]
    LocalDocker["docker-compose"]
    LocalPG[(Postgres pgvector 768)]
    LocalOllama[Ollama nomic-embed-text]
    LocalPgAdmin[pgAdmin :5050]

    LocalHost -->|"http://localhost:3000/api/mcp"| LocalApp
    LocalApp --> LocalDocker
    LocalDocker --> LocalPG
    LocalDocker --> LocalOllama
    LocalPgAdmin --> LocalPG
    LocalApp -->|"embed on write"| LocalOllama
    LocalApp -->|"INSERT entry"| LocalPG
  end

  subgraph prodEnv [Production environment — deferred]
    direction TB
    ProdHost["MCP host: ChatGPT Custom GPT"]
    ProdApp["Vercel Hobby Next.js HTTPS"]
    ProdNeon[(Neon Postgres pgvector 1536)]
    ProdGateway["Vercel AI Gateway"]

    ProdHost -->|"https://app.vercel.app/api/mcp"| ProdApp
    ProdApp -->|"embed on write"| ProdGateway
    ProdApp -->|"INSERT entry"| ProdNeon
  end
```

### 2. Local environment — component detail

What runs where on a developer machine.

```mermaid
flowchart LR
  subgraph hostMachine [Developer machine]
    Cursor["Cursor chat\n+ docs/INSTRUCTIONS.md"]
    Inspector[MCP Inspector]
    NextDev["apps/web\npnpm dev :3000"]
  end

  subgraph compose [docker-compose]
    PG[(postgres :5432\nvector 768)]
    Ollama[ollama :11434]
    PgAdmin[pgadmin :5050]
  end

  Cursor -->|tools/call| NextDev
  Inspector -->|tools/call| NextDev
  NextDev -->|DATABASE_URL localhost| PG
  NextDev -->|OLLAMA_BASE_URL localhost| Ollama
  PgAdmin -->|browse SQL| PG
```

| Local component | Runs as | URL / connection |
|-----------------|---------|------------------|
| MCP server | `pnpm dev` on host | `http://localhost:3000/api/mcp` |
| Postgres + pgvector | Docker | `localhost:5432` |
| Ollama embeddings | Docker | `localhost:11434` |
| pgAdmin | Docker | `http://localhost:5050` |
| MCP host | Cursor or Inspector on host | `.cursor/mcp.json` |
| Host prompt | `docs/INSTRUCTIONS.md` | via `.cursor/rules` pointer |

### 3. Production environment — component detail (deferred)

Target architecture when deployment is enabled (document now, implement later).

```mermaid
flowchart LR
  subgraph chatgpt [ChatGPT]
    CustomGPT["Custom GPT\n+ docs/INSTRUCTIONS.md pasted"]
  end

  subgraph vercel [Vercel Hobby]
    NextProd["apps/web deployed\n/api/mcp"]
    Fluid["Node.js Fluid Compute"]
    NextProd --- Fluid
  end

  subgraph data [Managed services]
    Neon[(Neon Postgres\nvector 1536)]
    Gateway["AI Gateway\ntext-embedding-3-small"]
  end

  CustomGPT -->|HTTPS tools/call| NextProd
  NextProd -->|DATABASE_URL from Marketplace| Neon
  NextProd -->|AI_GATEWAY_API_KEY| Gateway
```

| Prod component | Runs as | URL / connection |
|----------------|---------|------------------|
| MCP server | Vercel serverless function | `https://<project>.vercel.app/api/mcp` |
| Postgres + pgvector | Neon via Vercel Marketplace | `DATABASE_URL` env injected |
| Embeddings | Vercel AI Gateway | `EMBEDDING_PROVIDER=vercel-gateway` |
| MCP host | ChatGPT Custom GPT + connector | HTTPS + Bearer token |
| Host prompt | Same `docs/INSTRUCTIONS.md` | pasted into Custom GPT Instructions |
| pgAdmin / Ollama | **Not used** | local dev only |

### 4. Environment comparison matrix

Required table in ARCHITECTURE.md — single place to compare both environments.

| Concern | Local (v1) | Production (deferred) |
|---------|------------|------------------------|
| **MCP endpoint** | `http://localhost:3000/api/mcp` | `https://<project>.vercel.app/api/mcp` |
| **MCP host** | Cursor, MCP Inspector | ChatGPT Custom GPT |
| **App runtime** | `pnpm dev` on host | Vercel serverless Node.js |
| **Postgres** | docker-compose pgvector:pg17 | Neon via Vercel Marketplace |
| **Postgres UI** | pgAdmin :5050 | Neon dashboard / SQL editor |
| **Embeddings** | Ollama `nomic-embed-text` | AI Gateway `text-embedding-3-small` |
| **Vector dims** | 768 | 1536 |
| **EMBEDDING_PROVIDER** | `ollama` | `vercel-gateway` |
| **DATABASE_URL** | `localhost:5432/journal` | Neon connection string |
| **Auth** | `MCP_API_KEY=dev-key` | `MCP_API_KEY` + OAuth later |
| **Deploy** | None | Vercel Hobby (free) |
| **Data** | Throwaway local volume | Canonical prod data |

**Rule:** never mix embedding models or vector dimensions within the same database. Local and prod are separate databases.

### 5. create_entry sequence — local (v1)

```mermaid
sequenceDiagram
  participant User
  participant Host as Cursor_or_Inspector
  participant MCP as Next.js_api_mcp
  participant Embed as Ollama_nomic_embed
  participant DB as Postgres_pgvector

  User->>Host: Save this journal entry...
  Host->>Host: Read docs/INSTRUCTIONS.md
  Host->>MCP: tools/call create_entry title body
  MCP->>Embed: embedText title plus body
  Embed-->>MCP: vector 768
  MCP->>DB: INSERT entries with embedding
  DB-->>MCP: row id
  MCP-->>Host: text Entry saved
  Host-->>User: Confirms save
```

Production sequence is identical except: Host = ChatGPT, MCP = Vercel HTTPS, Embed = AI Gateway, DB = Neon, vector = 1536.

### 6. Instructions and MCP metadata flow

```mermaid
flowchart TB
  InstructionsMD["docs/INSTRUCTIONS.md\nfull host prompt"]
  CursorRule[".cursor/rules/journal-assistant.mdc\npointer only"]
  ChatGPTPrompt["ChatGPT Custom GPT Instructions\nsame file pasted — prod later"]
  ServerInstr["MCP server instructions in code\nshort tool guidance"]
  ToolDesc["create_entry description in code"]

  InstructionsMD --> CursorRule
  InstructionsMD -.->|copy when deploying| ChatGPTPrompt
  ServerInstr --> MCPClient[MCP host reads at connect]
  ToolDesc --> MCPClient
  CursorRule --> CursorLLM[Cursor LLM behavior]
  ChatGPTPrompt --> ChatGPTLLM[ChatGPT LLM behavior]
```

### 7. Monorepo package flow (both environments)

Same code path in local and prod; only env vars change.

```mermaid
flowchart TB
  Route["apps/web app/api/transport/route.ts"]
  Handler[mcp-handler]
  Tool[create_entry tool]
  Schemas[packages/schemas Zod]
  Embeddings[packages/embeddings embedText]
  DB[packages/db Drizzle]

  Route --> Handler --> Tool
  Tool --> Schemas
  Tool --> Embeddings
  Tool --> DB
  Embeddings -->|"env: ollama"| OllamaLocal[Ollama local]
  Embeddings -->|"env: vercel-gateway"| GatewayProd[AI Gateway prod]
  DB -->|"env: DATABASE_URL"| PostgresAny[(Postgres)]
```

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| MCP surface | Tools-only, no UI widgets |
| Framework | Next.js + [`mcp-handler`](https://www.npmjs.com/package/mcp-handler) — standard Vercel pattern |
| Route | [`app/api/[transport]/route.ts`](apps/web/app/api/[transport]/route.ts) — client URL is `/api/mcp` |
| Monorepo driver | **pnpm workspaces only** (no Turborepo/Nx) |
| v1 tool | **`create_entry` only** — sync embed on write |
| Local embeddings | **Ollama** in Docker — `nomic-embed-text`, **768 dims** |
| Prod embeddings | **Deferred** — Vercel AI Gateway + `text-embedding-3-small` (1536 dims) documented in ARCHITECTURE |
| Embedding code | Vercel AI SDK `embed()` + thin [`getEmbeddingModel()`](packages/embeddings/src/get-embedding-model.ts) env switch |
| Local DB | docker-compose `pgvector/pgvector:pg17` |
| Postgres UI | **pgAdmin 4** in docker-compose — browse tables, run SQL, inspect vectors |
| Local testing | Cursor (`.cursor/mcp.json`) + MCP Inspector |
| Deployment | **Not in v1** |
| Living docs | [`ARCHITECTURE.md`](ARCHITECTURE.md) updated with every meaningful change |

## Repo structure

```
journal/
├── apps/web/                         # Next.js MCP connector
│   ├── app/api/[transport]/route.ts
│   └── src/
│       ├── mcp/server.ts             # register tools + server instructions
│       └── tools/create-entry.ts
├── packages/
│   ├── db/                           # Drizzle, schema, migrations
│   ├── embeddings/                   # embedText(), env switch
│   └── schemas/                      # Zod schemas
├── docker/postgres/init.sql          # CREATE EXTENSION vector
├── docker-compose.yml                # postgres + ollama + pgadmin
├── docs/INSTRUCTIONS.md              # single source of truth for host prompt
├── .cursor/mcp.json
├── .cursor/rules/journal-assistant.mdc  # pointer only → @docs/INSTRUCTIONS.md
├── ARCHITECTURE.md
├── TODO.md
├── .env.example                      # local env (active)
├── .env.production.example           # prod env reference (deferred)
├── pnpm-workspace.yaml
└── README.md
```

## Data model

```sql
entries (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text NOT NULL DEFAULT 'default',
  title      text NOT NULL,
  body       text NOT NULL,
  embedding  vector(768),              -- nomic-embed-text locally
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
-- HNSW index on embedding (ready for search_entries later)
```

Embed text: `title + "\n\n" + body`

## create_entry flow (sync)

1. Validate input (Zod: `title`, `body`)
2. `embedText()` via Ollama (`EMBEDDING_PROVIDER=ollama`)
3. Drizzle INSERT with embedding
4. Return MCP text response — entry is searchable once `search_entries` exists

## Instructions (one MD + thin Cursor pointer)

| Layer | File | Role |
|-------|------|------|
| **Host prompt** | [`docs/INSTRUCTIONS.md`](docs/INSTRUCTIONS.md) | **Single source of truth** — all prompt text lives here; copy to ChatGPT later |
| **Cursor auto-apply** | [`.cursor/rules/journal-assistant.mdc`](.cursor/rules/journal-assistant.mdc) | **Pointer only** — no duplicated prose; references `@docs/INSTRUCTIONS.md` so Cursor picks it up automatically |
| **MCP metadata** | Server `instructions` + tool `description` in code | Short connector hints (not a copy of the host prompt) |

Example `.mdc` (pointer, not a second prompt):

```markdown
---
description: Journal assistant — applies docs/INSTRUCTIONS.md
alwaysApply: true
---

Follow @docs/INSTRUCTIONS.md when the journal MCP connector is available.
```

`docs/INSTRUCTIONS.md` content: when to save vs chat; title/body shaping; only `create_entry` available; deferred tools listed.

## Environment variables

Document **both** environments in `.env.example` (local active) and `.env.production.example` (prod reference, commented).

**Local (`.env` — v1 active):**

```bash
DATABASE_URL=postgresql://journal:journal@localhost:5432/journal
EMBEDDING_PROVIDER=ollama
EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_DIMENSIONS=768
OLLAMA_BASE_URL=http://localhost:11434
MCP_API_KEY=dev-key
```

**Production (`.env.production.example` — reference only, set in Vercel dashboard later):**

```bash
DATABASE_URL=                         # injected by Neon Marketplace
EMBEDDING_PROVIDER=vercel-gateway
EMBEDDING_MODEL=openai/text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
AI_GATEWAY_API_KEY=                   # or VERCEL_OIDC_TOKEN on Vercel
MCP_API_KEY=
# OLLAMA_BASE_URL not used in prod
```

## docker-compose

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **postgres** | `pgvector/pgvector:pg17` | 5432 | App DB + pgvector |
| **ollama** | `ollama/ollama` | 11434 | Local embeddings |
| **pgadmin** | `dpage/pgadmin4` | 5050 | Postgres web UI (local dev only) |

**postgres** — healthcheck, volume, `docker/postgres/init.sql` (`CREATE EXTENSION vector`)

**ollama** — volume for models; pull `nomic-embed-text` once via `docker exec` (documented in README)

**pgadmin** — dev-only, not for prod

```yaml
pgadmin:
  image: dpage/pgadmin4
  ports: ["5050:80"]
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@journal.local
    PGADMIN_DEFAULT_PASSWORD: admin
  depends_on:
    postgres:
      condition: service_healthy
```

**First-time pgAdmin setup** (document in README):

1. Open `http://localhost:5050` — login with credentials above
2. Add server: Name `journal`, Host `postgres`, Port `5432`, User `journal`, Password `journal`, DB `journal`
3. Browse `entries` table, run SQL, inspect embedding column after `create_entry` calls

Credentials also listed in `.env.example` as comments (not used by app code).

## ARCHITECTURE.md sections (living doc)

Must include all diagrams from **Architecture** section above, plus:

1. **System context** — diagram 1 (local + prod side by side)
2. **Local environment** — diagram 2 + local component table
3. **Production environment** — diagram 3 + prod component table (marked deferred)
4. **Environment comparison matrix** — diagram 4 table
5. **create_entry sequence** — diagram 5 (local); note prod variant in prose
6. **Instructions flow** — diagram 6
7. **Monorepo package flow** — diagram 7
8. **MCP tools table** — status column (`create_entry` = v1, rest = TODO)
9. **Embedding provider matrix** — ollama vs vercel-gateway per environment
10. **ADR-lite decision log** — dated decisions

Update ARCHITECTURE.md whenever environments, tools, or providers change.

## TODO.md (explicitly deferred)

- Tools: `list_entries`, `get_entry`, `update_entry`, `delete_entry`, `search_entries`
- ChatGPT connector registration + HTTPS deploy
- Vercel Hobby + Neon Postgres
- OAuth 2.1 for public connectors
- CI/CD
- `vercel-gateway` embedding provider implementation (stub env switch only in v1)

## Dev workflow

```bash
docker compose up -d
# pull ollama model once
pnpm install && pnpm db:migrate
pnpm dev                    # http://localhost:3000/api/mcp
# Postgres UI: http://localhost:5050 (pgAdmin)
# Cursor: enable journal MCP server
# Or: npx @modelcontextprotocol/inspector
```

## Key dependencies

| Package | Purpose |
|---------|---------|
| `mcp-handler`, `@modelcontextprotocol/sdk`, `zod` | MCP server |
| `next` | Host `/api/mcp` |
| `drizzle-orm`, `postgres` | DB (local TCP; Neon driver later) |
| `ai`, `ollama-ai-provider-v2` | Embeddings |
| `@ai-sdk/gateway` | Stub for prod path (not wired in v1) |

## Out of scope for v1

- Deployment, ngrok, ChatGPT connector
- Any tool besides `create_entry`
- OAuth, Redis, UI widgets, CI/CD
- Neon / Vercel AI Gateway runtime wiring (documented only)

## Risks

- **Ollama cold start** — first embed after container start may be slow; document `ollama pull` in README
- **768 vs 1536 dims** — local and prod use different vector sizes on separate DBs; never mix providers in one database
- **Vercel 10s timeout** — irrelevant until deploy; sync embed must stay fast when Gateway is added
