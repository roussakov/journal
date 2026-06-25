# Defer MCP Bearer auth and OAuth

- **Status:** superseded
- **Superseded by:** [clerk-mcp-oauth-auth.md](../2026-06-25/clerk-mcp-oauth-auth.md)
- **Relates to:** [tools-only-mcp.md](tools-only-mcp.md), [free-tier-production.md](free-tier-production.md)

## Context

Local dev is tested on `localhost` from Cursor and MCP Inspector. Wiring auth before the tool path works adds friction. ChatGPT public connectors eventually need OAuth 2.1, which is non-trivial.

## Decision

- **Local:** No MCP Bearer auth — endpoint trusted on loopback
- **Production:** `MCP_API_KEY` is provisioned in Terraform but **not wired** in app code yet (`withMcpAuth` deferred)
- **OAuth 2.1:** Explicitly deferred until ChatGPT connector work

## Consequences

**Positive:** Fastest path to prove `create_entry` end-to-end locally; auth design can follow real connector requirements.

**Negative:** Production MCP endpoint is not production-safe until auth is re-enabled. Do not expose prod URL publicly before Bearer auth ships.

**Follow-up:** Re-enable `MCP_API_KEY` + `withMcpAuth`; OAuth for ChatGPT per [TODO.md](../../../TODO.md).

## Cost

No cost impact. OAuth implementation is unpaid engineering time later.
