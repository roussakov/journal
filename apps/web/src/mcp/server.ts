import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateEntryTool } from "@/tools/create-entry";

export function configureMcpServer(server: McpServer): void {
  registerCreateEntryTool(server);
}
