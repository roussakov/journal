import "server-only";

import { db, entries, type Entry, type NewEntry } from "@journal/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const entryIdSchema = z.string().uuid();

export class InvalidEntryIdError extends Error {
  constructor(id: string) {
    super(`Invalid entry id: ${id}`);
    this.name = "InvalidEntryIdError";
  }
}

export async function getById(id: string): Promise<Entry | null> {
  if (!entryIdSchema.safeParse(id).success) {
    throw new InvalidEntryIdError(id);
  }

  const [row] = await db
    .select()
    .from(entries)
    .where(eq(entries.id, id))
    .limit(1);

  return row ?? null;
}

export async function insertEntry(
  values: NewEntry,
): Promise<{ id: string }> {
  const [row] = await db
    .insert(entries)
    .values(values)
    .returning({ id: entries.id });

  return row;
}

export const entryRepository = {
  getById,
  insertEntry,
};
