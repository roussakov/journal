import { protectedResourceHandlerClerk } from "@clerk/mcp-tools/next";
import { metadataCorsOptionsRequestHandler } from "mcp-handler";

const handler = protectedResourceHandlerClerk();
const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
