import { and, asc, desc, eq, notExists, sql } from "drizzle-orm";
import { db } from "../database/db";
import {
  chatParticipants,
  chats,
  comments,
  communities,
  communityMembers,
  hiddenPosts,
  messages,
  posts,
  users,
  votes,
} from "../database/schema";
import {
  ExtendedComment,
  extendedCommunity,
  ExtendedMessage,
  ExtendedPost,
  UserResponse,
} from "../types/inputs";
import {
  CommentQueryResult,
  CommunityQueryResult,
  newSelectionProps,
  NotificationEnum,
  NotificationResponse,
  PostQueryResult,
  SortOptions,
  VoteOptions,
} from "../types/resolvers";
import { aliasedTable } from "drizzle-orm";

// Helper function to build a nested comment structure
export const buildCommentThread = (
  comments: ExtendedComment[]
): ExtendedComment[] => {
  const commentMap: Record<number, ExtendedComment> = {};
  const rootComments: ExtendedComment[] = [];

  // Map comments by ID
  comments.forEach((comment) => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });

  // Assign replies to their parents
  comments.forEach((comment) => {
    // flag to determine if we reached max depth
    let flag = false;
    if (comment.parentCommentId) {
      const parent = commentMap[comment.parentCommentId];
      if (parent) {
        if (parent.parentCommentId) {
          const grandParent = commentMap[parent.parentCommentId];
          if (grandParent && grandParent.parentCommentId) {
            grandParent.replies?.push(commentMap[comment.id]);
            flag = true;
          }
        }
        if (!flag) {
          parent.replies?.push(commentMap[comment.id]);
        }
      }
    } else {
      // If no parent, it's a top-level comment
      rootComments.push(commentMap[comment.id]);
    }
  });

  return rootComments;
};

export const postSelection = ({ userId }: newSelectionProps) => ({
  id: posts.id,
  title: posts.title,
  content: posts.content,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  authorId: posts.authorId,
  communityId: posts.communityId,
  media: posts.media,
  video: posts.video,
  // Author Details
  author: {
    id: users.id,
    name: users.name,
    image: users.image,
    email: users.email,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    confirmed: users.confirmed,
  },
  // Community Details
  community: {
    id: communities.id,
    name: communities.name,
    description: communities.description,
    image: communities.image,
    createdAt: communities.createdAt,
    updatedAt: communities.updatedAt,
    creatorId: communities.creatorId,
    isPrivate: communities.isPrivate,
    membersCount: db.$count(
      communityMembers,
      eq(communityMembers.communityId, posts.communityId)
    ),
    postsCount: db.$count(
      posts,
      eq(posts.communityId, communityMembers.communityId)
    ),
    isJoined: db.$count(
      communityMembers,
      and(
        eq(communities.id, communityMembers.communityId),
        eq(communityMembers.userId, userId ?? 0)
      )
    ),
  },
  // Upvote Count
  upvotesCount: db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, true))
  ),
  // Downvote Count
  downvotesCount: db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, false))
  ),
  // If the current user has upvoted
  isUpvoted: db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, true)
    )
  ),
  // If the current user has downvoted
  isDownvoted: db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, false)
    )
  ),
  // Comment Count
  commentsCount: db.$count(comments, eq(comments.postId, posts.id)),
});

export const postsSorter = (sortBy: SortOptions) =>
  sortBy === "Best"
    ? desc(
        sql`COUNT(votes.id) FILTER (WHERE votes.is_upvote = true) - COUNT(votes.id) FILTER (WHERE votes.is_upvote = false)`
      ) // Upvotes - Downvotes
    : sortBy === "Hot"
    ? desc(
        sql`(COUNT(votes.id) FILTER (WHERE votes.is_upvote = true) - COUNT(votes.id) FILTER (WHERE votes.is_upvote = false)) / (EXTRACT(EPOCH FROM NOW() - posts.created_at) + 2)`
      ) // Hot ranking formula
    : sortBy === "New"
    ? desc(posts.createdAt) // Most recent first
    : sortBy === "Top"
    ? desc(sql`COUNT(votes.id) FILTER (WHERE votes.is_upvote = true)`) // Total upvotes
    : sortBy === "Old"
    ? asc(posts.createdAt) // Oldest first
    : desc(posts.createdAt); // Default: sort by newest posts

// Selection object for community
export const communitySelection = ({ userId }: newSelectionProps) => ({
  id: communities.id,
  name: communities.name,
  description: communities.description,
  image: communities.image,
  cover: communities.cover,
  createdAt: communities.createdAt,
  updatedAt: communities.updatedAt,
  creatorId: communities.creatorId,
  isPrivate: communities.isPrivate,
  // Additional Fields
  postsCount: db.$count(posts, eq(posts.communityId, communities.id)),
  membersCount: db.$count(
    communityMembers,
    eq(communityMembers.communityId, communities.id)
  ),
  creator: {
    id: users.id,
    name: users.name,
    image: users.image,
    email: users.email,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    confirmed: users.confirmed,
  },
  isJoined: db.$count(
    communityMembers,
    and(
      eq(communities.id, communityMembers.communityId),
      eq(communityMembers.userId, userId ?? 0)
    )
  ),
});

export const commentsSorter = (sortBy: SortOptions) =>
  sortBy === "Best"
    ? desc(
        sql`COUNT(votes.id) FILTER (WHERE votes.is_upvote = true) - COUNT(votes.id) FILTER (WHERE votes.is_upvote = false)`
      ) // Upvotes - Downvotes
    : sortBy === "Hot"
    ? desc(
        sql`(COUNT(votes.id) FILTER (WHERE votes.is_upvote = true) - COUNT(votes.id) FILTER (WHERE votes.is_upvote = false)) / (EXTRACT(EPOCH FROM NOW() - comments.created_at) + 2)`
      ) // Hot ranking formula
    : sortBy === "New"
    ? desc(comments.createdAt) // Most recent first
    : sortBy === "Top"
    ? desc(sql`COUNT(votes.id) FILTER (WHERE votes.is_upvote = true)`) // Total upvotes
    : sortBy === "Old"
    ? asc(comments.createdAt) // Oldest first
    : desc(comments.createdAt); // Default: sort by newest comments

