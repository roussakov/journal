import { embed } from "ai";
import { env } from "./env";
import { getEmbeddingModel } from "./get-embedding-model";

export type EntryEmbedInput = {
  title: string;
  rewrittenText: string;
  country?: string;
  city?: string;
  people?: string[];
  tags?: string[];
  mood?: string;
};

export function formatEntryEmbedText(input: EntryEmbedInput): string {
  const parts = [input.title, "", input.rewrittenText];

  const location = [input.city, input.country].filter(Boolean).join(", ");
  if (location) {
    parts.push("", `Location: ${location}`);
  }
  if (input.people?.length) {
    parts.push("", `People: ${input.people.join(", ")}`);
  }
  if (input.tags?.length) {
    parts.push("", `Tags: ${input.tags.join(", ")}`);
  }
  if (input.mood) {
    parts.push("", `Mood: ${input.mood}`);
  }

  return parts.join("\n");
}

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: getEmbeddingModel(),
    value: text,
  });

  if (embedding.length !== env.EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected embedding dimension ${env.EMBEDDING_DIMENSIONS}, got ${embedding.length}`,
    );
  }

  return embedding;
}
