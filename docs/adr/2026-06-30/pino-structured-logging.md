# Pino structured logging for apps/web

- **Status:** accepted
- **Relates to:** [entry-attachments-noop-mvp.md](entry-attachments-noop-mvp.md)

## Context

The noop upload MVP needs visible server logs (filename, `entryId`, `uploadId`) locally and on Vercel. Vercel has no app logging SDK — it reads JSON from stdout.

## Decision

Use [Pino](https://getpino.io/) ([Vercel guide](https://vercel.com/kb/guide/add-structured-application-logs-to-vercel-functions)).

- `apps/web/src/lib/logger.ts` — base logger, `createRequestLogger(ctx)` for per-upload context, redact secrets
- `LOG_LEVEL` in env (validated via `apps/web/src/env.ts`, default `info`)
- Local dev → `pino-pretty`; Vercel → JSON stdout
- `pino` / `pino-pretty` in `serverExternalPackages` (Next.js bundler workaround)

Upload service logs: `attachment.upload.received`, `.noop`, `.success`, `.error`.

## Consequences

**Good:** Searchable JSON in preview/prod; readable logs locally.

**Bad:** Override `LOG_LEVEL=debug` locally when verbose logs are needed.

**Later:** Add logging to MCP `create_entry` if needed.
