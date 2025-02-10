import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Define a "users" table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  image: text("image"),
});

// Define a "posts" table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  // authorId: serial("user_id").references(() => users.id),
});

export type returnedUser = typeof users.$inferSelect;
export type returnedPost = typeof posts.$inferSelect;
export type newUser = typeof users.$inferInsert;
export type newPost = typeof posts.$inferInsert;
