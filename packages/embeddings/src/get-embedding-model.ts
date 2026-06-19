import { createOllama } from "ollama-ai-provider-v2";
import type { EmbeddingModel } from "ai";
import { env } from "./env";

export function getEmbeddingModel(): EmbeddingModel {
  switch (env.EMBEDDING_PROVIDER) {
    case "ollama": {
      if (!env.OLLAMA_BASE_URL) {
        throw new Error("OLLAMA_BASE_URL is required when EMBEDDING_PROVIDER=ollama");
      }

      return createOllama({ baseURL: env.OLLAMA_BASE_URL }).textEmbeddingModel(
        env.EMBEDDING_MODEL,
      );
    }
    case "vercel-gateway":
      throw new Error(
        "EMBEDDING_PROVIDER=vercel-gateway is not implemented in v1. Use ollama locally.",
      );
    default: {
      const provider: never = env.EMBEDDING_PROVIDER;
      throw new Error(`Unsupported EMBEDDING_PROVIDER: ${provider}`);
    }
  }
}
