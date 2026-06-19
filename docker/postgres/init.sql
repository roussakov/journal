-- Runs once when the Postgres data volume is first created.
-- Skipped on subsequent starts while the volume persists.
-- Fresh start: pnpm docker:reset

CREATE EXTENSION IF NOT EXISTS vector;
