# Entry metadata and rewritten vs original text

- **Status:** accepted
- **Relates to:** [postgres-pgvector-drizzle.md](../2026-06-19/postgres-pgvector-drizzle.md), [embedding-providers-by-environment.md](../2026-06-19/embedding-providers-by-environment.md)

## Context

Initial schema had `title` + `body`. Real journaling benefits from structured metadata (location, people, tags, mood, privacy) and from keeping both polished text and raw user input—especially when the host LLM rewrites before save.

## Decision

Extend `entries` with:

| Field | Role |
|-------|------|
| `rewritten_text` | Canonical journal text (required) — was `body` |
| `original_text` | Optional raw user input before rewrite |
| `country`, `city`, `language` | Location and locale |
| `people`, `tags` | Arrays for filtering (structured; tags in body still OK) |
| `mood` | Emotional tone |
| `privacy` | Enum: `private` \| `shared` \| `public`, default `private` |

Embedding input includes metadata via `formatEntryEmbedText()` so search can use people/tags/mood/location, not just title and body.

`create_entry` MCP tool exposes snake_case params; `@journal/schemas` validates camelCase internally.

## Consequences

**Positive:** Richer queries later without parsing body hashtags; preserves provenance when LLM polishes prose.

**Negative:** More fields for hosts to populate correctly; agents must distinguish polished text from raw input.

**Follow-up:** Keep `docs/INSTRUCTIONS.md` aligned when the tool schema changes.

## Cost

Slightly wider rows and embed strings — negligible at personal scale. No extra services.
