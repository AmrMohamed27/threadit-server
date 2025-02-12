import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Define a "users" table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").unique().notNull(),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    image: text("image"),
  },
  (table) => [index("idx_users_email").on(table.email)]
);

// Define a "posts" table
export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    // authorId: serial("user_id").references(() => users.id),
  },
  (table) => [index("idx_posts_title").on(table.id)]
);

export type returnedUser = typeof users.$inferSelect;
export type returnedUserWithoutPassword = Omit<returnedUser, "password">;
export type returnedPost = typeof posts.$inferSelect;
export type newUser = typeof users.$inferInsert;
export type newPost = typeof posts.$inferInsert;
