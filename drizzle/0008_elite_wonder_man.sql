CREATE TABLE "hidden_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"post_id" integer NOT NULL,
	CONSTRAINT "hidden_posts_user_id_post_id_pk" PRIMARY KEY("user_id","post_id")
);
--> statement-breakpoint
DROP INDEX "idx_comments_id";--> statement-breakpoint
DROP INDEX "idx_posts_id";--> statement-breakpoint
DROP INDEX "idx_users_id";--> statement-breakpoint
ALTER TABLE "hidden_posts" ADD CONSTRAINT "hidden_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hidden_posts" ADD CONSTRAINT "hidden_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;