"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCommunitiesResult = exports.mapSingleCommentResult = exports.mapCommentArrayResult = exports.excludeHiddenPosts = exports.mapSinglePostResult = exports.mapPostArrayResult = exports.chatSelection = exports.messageSelection = exports.chatCreator = exports.receiver = exports.sender = exports.commentSelection = exports.commentsSorter = exports.communitySelection = exports.postsSorter = exports.postSelection = exports.buildCommentThread = void 0;
exports.registerErrorHandler = registerErrorHandler;
exports.buildMessageNotification = buildMessageNotification;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../database/db");
const schema_1 = require("../database/schema");
const resolvers_1 = require("../types/resolvers");
const drizzle_orm_2 = require("drizzle-orm");
const buildCommentThread = (comments) => {
    const commentMap = {};
    const rootComments = [];
    comments.forEach((comment) => {
        commentMap[comment.id] = Object.assign(Object.assign({}, comment), { replies: [] });
    });
    comments.forEach((comment) => {
        var _a, _b;
        let flag = false;
        if (comment.parentCommentId) {
            const parent = commentMap[comment.parentCommentId];
            if (parent) {
                if (parent.parentCommentId) {
                    const grandParent = commentMap[parent.parentCommentId];
                    if (grandParent && grandParent.parentCommentId) {
                        (_a = grandParent.replies) === null || _a === void 0 ? void 0 : _a.push(commentMap[comment.id]);
                        flag = true;
                    }
                }
                if (!flag) {
                    (_b = parent.replies) === null || _b === void 0 ? void 0 : _b.push(commentMap[comment.id]);
                }
            }
        }
        else {
            rootComments.push(commentMap[comment.id]);
        }
    });
    return rootComments;
};
exports.buildCommentThread = buildCommentThread;
const postSelection = ({ userId }) => ({
    id: schema_1.posts.id,
    title: schema_1.posts.title,
    content: schema_1.posts.content,
    createdAt: schema_1.posts.createdAt,
    updatedAt: schema_1.posts.updatedAt,
    authorId: schema_1.posts.authorId,
    communityId: schema_1.posts.communityId,
    media: schema_1.posts.media,
    video: schema_1.posts.video,
    author: {
        id: schema_1.users.id,
        name: schema_1.users.name,
        image: schema_1.users.image,
        email: schema_1.users.email,
        createdAt: schema_1.users.createdAt,
        updatedAt: schema_1.users.updatedAt,
        confirmed: schema_1.users.confirmed,
    },
    community: {
        id: schema_1.communities.id,
        name: schema_1.communities.name,
        description: schema_1.communities.description,
        image: schema_1.communities.image,
        createdAt: schema_1.communities.createdAt,
        updatedAt: schema_1.communities.updatedAt,
        creatorId: schema_1.communities.creatorId,
        isPrivate: schema_1.communities.isPrivate,
        membersCount: db_1.db.$count(schema_1.communityMembers, (0, drizzle_orm_1.eq)(schema_1.communityMembers.communityId, schema_1.posts.communityId)),
        postsCount: db_1.db.$count(schema_1.posts, (0, drizzle_orm_1.eq)(schema_1.posts.communityId, schema_1.communityMembers.communityId)),
        isJoined: db_1.db.$count(schema_1.communityMembers, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.communityMembers.communityId), (0, drizzle_orm_1.eq)(schema_1.communityMembers.userId, userId !== null && userId !== void 0 ? userId : 0))),
    },
    upvotesCount: db_1.db.$count(schema_1.votes, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.postId, schema_1.posts.id), (0, drizzle_orm_1.eq)(schema_1.votes.isUpvote, true))),
    downvotesCount: db_1.db.$count(schema_1.votes, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.postId, schema_1.posts.id), (0, drizzle_orm_1.eq)(schema_1.votes.isUpvote, false))),
    isUpvoted: db_1.db.$count(schema_1.votes, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.postId, schema_1.posts.id), (0, drizzle_orm_1.eq)(schema_1.votes.userId, userId !== null && userId !== void 0 ? userId : 0), (0, drizzle_orm_1.eq)(schema_1.votes.isUpvote, true))),
    isDownvoted: db_1.db.$count(schema_1.votes, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.postId, schema_1.posts.id), (0, drizzle_orm_1.eq)(schema_1.votes.userId, userId !== null && userId !== void 0 ? userId : 0), (0, drizzle_orm_1.eq)(schema_1.votes.isUpvote, false))),
    commentsCount: db_1.db.$count(schema_1.comments, (0, drizzle_orm_1.eq)(schema_1.comments.postId, schema_1.posts.id)),
});
exports.postSelection = postSelection;
const postsSorter = (sortBy) => sortBy === "Best"
    ? (0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(votes.id) FILTER (WHERE votes.is_upvote = true) - COUNT(votes.id) FILTER (WHERE votes.is_upvote = false)`)
    : sortBy === "Hot"
        ? (0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `(COUNT(votes.id) FILTER (WHERE votes.is_upvote = true) - COUNT(votes.id) FILTER (WHERE votes.is_upvote = false)) / (EXTRACT(EPOCH FROM NOW() - posts.created_at) + 2)`)
        : sortBy === "New"
            ? (0, drizzle_orm_1.desc)(schema_1.posts.createdAt)
            : sortBy === "Top"
                ? (0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(votes.id) FILTER (WHERE votes.is_upvote = true)`)
                : sortBy === "Old"
                    ? (0, drizzle_orm_1.asc)(schema_1.posts.createdAt)
                    : (0, drizzle_orm_1.desc)(schema_1.posts.createdAt);
