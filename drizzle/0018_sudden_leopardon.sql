CREATE TABLE "chat_participants" (
	"user_id" integer NOT NULL,
	"chat_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"last_read_message_id" integer,
	CONSTRAINT "chat_participants_user_id_chat_id_pk" PRIMARY KEY("user_id","chat_id")
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"creator_id" integer NOT NULL,
	"is_group_chat" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiver_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "idx_message_receiver";--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "chat_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_last_read_message_id_messages_id_fk" FOREIGN KEY ("last_read_message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_chat_participants_userId" ON "chat_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_chat_participants_chatId" ON "chat_participants" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "idx_chats_creatorId" ON "chats" USING btree ("creator_id");--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_message_chat" ON "messages" USING btree ("chat_id");--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "receiver_id";