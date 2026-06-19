import { embed } from "ai";
import { env } from "./env";
import { getEmbeddingModel } from "./get-embedding-model";

export function formatEntryEmbedText(title: string, body: string): string {
  return `${title}\n\n${body}`;
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
