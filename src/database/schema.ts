import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Define a "users" table
export const users = pgTable(
  "users",
  {
    // Primary Key
    id: serial("id").primaryKey(),
    // Name, Email and password fields
    name: text("name").unique().notNull(),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),
    // Timestamps for created and updated at
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    // Profile Image
    image: text("image"),
    // Email Confirmation
    confirmed: boolean().default(false).notNull(),
  },
  // Index on email and id fields.
  (table) => [
    index("idx_users_email").on(table.email),
    index("idx_users_id").on(table.id),
  ]
);

// Define a "posts" table
export const posts = pgTable(
  "posts",
  {
    // Primary Key
    id: serial("id").primaryKey(),
    // Title and content fields
    title: text("title").notNull(),
    content: text("content").notNull(),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    // Foreign key for author
    authorId: integer("author_id").notNull().references(() => users.id, {
      onDelete: "cascade",
    }),
  },
  // Index on id and authorId fields
  (table) => [
    index("idx_posts_id").on(table.id),
    index("idx_posts_authorId").on(table.authorId),
  ]
);

// User Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts), // One user has many posts
}));
// Posts Relations
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }), // Each post belongs to one user
}));

// Export types for the tables
export type returnedUser = typeof users.$inferSelect;
export type returnedUserWithoutPassword = Omit<returnedUser, "password">;
export type returnedPost = typeof posts.$inferSelect;
export type newUser = typeof users.$inferInsert;
export type newPost = typeof posts.$inferInsert;
