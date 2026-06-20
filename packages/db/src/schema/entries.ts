import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { env } from "../env";

export const entryPrivacyEnum = pgEnum("entry_privacy", [
  "private",
  "shared",
  "public",
]);

export const entries = pgTable("entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().default("default"),
  title: text("title").notNull(),
  country: text("country"),
  city: text("city"),
  language: text("language"),
  privacy: entryPrivacyEnum("privacy").notNull().default("private"),
  people: text("people").array(),
  tags: text("tags").array(),
  mood: text("mood"),
  rewrittenText: text("rewritten_text").notNull(),
  originalText: text("original_text"),
  // DB column is unconstrained `vector`; EMBEDDING_DIMENSIONS is per-environment.
  embedding: vector("embedding", { dimensions: env.EMBEDDING_DIMENSIONS }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type EntryPrivacy = (typeof entryPrivacyEnum.enumValues)[number];
