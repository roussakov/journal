import { configureMcpServer } from "@/mcp/server";
import { SERVER_INSTRUCTIONS } from "@/mcp/instructions";
import { userHasAdminRole } from "@/auth/admin";
import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { auth } from "@clerk/nextjs/server";
import { createMcpHandler, withMcpAuth } from "mcp-handler";

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

const authHandler = withMcpAuth(
  handler,
  async (_, token) => {
    const clerkAuth = await auth({ acceptsToken: "oauth_token" });
    const authInfo = verifyClerkToken(clerkAuth, token);
    if (!authInfo) {
      return undefined;
    }

    const userId = authInfo.extra?.userId;
    if (typeof userId !== "string" || !(await userHasAdminRole(userId))) {
      return undefined;
    }

    return authInfo;
  },
  {
    required: true,
    resourceMetadataPath: "/.well-known/oauth-protected-resource/mcp",
  },
);

export { authHandler as GET, authHandler as POST, authHandler as DELETE };
