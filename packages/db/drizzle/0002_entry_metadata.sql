CREATE TYPE "public"."entry_privacy" AS ENUM('private', 'shared', 'public');--> statement-breakpoint
ALTER TABLE "entries" RENAME COLUMN "body" TO "rewritten_text";--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "language" text;--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "privacy" "entry_privacy" DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "people" text[];--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "mood" text;--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "original_text" text;--> statement-breakpoint
CREATE OR REPLACE FUNCTION "set_entries_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "entries_set_updated_at"
  BEFORE UPDATE ON "entries"
  FOR EACH ROW
  EXECUTE FUNCTION "set_entries_updated_at"();
