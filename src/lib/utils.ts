import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  ilike,
  notExists,
  or,
  sql,
} from "drizzle-orm";
import {
  comments,
  communities,
  communityMembers,
  hiddenPosts,
  posts,
  savedPosts,
  users,
  votes,
} from "../database/schema";
import { ExtendedComment } from "../types/inputs";
import {
  searchSelectionProps,
  selectionProps,
  SortOptions,
} from "../types/resolvers";

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

export const postSelection = ({ ctx, userId }: selectionProps) => ({
  id: posts.id,
  title: posts.title,
  content: posts.content,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  authorId: posts.authorId,
  communityId: posts.communityId,
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
    membersCount: ctx.db.$count(
      communityMembers,
      eq(communityMembers.communityId, posts.communityId)
    ),
    postsCount: ctx.db.$count(
      posts,
      eq(posts.communityId, communityMembers.communityId)
    ),
  },
  // Upvote Count
  upvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, true))
  ),
  // Downvote Count
  downvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, false))
  ),
  // If the current user has upvoted
  isUpvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, true)
    )
  ),
  // If the current user has downvoted
  isDownvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, false)
    )
  ),
  // Comment Count
  commentsCount: ctx.db.$count(comments, eq(comments.postId, posts.id)),
});
export const userPostsSelection = ({ ctx, userId }: selectionProps) => ({
  id: posts.id,
  title: posts.title,
  content: posts.content,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  authorId: posts.authorId,
  communityId: posts.communityId,
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
    membersCount: ctx.db.$count(
      communityMembers,
      eq(communityMembers.communityId, posts.communityId)
    ),
    postsCount: ctx.db.$count(
      posts,
      eq(posts.communityId, communityMembers.communityId)
    ),
  },
  // Upvote Count
  upvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, true))
  ),
  // Downvote Count
  downvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, false))
  ),
  // If the current user has upvoted
  isUpvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, true)
    )
  ),
  // If the current user has downvoted
  isDownvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, false)
    )
  ),
  // Comment Count
  commentsCount: ctx.db.$count(comments, eq(comments.postId, posts.id)),
  // Posts count
  postsCount: ctx.db.$count(
    posts,
    and(
      notExists(
        ctx.db
          .select()
          .from(hiddenPosts)
          .where(
            and(
              eq(hiddenPosts.postId, posts.id),
              eq(hiddenPosts.userId, userId ?? 0)
            )
          )
      ),
      eq(posts.authorId, userId ?? 0)
    )
  ),
});
export const hiddenPostSelection = ({ ctx, userId }: selectionProps) => ({
  id: posts.id,
  title: posts.title,
  content: posts.content,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  authorId: posts.authorId,
  communityId: posts.communityId,
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
    membersCount: ctx.db.$count(
      communityMembers,
      eq(communityMembers.communityId, posts.communityId)
    ),
    postsCount: ctx.db.$count(
      posts,
      eq(posts.communityId, communityMembers.communityId)
    ),
  },
  // Upvote Count
  upvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, true))
  ),
  // Downvote Count
  downvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, false))
  ),
  // If the current user has upvoted
  isUpvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, true)
    )
  ),
  // If the current user has downvoted
  isDownvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, false)
    )
  ),
  // Comment Count
  commentsCount: ctx.db.$count(comments, eq(comments.postId, posts.id)),
  // Posts count
  postsCount: ctx.db.$count(
    posts,
    exists(
      ctx.db
        .select()
        .from(hiddenPosts)
        .where(
          and(
            eq(hiddenPosts.postId, posts.id),
            eq(hiddenPosts.userId, userId ?? 0)
          )
        )
    )
  ),
});
export const votedPostSelection = ({
  ctx,
  userId,
  isUpvoted,
}: selectionProps) => ({
  id: posts.id,
  title: posts.title,
  content: posts.content,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  authorId: posts.authorId,
  communityId: posts.communityId,
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
    membersCount: ctx.db.$count(
      communityMembers,
      eq(communityMembers.communityId, posts.communityId)
    ),
    postsCount: ctx.db.$count(
      posts,
      eq(posts.communityId, communityMembers.communityId)
    ),
  },
  // Upvote Count
  upvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, true))
  ),
  // Downvote Count
  downvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, false))
  ),
  // If the current user has upvoted
  isUpvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, true)
    )
  ),
  // If the current user has downvoted
  isDownvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, false)
    )
  ),
  // Comment Count
  commentsCount: ctx.db.$count(comments, eq(comments.postId, posts.id)),

  // Posts count
  postsCount: ctx.db.$count(
    posts,
    exists(
      ctx.db
        .select()
        .from(votes)
        .where(
          and(
            eq(votes.postId, posts.id),
            eq(votes.userId, userId ?? 0),
            eq(votes.isUpvote, isUpvoted ?? true)
          )
        )
    )
  ),
});

