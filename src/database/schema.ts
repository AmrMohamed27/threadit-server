import { relations, sql } from "drizzle-orm";
import {
  AnyPgColumn,
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
    media: text("media").array(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    communityId: integer("community_id")
      .references(() => communities.id, {
        onDelete: "cascade",
      })
      .notNull(),
  },
  (table) => [
    index("idx_posts_authorId").on(table.authorId),
    index("idx_posts_communityId").on(table.communityId),
  ]
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
    parentCommentId: integer("parent_comment_id")
      .references((): AnyPgColumn => comments.id, {
        onDelete: "cascade",
      })
      .default(sql`NULL`),
  },
  (table) => [
    index("idx_comments_authorId").on(table.authorId),
    index("idx_comments_postId").on(table.postId),
    index("idx_comments_parentCommentId").on(table.parentCommentId),
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

// Create a table for saved posts
export const savedPosts = pgTable(
  "saved_posts",
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
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.postId] })]
);

// Define a table for communities
export const communities = pgTable(
  "communities",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    image: text("image"),
    cover: text("cover"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    creatorId: integer("creator_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    isPrivate: boolean("is_private").default(false),
  },
  (table) => [index("idx_communities_creatorId").on(table.creatorId)]
);

// Define a table for community members
export const communityMembers = pgTable(
  "community_members",
  {
    userId: integer("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    communityId: integer("community_id")
      .references(() => communities.id, {
        onDelete: "cascade",
      })
      .notNull(),
    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.communityId] })]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  communities: many(communities),
  votes: many(votes),
  hiddenPosts: many(hiddenPosts),
  savedPosts: many(savedPosts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  votes: many(votes),
  communities: one(communities, {
    fields: [posts.communityId],
    references: [communities.id],
  }),
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
  comments: many(comments),
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

export const savedPostsRelations = relations(savedPosts, ({ one }) => ({
  user: one(users, {
    fields: [savedPosts.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [savedPosts.postId],
    references: [posts.id],
  }),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  creator: one(users, {
    fields: [communities.creatorId],
    references: [users.id],
  }),
  posts: many(posts),
  members: many(communityMembers),
}));

export const communityMembersRelations = relations(
  communityMembers,
  ({ one }) => ({
    user: one(users, {
      fields: [communityMembers.userId],
      references: [users.id],
    }),
    community: one(communities, {
      fields: [communityMembers.communityId],
      references: [communities.id],
    }),
  })
);

// Export types
export type ReturnedUser = typeof users.$inferSelect;
export type ReturnedUserWithoutPassword = Omit<ReturnedUser, "password">;
export type ReturnedPost = typeof posts.$inferSelect;
export type ReturnedComment = typeof comments.$inferSelect;
export type ReturnedVote = typeof votes.$inferSelect;
export type ReturnedHiddenPost = typeof hiddenPosts.$inferSelect;
export type ReturnedCommunity = typeof communities.$inferSelect;
export type ReturnedCommunityMember = typeof communityMembers.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type NewPost = typeof posts.$inferInsert;
export type NewComment = typeof comments.$inferInsert;
export type NewVote = typeof votes.$inferInsert;
export type NewHiddenPost = typeof hiddenPosts.$inferInsert;
export type NewCommunity = typeof communities.$inferInsert;
export type NewCommunityMember = typeof communityMembers.$inferInsert;
