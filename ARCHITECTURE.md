# Architecture

Living design record for the Journal MCP app. Update this file when environments, tools, or providers change.

## System context

Same app code; different infrastructure per environment.

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

## Local environment

```mermaid
flowchart LR
  subgraph hostMachine [Developer machine]
    Cursor["Cursor chat\n+ docs/INSTRUCTIONS.md"]
    Inspector[MCP Inspector]
    NextDev["apps/web\npnpm dev :3000"]
    Ollama["Ollama :11434\nHomebrew"]
  end

  subgraph compose [docker-compose]
    PG[(postgres :5432\nvector 768)]
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
| Ollama embeddings | Homebrew on host (`brew services start ollama`, also run by `pnpm dev`) | `localhost:11434` |
| pgAdmin | Docker | `http://localhost:5050` |
| MCP host | Cursor or Inspector | `.cursor/mcp.json` |
| Host prompt | `docs/INSTRUCTIONS.md` | via `.cursor/rules` pointer |

## Production environment (deferred)

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

## Environment comparison

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
| **Auth** | None (v1 local) | `MCP_API_KEY` + OAuth (deferred) |
| **Deploy** | None | Vercel Hobby (free) |
| **Data** | Throwaway local volume | Canonical prod data |

**Rule:** never mix embedding models or vector dimensions within the same database. Local and prod are separate databases.

## create_entry sequence (local)

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

Implementation note: workspace packages are static imports with `transpilePackages`; root `.env` is loaded in `next.config.ts` for build and runtime.

## Instructions and MCP metadata flow

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

## Monorepo package flow

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

## MCP tools

| Tool | Status | Description |
|------|--------|-------------|
| `create_entry` | **v1** | Validate title/body, embed, INSERT |
| `list_entries` | TODO | — |
| `get_entry` | TODO | — |
| `update_entry` | TODO | — |
| `delete_entry` | TODO | — |
| `search_entries` | TODO | pgvector similarity search |

## Embedding provider matrix

| Environment | Provider | Model | Dimensions | Runtime |
|-------------|----------|-------|------------|---------|
| Local (v1) | `ollama` | `nomic-embed-text` | 768 | Host Ollama (Homebrew) |
| Production | `vercel-gateway` | `openai/text-embedding-3-small` | 1536 | Vercel AI Gateway (stub only in code) |

Embed input format: `title + "\n\n" + body`.

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

## ADR-lite decision log

| Date | Decision |
|------|----------|
| 2026-06-19 | Tools-only MCP; no UI widgets |
| 2026-06-19 | Next.js + `mcp-handler` at `/api/mcp` |
| 2026-06-19 | pnpm workspaces only (no Turborepo) |
| 2026-06-19 | `@journal/schemas` instead of generic `shared` package name |
| 2026-06-19 | `init.sql` for pgvector extension; Drizzle for app schema |
| 2026-06-19 | Separate local (768) vs prod (1536) databases |
| 2026-06-19 | MCP auth skipped for local v1; re-enable before prod |
