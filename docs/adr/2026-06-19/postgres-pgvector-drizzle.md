# Postgres + pgvector with Drizzle migrations

- **Status:** accepted

## Context

Journal entries need durable storage and vector embeddings for future similarity search. Wanted SQL-first storage with type-safe application code and repeatable schema changes across local Docker and Neon production.

## Decision

- **Database:** PostgreSQL 17 with **pgvector**
- **Extension bootstrap:** `docker/postgres/init.sql` runs `CREATE EXTENSION vector` on first local container start
- **App schema:** Drizzle ORM + SQL migrations in `packages/db/drizzle/`
- **Index:** HNSW on `embedding` planned for `search_entries` (currently deferred — see [TODO.md](../../../TODO.md) migration note)

Local: `pgvector/pgvector:pg17` in docker-compose. Production: Neon with pgvector enabled via Terraform.

## Consequences

**Positive:** One migration track for local and prod; pgvector is mature; Drizzle keeps TS schema and SQL in sync.

**Negative:** Vector column dimension policy is still evolving (unconstrained `vector` in DB vs `EMBEDDING_DIMENSIONS` per env — tracked in TODO). No down-migration strategy for prod rollbacks.

**Follow-up:** Revisit fixed `vector(N)` per environment and restore HNSW index before shipping search.

## Cost

- **Local:** Docker volume only (free)
- **Prod:** Neon free tier — 0.5 GB storage, scale-to-zero compute ([infra README](../../../infra/README.md))