export const commentSelection = ({ userId }: newSelectionProps) => ({
  id: comments.id,
  content: comments.content,
  createdAt: comments.createdAt,
  updatedAt: comments.updatedAt,
  authorId: comments.authorId,
  postId: comments.postId,
  parentCommentId: comments.parentCommentId,
  // Author Details
  author: {
    id: users.id,
    name: users.name,
    image: users.image,
    email: users.email,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    confirmed: users.confirmed,
  },
  // Upvote Count
  upvotesCount: db.$count(
    votes,
    and(eq(votes.commentId, comments.id), eq(votes.isUpvote, true))
  ),
  // Downvote Count
  downvotesCount: db.$count(
    votes,
    and(eq(votes.commentId, comments.id), eq(votes.isUpvote, false))
  ),
  // If the current user has upvoted
  isUpvoted: db.$count(
    votes,
    and(
      eq(votes.commentId, comments.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, true)
    )
  ),
  // If the current user has downvoted
  isDownvoted: db.$count(
    votes,
    and(
      eq(votes.commentId, comments.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, false)
    )
  ),
});

export const sender = aliasedTable(users, "sender");
export const receiver = aliasedTable(users, "receiver");
export const chatCreator = aliasedTable(users, "chat_creator");

export const messageSelection = () => ({
  id: messages.id,
  content: messages.content,
  createdAt: messages.createdAt,
  updatedAt: messages.updatedAt,
  senderId: messages.senderId,
  chatId: messages.chatId,
  media: messages.media,
  // Sender Details
  sender: {
    id: sender.id,
    name: sender.name,
    image: sender.image,
    email: sender.email,
    createdAt: sender.createdAt,
    updatedAt: sender.updatedAt,
    confirmed: sender.confirmed,
  },
});

export const chatSelection = () => ({
  id: chats.id,
  name: chats.name,
  image: chats.image,
  createdAt: chats.createdAt,
  updatedAt: chats.updatedAt,
  creatorId: chats.creatorId,
  isGroupChat: chats.isGroupChat,
  lastReadMessageId: chatParticipants.lastReadMessageId,
  // Additional Fields
  creator: {
    id: chatCreator.id,
    name: chatCreator.name,
    image: chatCreator.image,
    email: chatCreator.email,
    createdAt: chatCreator.createdAt,
    updatedAt: chatCreator.updatedAt,
    confirmed: chatCreator.confirmed,
  },
});

export const mapPostArrayResult = (
  posts: PostQueryResult[]
): ExtendedPost[] => {
  return posts.map(
    ({ isUpvoted, isDownvoted, upvotesCount, downvotesCount, ...post }) => ({
      ...post,
      isUpvoted:
        isUpvoted > 0 ? "upvote" : isDownvoted > 0 ? "downvote" : "none",
      upvotesCount: upvotesCount - downvotesCount,
    })
  );
};

export const mapSinglePostResult = (post: PostQueryResult): ExtendedPost => {
  return {
    ...post,
    isUpvoted:
      post.isUpvoted > 0
        ? "upvote"
        : post.isDownvoted > 0
        ? "downvote"
        : "none",
    upvotesCount: post.upvotesCount - post.downvotesCount,
  };
};

export const excludeHiddenPosts = (userId: number) =>
  notExists(
    db
      .select()
      .from(hiddenPosts)
      .where(
        and(
          eq(hiddenPosts.postId, posts.id),
          eq(hiddenPosts.userId, userId ?? 0)
        )
      )
  );

export const mapCommentArrayResult = (
  comments: CommentQueryResult[]
): ExtendedComment[] => {
  return comments.map(
    ({ isUpvoted, isDownvoted, upvotesCount, downvotesCount, ...comment }) => ({
      ...comment,
      isUpvoted: (isUpvoted > 0
        ? "upvote"
        : isDownvoted > 0
        ? "downvote"
        : "none") as VoteOptions,
      upvotesCount: upvotesCount - downvotesCount,
    })
  );
};

export const mapSingleCommentResult = (
  comment: CommentQueryResult
): ExtendedComment => {
  return {
    ...comment,
    isUpvoted: (comment.isUpvoted > 0
      ? "upvote"
      : comment.isDownvoted > 0
      ? "downvote"
      : "none") as VoteOptions,
    upvotesCount: comment.upvotesCount - comment.downvotesCount,
  };
};

export const mapCommunitiesResult = (
  communities: CommunityQueryResult[]
): extendedCommunity[] => {
  return communities.map((c) => ({
    ...c,
    isJoined: c.isJoined > 0,
  }));
};

// Function to handle register errors
export function registerErrorHandler(error: any): UserResponse {
  // Duplicate email error
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
  // Duplicate username error
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
  //   Generic error
  return {
    errors: [
      {
        field: "root",
        message: error.message,
      },
    ],
  };
}

export function buildMessageNotification(
  userId: number,
  message?: ExtendedMessage
): NotificationResponse {
  if (!message) {
    return {
      id: 0,
      type: NotificationEnum.DIRECT_MESSAGE,
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
    type: NotificationEnum.DIRECT_MESSAGE,
    userId,
    senderId: message.senderId,
    senderName: message.sender?.name ?? "Sender",
    content: message.content,
    entityId: message.id,
    entityType: "Message",
    isRead: false,
    createdAt: message.createdAt,
  };
}
