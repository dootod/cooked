CREATE INDEX "idx_ratings_user_id" ON "ratings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_account_user_id" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_session_user_id" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_session_expires_at" ON "session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_two_factor_user_id" ON "two_factor" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "uq_account_provider" UNIQUE("account_id","provider_id");--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "check_score_range" CHECK ("ratings"."score" >= 1 AND "ratings"."score" <= 5);