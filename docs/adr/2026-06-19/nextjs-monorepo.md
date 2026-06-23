# Next.js + pnpm workspaces monorepo

- **Status:** accepted

## Context

Need a single deployable HTTP endpoint for MCP (`/api/mcp`), shared validation/DB/embedding logic, and a local dev loop that mirrors production. Wanted to avoid heavy monorepo tooling on a small greenfield project.

## Decision

- **Runtime:** Next.js 15 (`apps/web`) with `mcp-handler` at `/api/mcp`
- **Workspaces:** pnpm only — `apps/web`, `packages/db`, `packages/embeddings`, `packages/schemas`
- **No Turborepo** — root scripts (`pnpm dev`, `db:migrate`) are enough at this scale
- **Package naming:** `@journal/schemas` (not a generic `shared` package) so imports read by domain
- **Internal packages: JIT (source-first)** — each package exports `./src/index.ts`, not a pre-built `dist/`. Next compiles them via `transpilePackages` in `apps/web/next.config.ts`. This is the Turborepo “just-in-time internal package” pattern without Turborepo itself: the app bundler transpiles workspace TS at dev/build time.
- **Env:** root `.env` loads via `next.config.ts` for build and runtime

**Why `transpilePackages`:** Next only compiles app code by default; `node_modules` (including pnpm workspace symlinks) is treated as already-compiled JS. Pointing `exports` at `.ts` source requires opting those packages into Next’s compiler (SWC).

**Consumer graph today:** only `apps/web` imports workspace packages — no `packages/* → packages/*` deps. `drizzle-kit migrate` reads schema via its own config, not through Next.

## Consequences

**Positive:** One repo, one deploy target; clear package boundaries; Vercel build runs from repo root with `pnpm --filter @journal/web build`. JIT DX: edit a package → save → app reloads; no per-package build/watch step or stale `dist/` bugs.

**Negative:** No shared task cache; as packages grow, may revisit Turborepo. JIT only works while a bundler owns the import graph — not for raw `node script.ts` consumers.

## Future considerations

Revisit **compiled `dist/`** (tsc/tsup + optional Turborepo `build` cache) when:

| Trigger | Why |
|---------|-----|
| Second consumer (worker, CLI, script) | Plain Node can’t JIT-transpile workspace TS without `tsx` or pre-build |
| `packages/*` imports `packages/*` | Still fine for Next if all pkgs are in `transpilePackages`; breaks down for non-Next entrypoints |
| Slow dev rebuilds at scale | Cached per-package `dist/` can beat recompiling all source through Next |
| Publishing a package externally | Must ship JS + `.d.ts`, not source |

Until then, stay JIT. Hybrid is valid later (e.g. compile only `@journal/db` if scripts import it).

## Cost

Free OSS stack. Vercel Hobby builds count against free tier limits (sufficient for personal use).