exports.postsSorter = postsSorter;
const communitySelection = ({ userId }) => ({
    id: schema_1.communities.id,
    name: schema_1.communities.name,
    description: schema_1.communities.description,
    image: schema_1.communities.image,
    cover: schema_1.communities.cover,
    createdAt: schema_1.communities.createdAt,
    updatedAt: schema_1.communities.updatedAt,
    creatorId: schema_1.communities.creatorId,
    isPrivate: schema_1.communities.isPrivate,
    postsCount: db_1.db.$count(schema_1.posts, (0, drizzle_orm_1.eq)(schema_1.posts.communityId, schema_1.communities.id)),
    membersCount: db_1.db.$count(schema_1.communityMembers, (0, drizzle_orm_1.eq)(schema_1.communityMembers.communityId, schema_1.communities.id)),
    creator: {
        id: schema_1.users.id,
        name: schema_1.users.name,
        image: schema_1.users.image,
        email: schema_1.users.email,
        createdAt: schema_1.users.createdAt,
        updatedAt: schema_1.users.updatedAt,
        confirmed: schema_1.users.confirmed,
    },
    isJoined: db_1.db.$count(schema_1.communityMembers, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.communityMembers.communityId), (0, drizzle_orm_1.eq)(schema_1.communityMembers.userId, userId !== null && userId !== void 0 ? userId : 0))),
});
exports.communitySelection = communitySelection;
const commentsSorter = (sortBy) => sortBy === "Best"
    ? (0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(votes.id) FILTER (WHERE votes.is_upvote = true) - COUNT(votes.id) FILTER (WHERE votes.is_upvote = false)`)
    : sortBy === "Hot"
        ? (0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `(COUNT(votes.id) FILTER (WHERE votes.is_upvote = true) - COUNT(votes.id) FILTER (WHERE votes.is_upvote = false)) / (EXTRACT(EPOCH FROM NOW() - comments.created_at) + 2)`)
        : sortBy === "New"
            ? (0, drizzle_orm_1.desc)(schema_1.comments.createdAt)
            : sortBy === "Top"
                ? (0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(votes.id) FILTER (WHERE votes.is_upvote = true)`)
                : sortBy === "Old"
                    ? (0, drizzle_orm_1.asc)(schema_1.comments.createdAt)
                    : (0, drizzle_orm_1.desc)(schema_1.comments.createdAt);
