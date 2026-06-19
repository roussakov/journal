import { db, entries } from "@journal/db";
import { embedText, formatEntryEmbedText } from "@journal/embeddings";
import { createEntryInputSchema } from "@journal/schemas";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerCreateEntryTool(server: McpServer): void {
  server.registerTool(
    "create_entry",
    {
      title: "Create journal entry",
      description:
        "Save a journal entry with a title and body. Generates an embedding for future semantic search.",
      inputSchema: {
        title: z.string().min(1).describe("Short title for the entry"),
        body: z.string().min(1).describe("Full journal entry text"),
      },
    },
    async ({ title, body }) => {
      const input = createEntryInputSchema.parse({ title, body });
      const embedding = await embedText(
        formatEntryEmbedText(input.title, input.body),
      );

      const [row] = await db
        .insert(entries)
        .values({
          title: input.title,
          body: input.body,
          embedding,
        })
        .returning({ id: entries.id });

      return {
        content: [
          {
            type: "text" as const,
            text: `Entry saved (id: ${row.id})`,
          },
        ],
      };
    },
  );
}
