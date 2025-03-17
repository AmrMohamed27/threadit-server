"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesRelations = exports.communityMembersRelations = exports.communitiesRelations = exports.savedPostsRelations = exports.hiddenPostsRelations = exports.votesRelations = exports.commentsRelations = exports.postsRelations = exports.chatsRelations = exports.usersRelations = exports.chatParticipantsRelations = exports.messages = exports.chatParticipants = exports.chats = exports.communityMembers = exports.communities = exports.savedPosts = exports.hiddenPosts = exports.votes = exports.comments = exports.posts = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").unique().notNull(),
    email: (0, pg_core_1.text)("email").unique().notNull(),
    password: (0, pg_core_1.text)("password").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
    image: (0, pg_core_1.text)("image"),
    confirmed: (0, pg_core_1.boolean)().default(false).notNull(),
}, (table) => [(0, pg_core_1.index)("idx_users_email").on(table.email)]);
exports.posts = (0, pg_core_1.pgTable)("posts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    media: (0, pg_core_1.text)("media").array(),
    video: (0, pg_core_1.text)("video_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
    authorId: (0, pg_core_1.integer)("author_id")
        .notNull()
        .references(() => exports.users.id, {
        onDelete: "cascade",
    }),
    communityId: (0, pg_core_1.integer)("community_id")
        .references(() => exports.communities.id, {
        onDelete: "cascade",
    })
        .notNull(),
}, (table) => [
    (0, pg_core_1.index)("idx_posts_authorId").on(table.authorId),
    (0, pg_core_1.index)("idx_posts_communityId").on(table.communityId),
]);
exports.comments = (0, pg_core_1.pgTable)("comments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    content: (0, pg_core_1.text)("content").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
    authorId: (0, pg_core_1.integer)("author_id")
        .notNull()
        .references(() => exports.users.id, {
        onDelete: "cascade",
    }),
    postId: (0, pg_core_1.integer)("post_id")
        .notNull()
        .references(() => exports.posts.id, {
        onDelete: "cascade",
    }),
    parentCommentId: (0, pg_core_1.integer)("parent_comment_id")
        .references(() => exports.comments.id, {
        onDelete: "cascade",
    })
        .default((0, drizzle_orm_1.sql) `NULL`),
}, (table) => [
    (0, pg_core_1.index)("idx_comments_authorId").on(table.authorId),
    (0, pg_core_1.index)("idx_comments_postId").on(table.postId),
    (0, pg_core_1.index)("idx_comments_parentCommentId").on(table.parentCommentId),
]);
exports.votes = (0, pg_core_1.pgTable)("votes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, {
        onDelete: "cascade",
    }),
    postId: (0, pg_core_1.integer)("post_id").references(() => exports.posts.id, {
        onDelete: "cascade",
    }),
    commentId: (0, pg_core_1.integer)("comment_id").references(() => exports.comments.id, {
        onDelete: "cascade",
    }),
    isUpvote: (0, pg_core_1.boolean)("is_upvote").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (table) => [
    (0, pg_core_1.index)("idx_votes_userId").on(table.userId),
    (0, pg_core_1.index)("idx_votes_postId").on(table.postId),
    (0, pg_core_1.index)("idx_votes_commentId").on(table.commentId),
]);
exports.hiddenPosts = (0, pg_core_1.pgTable)("hidden_posts", {
    userId: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, {
        onDelete: "cascade",
    }),
    postId: (0, pg_core_1.integer)("post_id")
        .notNull()
        .references(() => exports.posts.id, {
        onDelete: "cascade",
    }),
}, (table) => [(0, pg_core_1.primaryKey)({ columns: [table.userId, table.postId] })]);
exports.savedPosts = (0, pg_core_1.pgTable)("saved_posts", {
    userId: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, {
        onDelete: "cascade",
    }),
    postId: (0, pg_core_1.integer)("post_id")
        .notNull()
        .references(() => exports.posts.id, {
        onDelete: "cascade",
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, (table) => [(0, pg_core_1.primaryKey)({ columns: [table.userId, table.postId] })]);
exports.communities = (0, pg_core_1.pgTable)("communities", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    image: (0, pg_core_1.text)("image"),
    cover: (0, pg_core_1.text)("cover"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
    creatorId: (0, pg_core_1.integer)("creator_id")
        .references(() => exports.users.id, {
        onDelete: "cascade",
    })
        .notNull(),
    isPrivate: (0, pg_core_1.boolean)("is_private").default(false),
}, (table) => [(0, pg_core_1.index)("idx_communities_creatorId").on(table.creatorId)]);
exports.communityMembers = (0, pg_core_1.pgTable)("community_members", {
    userId: (0, pg_core_1.integer)("user_id")
        .references(() => exports.users.id, {
        onDelete: "cascade",
    })
        .notNull(),
    communityId: (0, pg_core_1.integer)("community_id")
        .references(() => exports.communities.id, {
        onDelete: "cascade",
    })
        .notNull(),
    joinedAt: (0, pg_core_1.timestamp)("joined_at").defaultNow(),
}, (table) => [(0, pg_core_1.primaryKey)({ columns: [table.userId, table.communityId] })]);
exports.chats = (0, pg_core_1.pgTable)("chats", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    image: (0, pg_core_1.text)("image"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
    creatorId: (0, pg_core_1.integer)("creator_id")
        .references(() => exports.users.id, {
        onDelete: "cascade",
    })
        .notNull(),
    isGroupChat: (0, pg_core_1.boolean)("is_group_chat").default(false).notNull(),
}, (table) => [(0, pg_core_1.index)("idx_chats_creatorId").on(table.creatorId)]);
exports.chatParticipants = (0, pg_core_1.pgTable)("chat_participants", {
    userId: (0, pg_core_1.integer)("user_id")
        .references(() => exports.users.id, {
        onDelete: "cascade",
    })
        .notNull(),
    chatId: (0, pg_core_1.integer)("chat_id")
        .references(() => exports.chats.id, {
        onDelete: "cascade",
    })
        .notNull(),
    joinedAt: (0, pg_core_1.timestamp)("joined_at").defaultNow(),
    lastReadMessageId: (0, pg_core_1.integer)("last_read_message_id").references(() => exports.messages.id),
}, (table) => [
    (0, pg_core_1.primaryKey)({ columns: [table.userId, table.chatId] }),
    (0, pg_core_1.index)("idx_chat_participants_userId").on(table.userId),
    (0, pg_core_1.index)("idx_chat_participants_chatId").on(table.chatId),
]);
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    senderId: (0, pg_core_1.integer)("sender_id")
        .references(() => exports.users.id, {
        onDelete: "cascade",
    })
        .notNull(),
    chatId: (0, pg_core_1.integer)("chat_id")
        .references(() => exports.chats.id, {
        onDelete: "cascade",
    })
        .notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    media: (0, pg_core_1.text)("media").default((0, drizzle_orm_1.sql) `NULL`),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (table) => [
    (0, pg_core_1.index)("idx_message_sender").on(table.senderId),
    (0, pg_core_1.index)("idx_message_chat").on(table.chatId),
]);
exports.chatParticipantsRelations = (0, drizzle_orm_1.relations)(exports.chatParticipants, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.chatParticipants.userId],
        references: [exports.users.id],
    }),
    chat: one(exports.chats, {
        fields: [exports.chatParticipants.chatId],
        references: [exports.chats.id],
    }),
    lastReadMessage: one(exports.messages, {
        fields: [exports.chatParticipants.lastReadMessageId],
        references: [exports.messages.id],
    }),
}));
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    posts: many(exports.posts),
    comments: many(exports.comments),
    communities: many(exports.communities),
    votes: many(exports.votes),
    hiddenPosts: many(exports.hiddenPosts),
    savedPosts: many(exports.savedPosts),
    createdChats: many(exports.chats),
    chatParticipations: many(exports.chatParticipants),
    sentMessages: many(exports.messages, { relationName: "sender" }),
}));
exports.chatsRelations = (0, drizzle_orm_1.relations)(exports.chats, ({ one, many }) => ({
    creator: one(exports.users, {
        fields: [exports.chats.creatorId],
        references: [exports.users.id],
    }),
    participants: many(exports.chatParticipants),
    messages: many(exports.messages),
}));
exports.postsRelations = (0, drizzle_orm_1.relations)(exports.posts, ({ one, many }) => ({
    author: one(exports.users, {
        fields: [exports.posts.authorId],
        references: [exports.users.id],
    }),
    comments: many(exports.comments),
    votes: many(exports.votes),
    communities: one(exports.communities, {
        fields: [exports.posts.communityId],
        references: [exports.communities.id],
    }),
}));
exports.commentsRelations = (0, drizzle_orm_1.relations)(exports.comments, ({ one, many }) => ({
    author: one(exports.users, {
        fields: [exports.comments.authorId],
        references: [exports.users.id],
    }),
    post: one(exports.posts, {
        fields: [exports.comments.postId],
        references: [exports.posts.id],
    }),
    votes: many(exports.votes),
    comments: many(exports.comments),
}));
exports.votesRelations = (0, drizzle_orm_1.relations)(exports.votes, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.votes.userId],
        references: [exports.users.id],
    }),
    post: one(exports.posts, {
        fields: [exports.votes.postId],
        references: [exports.posts.id],
    }),
    comment: one(exports.comments, {
        fields: [exports.votes.commentId],
        references: [exports.comments.id],
    }),
}));
exports.hiddenPostsRelations = (0, drizzle_orm_1.relations)(exports.hiddenPosts, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.hiddenPosts.userId],
        references: [exports.users.id],
    }),
    post: one(exports.posts, {
        fields: [exports.hiddenPosts.postId],
        references: [exports.posts.id],
    }),
}));
exports.savedPostsRelations = (0, drizzle_orm_1.relations)(exports.savedPosts, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.savedPosts.userId],
        references: [exports.users.id],
    }),
    post: one(exports.posts, {
        fields: [exports.savedPosts.postId],
        references: [exports.posts.id],
    }),
}));
exports.communitiesRelations = (0, drizzle_orm_1.relations)(exports.communities, ({ one, many }) => ({
    creator: one(exports.users, {
        fields: [exports.communities.creatorId],
        references: [exports.users.id],
    }),
    posts: many(exports.posts),
    members: many(exports.communityMembers),
}));
exports.communityMembersRelations = (0, drizzle_orm_1.relations)(exports.communityMembers, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.communityMembers.userId],
        references: [exports.users.id],
    }),
    community: one(exports.communities, {
        fields: [exports.communityMembers.communityId],
        references: [exports.communities.id],
    }),
}));
exports.messagesRelations = (0, drizzle_orm_1.relations)(exports.messages, ({ one }) => ({
    sender: one(exports.users, {
        fields: [exports.messages.senderId],
        references: [exports.users.id],
    }),
    chat: one(exports.chats, {
        fields: [exports.messages.chatId],
        references: [exports.chats.id],
    }),
}));
//# sourceMappingURL=schema.js.map