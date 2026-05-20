ALTER TABLE "user" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE INDEX "idx_user_deleted_at" ON "user" USING btree ("deleted_at");