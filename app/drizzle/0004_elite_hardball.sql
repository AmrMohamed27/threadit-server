DROP INDEX "idx_posts_title";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "author_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_posts_id" ON "posts" USING btree ("id");--> statement-breakpoint
CREATE INDEX "idx_posts_authorId" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_users_id" ON "users" USING btree ("id");