import { config } from "dotenv";
import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../../.env"),
});

const nextConfig: NextConfig = {
  transpilePackages: ["@journal/db", "@journal/embeddings", "@journal/schemas"],
  serverExternalPackages: [
    "postgres",
    "drizzle-orm",
    "envalid",
    "pino",
    "pino-pretty",
  ],
  outputFileTracingRoot: path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
  ),
};

export default nextConfig;
