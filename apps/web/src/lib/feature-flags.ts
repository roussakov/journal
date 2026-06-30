import { env } from "@/env";

export function isCreateEntryServiceEnabled(): boolean {
  return env.CREATE_ENTRY_SERVICE_ENABLED;
}
