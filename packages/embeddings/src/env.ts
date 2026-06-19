import { cleanEnv, num, str } from "envalid";

const shared = cleanEnv(process.env, {
  EMBEDDING_PROVIDER: str({ choices: ["ollama", "vercel-gateway"] }),
  EMBEDDING_MODEL: str(),
  EMBEDDING_DIMENSIONS: num(),
});

const ollamaEnv =
  shared.EMBEDDING_PROVIDER === "ollama"
    ? cleanEnv(process.env, { OLLAMA_BASE_URL: str() })
    : null;

export const env = {
  ...shared,
  OLLAMA_BASE_URL: ollamaEnv?.OLLAMA_BASE_URL,
};

export type EmbeddingProvider = typeof env.EMBEDDING_PROVIDER;