export const communityPostSelection = ({
  ctx,
  userId,
  communityId,
}: selectionProps) => ({
  id: posts.id,
  title: posts.title,
  content: posts.content,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  authorId: posts.authorId,
  communityId: posts.communityId,
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
    membersCount: ctx.db.$count(
      communityMembers,
      eq(communityMembers.communityId, posts.communityId)
    ),
    postsCount: ctx.db.$count(
      posts,
      and(
        eq(posts.communityId, communityMembers.communityId),
        eq(posts.communityId, communityId ?? 0)
      )
    ),
  },
  // Upvote Count
  upvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, true))
  ),
  // Downvote Count
  downvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, false))
  ),
  // If the current user has upvoted
  isUpvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, true)
    )
  ),
  // If the current user has downvoted
  isDownvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, false)
    )
  ),
  // Comment Count
  commentsCount: ctx.db.$count(comments, eq(comments.postId, posts.id)),
  // Posts count
  count: ctx.db.$count(
    posts,
    and(
      notExists(
        ctx.db
          .select()
          .from(hiddenPosts)
          .where(
            and(
              eq(hiddenPosts.postId, posts.id),
              eq(hiddenPosts.userId, userId ?? 0)
            )
          )
      ),
      eq(posts.communityId, communityId ?? 0)
    )
  ),
});

export const savedPostSelection = ({ ctx, userId }: selectionProps) => ({
  id: posts.id,
  title: posts.title,
  content: posts.content,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  authorId: posts.authorId,
  communityId: posts.communityId,
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
    membersCount: ctx.db.$count(
      communityMembers,
      eq(communityMembers.communityId, posts.communityId)
    ),
    postsCount: ctx.db.$count(
      posts,
      eq(posts.communityId, communityMembers.communityId)
    ),
  },
  // Upvote Count
  upvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, true))
  ),
  // Downvote Count
  downvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, false))
  ),
  // If the current user has upvoted
  isUpvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, true)
    )
  ),
  // If the current user has downvoted
  isDownvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, false)
    )
  ),
  // Comment Count
  commentsCount: ctx.db.$count(comments, eq(comments.postId, posts.id)),
  // Posts count
  count: ctx.db.$count(savedPosts, eq(savedPosts.postId, posts.id)),
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

export const searchSelection = ({
  ctx,
  userId,
  searchTerm,
}: searchSelectionProps) => ({
  ...postSelection({ ctx, userId }),
  totalCount: ctx.db.$count(
    posts,
    or(
      ilike(posts.content, "%" + searchTerm + "%"),
      ilike(posts.title, "%" + searchTerm + "%")
    )
  ),
});


// Selection object for community
export const communitySelection = ({ ctx, userId }: selectionProps) => ({
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
  postsCount: ctx.db.$count(posts, eq(posts.communityId, communities.id)),
  membersCount: ctx.db.$count(
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
  isJoined: ctx.db.$count(
    communityMembers,
    and(
      eq(communities.id, communityMembers.communityId),
      eq(communityMembers.userId, userId ?? 0)
    )
  ),
});

// Selection object for searching communities
export const searchCommunitySelection = ({
  ctx,
  userId,
  searchTerm,
}: searchSelectionProps) => ({
  ...communitySelection({ ctx, userId }),
  totalCount: ctx.db.$count(
    communities,
    ilike(communities.name, "%" + searchTerm + "%")
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

export const commentSelection = ({ ctx, userId }: selectionProps) => ({
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
  upvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.commentId, comments.id), eq(votes.isUpvote, true))
  ),
  // Downvote Count
  downvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.commentId, comments.id), eq(votes.isUpvote, false))
  ),
  // If the current user has upvoted
  isUpvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.commentId, comments.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, true)
    )
  ),
  // If the current user has downvoted
  isDownvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.commentId, comments.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, false)
    )
  ),
  // Comments count
  commentsCount: ctx.db.$count(
    comments,
    eq(comments.parentCommentId, comments.id ?? 0)
  ),
});

export const userCommentsSelection = ({ ctx, userId }: selectionProps) => ({
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
  upvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.commentId, comments.id), eq(votes.isUpvote, true))
  ),
  // Downvote Count
  downvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.commentId, comments.id), eq(votes.isUpvote, false))
  ),
  // If the current user has upvoted
  isUpvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.commentId, comments.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, true)
    )
  ),
  // If the current user has downvoted
  isDownvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.commentId, comments.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, false)
    )
  ),
  // Comments count
  commentsCount: ctx.db.$count(comments, eq(comments.authorId, userId ?? 0)),
});
