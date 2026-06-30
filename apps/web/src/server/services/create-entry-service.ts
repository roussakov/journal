import "server-only";

import { embedText, formatEntryEmbedText } from "@journal/embeddings";
import type { CreateEntryInput } from "@journal/schemas";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { entryRepository } from "@/server/repositories/entry-repository";

export type CreateEntryResult = {
  id: string;
  attachmentsUrl: string;
};

export async function create(
  input: CreateEntryInput,
): Promise<CreateEntryResult> {
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

  const { id } = await entryRepository.insertEntry({
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
  });

  const attachmentsUrl = `${getAppBaseUrl()}/entries/${id}/attachments`;

  return { id, attachmentsUrl };
}

export const createEntryService = {
  create,
};
