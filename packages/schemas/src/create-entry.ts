import { z } from "zod";

export const entryPrivacySchema = z.enum(["private", "shared", "public"]);

export const createEntryInputSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  rewrittenText: z.string().trim().min(1, "rewritten_text is required"),
  originalText: z.string().trim().optional(),
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
  language: z.string().trim().optional(),
  privacy: entryPrivacySchema.optional(),
  people: z.array(z.string().trim().min(1)).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  mood: z.string().trim().optional(),
});

export type CreateEntryInput = z.infer<typeof createEntryInputSchema>;
export type EntryPrivacy = z.infer<typeof entryPrivacySchema>;