exports.commentsSorter = commentsSorter;
const commentSelection = ({ userId }) => ({
    id: schema_1.comments.id,
    content: schema_1.comments.content,
    createdAt: schema_1.comments.createdAt,
    updatedAt: schema_1.comments.updatedAt,
    authorId: schema_1.comments.authorId,
    postId: schema_1.comments.postId,
    parentCommentId: schema_1.comments.parentCommentId,
    author: {
        id: schema_1.users.id,
        name: schema_1.users.name,
        image: schema_1.users.image,
        email: schema_1.users.email,
        createdAt: schema_1.users.createdAt,
        updatedAt: schema_1.users.updatedAt,
        confirmed: schema_1.users.confirmed,
    },
    upvotesCount: db_1.db.$count(schema_1.votes, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.commentId, schema_1.comments.id), (0, drizzle_orm_1.eq)(schema_1.votes.isUpvote, true))),
    downvotesCount: db_1.db.$count(schema_1.votes, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.commentId, schema_1.comments.id), (0, drizzle_orm_1.eq)(schema_1.votes.isUpvote, false))),
    isUpvoted: db_1.db.$count(schema_1.votes, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.commentId, schema_1.comments.id), (0, drizzle_orm_1.eq)(schema_1.votes.userId, userId !== null && userId !== void 0 ? userId : 0), (0, drizzle_orm_1.eq)(schema_1.votes.isUpvote, true))),
    isDownvoted: db_1.db.$count(schema_1.votes, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.commentId, schema_1.comments.id), (0, drizzle_orm_1.eq)(schema_1.votes.userId, userId !== null && userId !== void 0 ? userId : 0), (0, drizzle_orm_1.eq)(schema_1.votes.isUpvote, false))),
});
exports.commentSelection = commentSelection;
exports.sender = (0, drizzle_orm_2.aliasedTable)(schema_1.users, "sender");
exports.receiver = (0, drizzle_orm_2.aliasedTable)(schema_1.users, "receiver");
exports.chatCreator = (0, drizzle_orm_2.aliasedTable)(schema_1.users, "chat_creator");
const messageSelection = () => ({
    id: schema_1.messages.id,
    content: schema_1.messages.content,
    createdAt: schema_1.messages.createdAt,
    updatedAt: schema_1.messages.updatedAt,
    senderId: schema_1.messages.senderId,
    chatId: schema_1.messages.chatId,
    media: schema_1.messages.media,
    sender: {
        id: exports.sender.id,
        name: exports.sender.name,
        image: exports.sender.image,
        email: exports.sender.email,
        createdAt: exports.sender.createdAt,
        updatedAt: exports.sender.updatedAt,
        confirmed: exports.sender.confirmed,
    },
});
exports.messageSelection = messageSelection;
const chatSelection = () => ({
    id: schema_1.chats.id,
    name: schema_1.chats.name,
    image: schema_1.chats.image,
    createdAt: schema_1.chats.createdAt,
    updatedAt: schema_1.chats.updatedAt,
    creatorId: schema_1.chats.creatorId,
    isGroupChat: schema_1.chats.isGroupChat,
    lastReadMessageId: schema_1.chatParticipants.lastReadMessageId,
    creator: {
        id: exports.chatCreator.id,
        name: exports.chatCreator.name,
        image: exports.chatCreator.image,
        email: exports.chatCreator.email,
        createdAt: exports.chatCreator.createdAt,
        updatedAt: exports.chatCreator.updatedAt,
        confirmed: exports.chatCreator.confirmed,
    },
});
exports.chatSelection = chatSelection;
const mapPostArrayResult = (posts) => {
    return posts.map((_a) => {
        var { isUpvoted, isDownvoted, upvotesCount, downvotesCount } = _a, post = __rest(_a, ["isUpvoted", "isDownvoted", "upvotesCount", "downvotesCount"]);
        return (Object.assign(Object.assign({}, post), { isUpvoted: isUpvoted > 0 ? "upvote" : isDownvoted > 0 ? "downvote" : "none", upvotesCount: upvotesCount - downvotesCount }));
    });
};
exports.mapPostArrayResult = mapPostArrayResult;
const mapSinglePostResult = (post) => {
    return Object.assign(Object.assign({}, post), { isUpvoted: post.isUpvoted > 0
            ? "upvote"
            : post.isDownvoted > 0
                ? "downvote"
                : "none", upvotesCount: post.upvotesCount - post.downvotesCount });
};
exports.mapSinglePostResult = mapSinglePostResult;
const excludeHiddenPosts = (userId) => (0, drizzle_orm_1.notExists)(db_1.db
    .select()
    .from(schema_1.hiddenPosts)
    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.hiddenPosts.postId, schema_1.posts.id), (0, drizzle_orm_1.eq)(schema_1.hiddenPosts.userId, userId !== null && userId !== void 0 ? userId : 0))));
exports.excludeHiddenPosts = excludeHiddenPosts;
const mapCommentArrayResult = (comments) => {
    return comments.map((_a) => {
        var { isUpvoted, isDownvoted, upvotesCount, downvotesCount } = _a, comment = __rest(_a, ["isUpvoted", "isDownvoted", "upvotesCount", "downvotesCount"]);
        return (Object.assign(Object.assign({}, comment), { isUpvoted: (isUpvoted > 0
                ? "upvote"
                : isDownvoted > 0
                    ? "downvote"
                    : "none"), upvotesCount: upvotesCount - downvotesCount }));
    });
};
exports.mapCommentArrayResult = mapCommentArrayResult;
const mapSingleCommentResult = (comment) => {
    return Object.assign(Object.assign({}, comment), { isUpvoted: (comment.isUpvoted > 0
            ? "upvote"
            : comment.isDownvoted > 0
                ? "downvote"
                : "none"), upvotesCount: comment.upvotesCount - comment.downvotesCount });
};
exports.mapSingleCommentResult = mapSingleCommentResult;
const mapCommunitiesResult = (communities) => {
    return communities.map((c) => (Object.assign(Object.assign({}, c), { isJoined: c.isJoined > 0 })));
};
exports.mapCommunitiesResult = mapCommunitiesResult;
function registerErrorHandler(error) {
    console.log("ERROR: ", error);
    if (error.constraint_name === "users_email_unique") {
        return {
            errors: [
                {
                    field: "email",
                    message: "A user with this email already exists",
                },
            ],
        };
    }
    if (error.constraint_name === "users_name_unique") {
        return {
            errors: [
                {
                    field: "name",
                    message: "A user with this username already exists",
                },
            ],
        };
    }
    return {
        errors: [
            {
                field: "root",
                message: error.message,
            },
        ],
    };
}
function buildMessageNotification(userId, message) {
    var _a, _b;
    if (!message) {
        return {
            id: 0,
            type: resolvers_1.NotificationEnum.DIRECT_MESSAGE,
            userId,
            senderId: 0,
            senderName: "",
            content: "",
            entityId: 0,
            entityType: "Message",
            isRead: false,
            createdAt: null,
        };
    }
    return {
        id: message.id,
        type: resolvers_1.NotificationEnum.DIRECT_MESSAGE,
        userId,
        senderId: message.senderId,
        senderName: (_b = (_a = message.sender) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Sender",
        content: message.content,
        entityId: message.id,
        entityType: "Message",
        isRead: false,
        createdAt: message.createdAt,
    };
}
//# sourceMappingURL=utils.js.map