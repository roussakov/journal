import { env } from "@/env";

function normalizeBaseUrl(url: string): string {
  const withScheme = url.startsWith("http") ? url : `https://${url}`;
  return withScheme.replace(/\/$/, "");
}

export function getAppBaseUrl(): string {
  if (env.APP_BASE_URL) {
    return normalizeBaseUrl(env.APP_BASE_URL);
  }

  // Vercel injects these at runtime — read process.env directly (not envalid defaults).
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return normalizeBaseUrl(vercelUrl);
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionUrl) {
    return normalizeBaseUrl(vercelProductionUrl);
  }

  return "http://localhost:3000";
}
