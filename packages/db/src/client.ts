import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";
import * as schema from "./schema/index";

const client = postgres(env.DATABASE_URL, {
  max: env.DATABASE_POOL_MAX,
  idle_timeout: env.DATABASE_POOL_IDLE_TIMEOUT,
  connect_timeout: env.DATABASE_POOL_CONNECT_TIMEOUT,
  max_lifetime: env.DATABASE_POOL_MAX_LIFETIME,
});

export const db = drizzle(client, { schema });
