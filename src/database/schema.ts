import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Define Users Table
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
    confirmed: boolean().default(false).notNull(),
  },
  (table) => [index("idx_users_email").on(table.email)]
);

// Define Posts Table
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
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [index("idx_posts_authorId").on(table.authorId)]
);

// Define Comments Table
export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    index("idx_comments_authorId").on(table.authorId),
    index("idx_comments_postId").on(table.postId),
  ]
);

// Define Votes Table (for both posts & comments)
export const votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    postId: integer("post_id").references(() => posts.id, {
      onDelete: "cascade",
    }),
    commentId: integer("comment_id").references(() => comments.id, {
      onDelete: "cascade",
    }),
    isUpvote: boolean("is_upvote").notNull(), // true = upvote, false = downvote
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_votes_userId").on(table.userId),
    index("idx_votes_postId").on(table.postId),
    index("idx_votes_commentId").on(table.commentId),
  ]
);

// Create a table for hidden posts
export const hiddenPosts = pgTable(
  "hidden_posts",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.postId] })]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  votes: many(votes),
  hiddenPosts: many(hiddenPosts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  votes: many(votes),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [votes.commentId],
    references: [comments.id],
  }),
}));

export const hiddenPostsRelations = relations(hiddenPosts, ({ one }) => ({
  user: one(users, {
    fields: [hiddenPosts.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [hiddenPosts.postId],
    references: [posts.id],
  }),
}));

// Export types
export type returnedUser = typeof users.$inferSelect;
export type returnedUserWithoutPassword = Omit<returnedUser, "password">;
export type returnedPost = typeof posts.$inferSelect;
export type returnedComment = typeof comments.$inferSelect;
export type returnedVote = typeof votes.$inferSelect;
export type newUser = typeof users.$inferInsert;
export type newPost = typeof posts.$inferInsert;
export type newComment = typeof comments.$inferInsert;
export type newVote = typeof votes.$inferInsert;
export type newHiddenPost = typeof hiddenPosts.$inferInsert;
export type returnedHiddenPost = typeof hiddenPosts.$inferSelect;
