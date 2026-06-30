import { bool, cleanEnv, str } from "envalid";

export const env = cleanEnv(process.env, {
  LOG_LEVEL: str({
    choices: ["fatal", "error", "warn", "info", "debug", "trace", "silent"],
    default: "info",
  }),
  NODE_ENV: str({
    choices: ["development", "production", "test"],
    default: "development",
  }),
  VERCEL_ENV: str({ default: "" }),
  VERCEL_URL: str({ default: "" }),
  APP_BASE_URL: str({ default: "" }),
  CREATE_ENTRY_SERVICE_ENABLED: bool({ default: false }),
});
