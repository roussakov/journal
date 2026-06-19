import { configureMcpServer } from "@/mcp/server";
import { SERVER_INSTRUCTIONS } from "@/mcp/instructions";
import { createMcpHandler } from "mcp-handler";

export const runtime = "nodejs";

const handler = createMcpHandler(
  (server) => {
    configureMcpServer(server);
  },
  {
    serverInfo: {
      name: "journal",
      version: "0.1.0",
    },
    instructions: SERVER_INSTRUCTIONS,
  },
  {
    basePath: "/api",
    maxDuration: 60,
  },
);

export { handler as GET, handler as POST, handler as DELETE };
