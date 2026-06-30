import pino from "pino";
import pinoPretty from "pino-pretty";
import { env } from "@/env";

type RuntimeEnv = "local" | "preview" | "production";

function getRuntimeEnv(): RuntimeEnv {
  if (env.VERCEL_ENV === "production") {
    return "production";
  }

  if (env.VERCEL_ENV === "preview") {
    return "preview";
  }

  return "local";
}

const runtimeEnv = getRuntimeEnv();
const isLocal = runtimeEnv === "local" && env.NODE_ENV === "development";

const loggerOptions: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
  base: {
    service: "journal-web",
    env: runtimeEnv,
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "authorization",
      "password",
      "token",
      "secret",
    ],
    remove: true,
  },
};

// Sync streams — worker-thread transports can drop logs when a Next.js / Vercel
// handler returns before the transport thread flushes (common for MCP tool calls).
const destination = isLocal
  ? pinoPretty({
      colorize: true,
      translateTime: "SYS:standard",
      sync: true,
    })
  : pino.destination({ sync: true });

export const logger = pino(loggerOptions, destination);

export function createRequestLogger(
  ctx: Record<string, unknown>,
): pino.Logger {
  return logger.child(ctx);
}
