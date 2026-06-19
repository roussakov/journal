import { cleanEnv, num, str } from "envalid";

export const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  DATABASE_POOL_MAX: num(),
  DATABASE_POOL_IDLE_TIMEOUT: num(),
  DATABASE_POOL_CONNECT_TIMEOUT: num(),
  DATABASE_POOL_MAX_LIFETIME: num(),
});
