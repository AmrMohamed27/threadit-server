import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { ConfirmResponse, MyContext } from "../../types/resolvers";
import { and, count, eq, exists } from "drizzle-orm";
import {
  comments,
  communities,
  communityMembers,
  hiddenPosts,
  posts,
  savedPosts,
  users,
  votes,
} from "../../database/schema";
import { GetAllPostsInput, PostResponse } from "../../types/inputs";
import { postsSorter, savedPostSelection } from "../../lib/utils";

@Resolver()
export class SavedPostsResolver {
  // Mutation to save a post
  @Mutation(() => ConfirmResponse)
  async savePost(
    @Arg("postId") postId: number,
    @Ctx() ctx: MyContext
  ): Promise<ConfirmResponse> {
    const userId = ctx.req.session.userId;
    if (!userId) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You must be logged in to save a post.",
          },
        ],
      };
    }

    const result = await ctx.db.insert(savedPosts).values({
      userId,
      postId,
    });
    if (result.rowCount === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "An error occurred while saving the post.",
          },
        ],
      };
    }
    return {
      success: true,
    };
  }

  // Mutation to unsave a post
  @Mutation(() => ConfirmResponse)
  async unsavePost(
    @Arg("postId") postId: number,
    @Ctx() ctx: MyContext
  ): Promise<ConfirmResponse> {
    const userId = ctx.req.session.userId;
    if (!userId) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You must be logged in to unsave a post.",
          },
        ],
      };
    }

    const result = await ctx.db
      .delete(savedPosts)
      .where(and(eq(savedPosts.postId, postId), eq(savedPosts.userId, userId)));
    if (result.rowCount === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "An error occurred while unsaving the post.",
          },
        ],
      };
    }
    return {
      success: true,
    };
  }

  // Returns an array of saved post IDs
  @Query(() => [Number])
  async getSavedPostsIds(@Ctx() ctx: MyContext) {
    // Check if user is logged in
    const userId = ctx.req.session.userId;
    if (!userId) {
      return [];
    }
    const saved = await ctx.db
      .select({ postId: savedPosts.postId })
      .from(savedPosts)
      .where(eq(savedPosts.userId, userId));

    return saved.map((h) => h.postId);
  }

  // Query to get all saved posts
  @Query(() => PostResponse)
  async getSavedPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetAllPostsInput
  ): Promise<PostResponse> {
    // Destructure input
    const { page, limit, sortBy } = options;
    // Get user id from session
    const userId = ctx.req.session.userId;
    if (!userId) {
      return {
        errors: [
          {
            field: "root",
            message: "You must be logged in to get your saved posts",
          },
        ],
      };
    }
    // Fetch posts with author, upvote count, user upvoted status, and comment count
    const result = await ctx.db
      .select(savedPostSelection({ ctx, userId }))
      .from(posts)
      .where(
        // Only include posts that are saved by the user
        exists(
          ctx.db
            .select()
            .from(savedPosts)
            .where(
              and(
                eq(savedPosts.postId, posts.id),
                eq(savedPosts.userId, userId ?? 0)
              )
            )
        )
      )
      .leftJoin(users, eq(posts.id, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
      .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
      .leftJoin(communities, eq(posts.communityId, communities.id)) // Join communities to get community details
      .leftJoin(
        communityMembers,
        eq(posts.communityId, communityMembers.communityId)
      ) // Join community members to get community member count
      .groupBy(posts.id, users.id, communities.id, communityMembers.communityId) // Group by to avoid duplicates
      .orderBy(postsSorter(sortBy ?? "Best"))
      .limit(limit)
      .offset((page - 1) * limit);

    if (!result || result.length === 0) {
      return {
        errors: [{ field: "posts", message: "No saved posts found" }],
      };
    }

    const resultCount = await ctx.db
      .select({ count: count() })
      .from(posts)
      .where(
        // Only include posts that are saved by the user
        exists(
          ctx.db
            .select()
            .from(savedPosts)
            .where(
              and(
                eq(savedPosts.postId, posts.id),
                eq(savedPosts.userId, userId ?? 0)
              )
            )
        )
      );
    return {
      postsArray: result.map(
        ({
          isUpvoted,
          isDownvoted,
          upvotesCount,
          downvotesCount,
          ...post
        }) => ({
          ...post,
          isUpvoted:
            isUpvoted > 0 ? "upvote" : isDownvoted > 0 ? "downvote" : "none",
          upvotesCount: upvotesCount - downvotesCount,
        })
      ),
      count: resultCount[0].count,
    };
  }
}
