import pino from "pino";
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

export const logger = pino({
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
  ...(isLocal
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
      }
    : {}),
});

export function createRequestLogger(
  ctx: Record<string, unknown>,
): pino.Logger {
  return logger.child(ctx);
}
