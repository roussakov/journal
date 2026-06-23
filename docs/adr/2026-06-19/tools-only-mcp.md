# Tools-only MCP interface (no UI widgets)

- **Status:** accepted

## Context

The journal must be reachable from AI hosts (Cursor locally, ChatGPT Custom GPT in production) without building or maintaining a separate web UI. Initial scope is narrow: save entries with embeddings for future semantic search.

## Decision

Expose a **tools-only** MCP server. Ship `create_entry` first. No MCP resources, prompts, or UI widgets (OpenAI Apps SDK components).

Host behavior is guided by `docs/INSTRUCTIONS.md` (when to save, field guidance), not by in-app screens.

## Consequences

**Positive:** Minimal surface area; same server works in Cursor and ChatGPT; embeddings stored on write so `search_entries` can land later without changing the write path.

**Negative:** No browse/edit UI; users depend on the host LLM to call tools correctly; list/search tools are still TODO.

**Follow-up:** `list_entries`, `get_entry`, `update_entry`, `delete_entry`, `search_entries` per [TODO.md](../../../TODO.md).

## Cost

No extra UI hosting or frontend maintenance. MCP runs inside the existing Next.js app route.
