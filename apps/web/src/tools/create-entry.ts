import { db, entries } from "@journal/db";
import { embedText, formatEntryEmbedText } from "@journal/embeddings";
import { createEntryInputSchema } from "@journal/schemas";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { isCreateEntryServiceEnabled } from "@/lib/feature-flags";
import { createRequestLogger } from "@/lib/logger";
import {
  createEntryService,
  type CreateEntryResult,
} from "@/server/services/create-entry-service";

function formatMcpResponseWithAttachmentsUrl(result: CreateEntryResult) {
  return {
    content: [
      {
        type: "text" as const,
        text: `Entry saved (id: ${result.id})\nAdd attachments: ${result.attachmentsUrl}`,
      },
    ],
  };
}

export function registerCreateEntryTool(server: McpServer): void {
  server.registerTool(
    "create_entry",
    {
      title: "Create journal entry",
      description:
        "Save a journal entry. Generates an embedding from title, rewritten text, people, tags, location, and mood for semantic search.",
      inputSchema: {
        title: z.string().min(1).describe("Short title for the entry"),
        rewritten_text: z
          .string()
          .min(1)
          .describe("Polished journal entry text"),
        original_text: z
          .string()
          .optional()
          .describe("Raw user input before rewriting, if different"),
        country: z
          .string()
          .optional()
          .describe("Country where the entry took place"),
        city: z.string().optional().describe("City where the entry took place"),
        language: z
          .string()
          .optional()
          .describe("ISO 639-1 language code (e.g. en, es)"),
        privacy: z
          .enum(["private", "shared", "public"])
          .optional()
          .describe("Visibility level. Defaults to private."),
        people: z
          .array(z.string().min(1))
          .optional()
          .describe("People mentioned or involved"),
        tags: z
          .array(z.string().min(1))
          .optional()
          .describe("Structured tags for filtering"),
        mood: z.string().optional().describe("Mood or emotional tone"),
      },
    },
    async ({
      title,
      rewritten_text,
      original_text,
      country,
      city,
      language,
      privacy,
      people,
      tags,
      mood,
    }) => {
      const input = createEntryInputSchema.parse({
        title,
        rewrittenText: rewritten_text,
        originalText: original_text,
        country,
        city,
        language,
        privacy,
        people,
        tags,
        mood,
      });

      const useService = isCreateEntryServiceEnabled();
      const log = createRequestLogger({ tool: "create_entry", title: input.title });
      log.info(
        {
          event: "create_entry.route",
          route: useService ? "service" : "inline",
        },
        `create_entry taking ${useService ? "service" : "inline"} route`,
      );

      if (useService) {
        const result = await createEntryService.create(input);
        return formatMcpResponseWithAttachmentsUrl(result);
      }

      const embedding = await embedText(
        formatEntryEmbedText({
          title: input.title,
          rewrittenText: input.rewrittenText,
          country: input.country,
          city: input.city,
          people: input.people,
          tags: input.tags,
          mood: input.mood,
        }),
      );

      const [row] = await db
        .insert(entries)
        .values({
          title: input.title,
          rewrittenText: input.rewrittenText,
          originalText: input.originalText,
          country: input.country,
          city: input.city,
          language: input.language,
          privacy: input.privacy,
          people: input.people,
          tags: input.tags,
          mood: input.mood,
          embedding,
        })
        .returning({ id: entries.id });

      return formatMcpResponseWithAttachmentsUrl({
        id: row.id,
        attachmentsUrl: `${getAppBaseUrl()}/entries/${row.id}/attachments`,
      });
    },
  );
}
