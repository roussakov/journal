import { z } from "zod";

export const createEntryInputSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  body: z.string().trim().min(1, "body is required"),
});

export type CreateEntryInput = z.infer<typeof createEntryInputSchema>;
