import { env } from "@/env";

export function getAppBaseUrl(): string {
  if (env.APP_BASE_URL) {
    return env.APP_BASE_URL.replace(/\/$/, "");
  }

  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
