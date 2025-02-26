import { ExtendedComment } from "@/graphql/resolvers/CommentResolver";
import {
  searchSelectionProps,
  selectionProps,
  SortOptions,
} from "@/types/resolvers";
import {
  and,
  asc,
  count,
  desc,
  eq,
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
  users,
  votes,
} from "../database/schema";

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
  commentsCount: count(comments),
  // Posts count
  postsCount: ctx.db.$count(
    posts,
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
  commentsCount: count(comments),
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
