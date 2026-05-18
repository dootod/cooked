ALTER TABLE "audit_logs" ALTER COLUMN "metadata" SET DATA TYPE jsonb;--> statement-breakpoint
CREATE INDEX "idx_recipes_status" ON "recipes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_role" ON "user" USING btree ("role");