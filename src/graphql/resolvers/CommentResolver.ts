import { and, eq, ilike, or } from "drizzle-orm";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { comments, users, votes } from "../../database/schema";
import {
  buildCommentThread,
  commentSelection,
  commentsSorter,
  userCommentsSelection,
} from "../../lib/utils";
import {
  CommentResponse,
  CreateCommentInput,
  GetCommentByIdInput,
  GetPostCommentsInput,
  GetUserCommentsInput,
  UpdateCommentInput,
} from "../../types/inputs";
import { ConfirmResponse, MyContext, VoteOptions } from "../../types/resolvers";

@Resolver()
export class CommentResolver {
  // Query to get all comments of a user
  @Query(() => CommentResponse)
  // Context object contains request and response headers and database connection, function returns an array of comments or errors
  async getUserComments(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetUserCommentsInput
  ): Promise<CommentResponse> {
    // Destructure input
    const { userId: passedUserId, sortBy, page, limit } = options;
    const loggedInUserId = ctx.req.session.userId;
    const userId = passedUserId ? passedUserId : loggedInUserId;
    if (!userId) {
      return {
        errors: [
          {
            field: "userId",
            message: "You must be logged in to get your comments",
          },
        ],
      };
    }
    // Fetch all comments from database
    const allComments = await ctx.db
      .select(userCommentsSelection({ ctx, userId }))
      .from(comments)
      .where(eq(comments.authorId, userId))
      .leftJoin(users, eq(comments.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(comments.id, votes.commentId)) // Join votes to get upvote count
      .groupBy(comments.id, users.id) // Group by to avoid duplicates
      .orderBy(commentsSorter(sortBy ?? "Best"))
      .limit(limit)
      .offset((page - 1) * limit);
    // Handle not found error
    if (!allComments || allComments.length === 0) {
      return {
        errors: [
          {
            field: "comments",
            message: "No comments found",
          },
        ],
      };
    }
    // Return comments array
    return {
      commentsArray: allComments.map(
        ({
          isUpvoted,
          isDownvoted,
          commentsCount,
          upvotesCount,
          downvotesCount,
          ...post
        }) => ({
          ...post,
          isUpvoted: (isUpvoted > 0
            ? "upvote"
            : isDownvoted > 0
            ? "downvote"
            : "none") as VoteOptions,
          upvotesCount: upvotesCount - downvotesCount,
        })
      ),
      count: allComments[0].commentsCount,
    };
  }

  // Query to get all comments of a post
  @Query(() => CommentResponse)
  async getPostComments(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetPostCommentsInput
  ): Promise<CommentResponse> {
    // Destructure input
    const { postId, sortBy, searchTerm } = options;
    // Get user id from session
    const userId = ctx.req.session.userId;
    // Fetch comments by post id from database
    const result = await ctx.db
      .select(commentSelection({ ctx, userId, postId }))
      .from(comments)
      .where(
        searchTerm
          ? and(
              eq(comments.postId, postId),
              ilike(comments.content, "%" + searchTerm + "%")
            )
          : eq(comments.postId, postId)
      )
      .leftJoin(users, eq(comments.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(comments.id, votes.commentId)) // Join votes to get upvote count
      .groupBy(comments.id, users.id) // Group by to avoid duplicates
      .orderBy(commentsSorter(sortBy ?? "Best"));
    // Handle not found error
    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "id",
            message: "No comments found",
          },
        ],
      };
    }
    // Convert the flat list into a threaded structure
    const flatList = result.map(
      ({
        isUpvoted,
        isDownvoted,
        commentsCount,
        upvotesCount,
        downvotesCount,
        ...post
      }) => ({
        ...post,
        isUpvoted: (isUpvoted > 0
          ? "upvote"
          : isDownvoted > 0
          ? "downvote"
          : "none") as VoteOptions,
        upvotesCount: upvotesCount - downvotesCount,
      })
    );
    if (searchTerm) {
      // For search results just return a flat list
      return {
        commentsArray: flatList,
        count: result[0].commentsCount,
      };
    } else {
      const threadedComments = buildCommentThread(flatList);
      return {
        commentsArray: threadedComments,
        count: result[0].commentsCount,
      };
    }
  }

  // Query to get a comment by id
  @Query(() => CommentResponse)
  async getComment(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetCommentByIdInput
  ): Promise<CommentResponse> {
    // Destructure input
    const { commentId, postId } = options;
    // Get user id from session
    const userId = ctx.req.session.userId;
    // Fetch comment by id from database
    const result = await ctx.db
      .select(commentSelection({ ctx, userId, postId }))
      .from(comments)
      .where(
        or(eq(comments.id, commentId), eq(comments.parentCommentId, commentId))
      )
      .leftJoin(users, eq(comments.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(comments.id, votes.commentId)) // Join votes to get upvote count
      .groupBy(comments.id, users.id); // Group by to avoid duplicates
    // Handle not found error
    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "id",
            message: "No comment found with that id",
          },
        ],
      };
    }
    // Convert the flat list into a threaded structure
    const flatList = result.map(
      ({
        isUpvoted,
        isDownvoted,
        commentsCount,
        upvotesCount,
        downvotesCount,
        parentCommentId,
        ...comment
      }) => ({
        ...comment,
        isUpvoted: (isUpvoted > 0
          ? "upvote"
          : isDownvoted > 0
          ? "downvote"
          : "none") as VoteOptions,
        upvotesCount: upvotesCount - downvotesCount,
        parentCommentId: comment.id === commentId ? null : parentCommentId,
      })
    );
    const threadedComments = buildCommentThread(flatList);
    return {
      commentsArray: threadedComments,
      count: result[0].commentsCount,
    };
  }

  // Mutation to create a new comment
  @Mutation(() => CommentResponse)
  async createComment(
    @Ctx() ctx: MyContext,
    @Arg("options") options: CreateCommentInput
  ): Promise<CommentResponse> {
    // Destructure input
    const { content, postId, parentCommentId } = options;
    // Get author id from session
    const authorId = ctx.req.session.userId;
    // Check if user is logged in
    if (!authorId) {
      return {
        errors: [
          {
            field: "authorId",
            message: "You must be logged in to create a comment",
          },
        ],
      };
    }
    // Create new comment and insert it in database
    try {
      const newComment = await ctx.db
        .insert(comments)
        .values({ content, authorId, postId, parentCommentId })
        .returning();
      // handle creation error
      if (!newComment || newComment.length === 0) {
        return {
          errors: [
            {
              field: "root",
              message: "Error creating comment",
            },
          ],
        };
      }
      // Return the created comment
      return {
        comment: newComment[0],
      };
    } catch (error) {
      console.error(error);
      return {
        errors: [
          {
            field: "root",
            message: error.message ?? "An Error occurred during creation",
          },
        ],
      };
    }
  }
  // Mutation to delete a comment
  @Mutation(() => ConfirmResponse)
  async deleteComment(
    @Ctx() ctx: MyContext,
    @Arg("id") id: number
  ): Promise<ConfirmResponse> {
    const authorId = ctx.req.session.userId;
    if (!authorId) {
      return {
        success: false,
        errors: [
          {
            field: "authorId",
            message: "You must be logged in to delete a comment",
          },
        ],
      };
    }
    const result = await ctx.db
      .select()
      .from(comments)
      .where(eq(comments.id, id));
    if (!result || result.length === 0) {
      return {
        success: false,
        errors: [
          {
            field: "id",
            message: "No comment found with that id",
          },
        ],
      };
    }
    const comment = result[0];
    if (comment.authorId !== authorId) {
      return {
        success: false,
        errors: [
          {
            field: "authorId",
            message: "You are not authorized to delete this comment",
          },
        ],
      };
    }
    try {
      const result = await ctx.db.delete(comments).where(eq(comments.id, id));
      if (result.rowCount === 0) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message: "No comments deleted",
            },
          ],
        };
      }
      return {
        success: true,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: error.message ?? "An Error occurred during deletion",
          },
        ],
      };
    }
  }
  // Mutation to update a comment
  @Mutation(() => ConfirmResponse, { nullable: true })
  async updateComment(
    @Ctx() ctx: MyContext,
    @Arg("options") options: UpdateCommentInput
  ): Promise<ConfirmResponse> {
    // Destructure input
    const { id, content } = options;
    // Get author id from session
    const authorId = ctx.req.session.userId;
    // Check if user is logged in
    if (!authorId) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You must be logged in to update a comment",
          },
        ],
      };
    }
    // Fetch comment by id from database
    const result = await ctx.db
      .select()
      .from(comments)
      .where(eq(comments.id, id));
    // Handle not found error
    if (!result || result.length === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "No comment found with that id",
          },
        ],
      };
    }
    // Check if user is authorized to update the comment
    const comment = result[0];
    if (comment.authorId !== authorId) {
      return {
        success: false,
        errors: [
          {
            field: "authorId",
            message: "You are not authorized to update this comment",
          },
        ],
      };
    }
    // Check if title or content is the same as the original
    if (comment.content === content) {
      return {
        success: false,
        errors: [
          {
            field: "content",
            message: "Content is the same as the original",
          },
        ],
      };
    }
    try {
      // Update comment
      const updatedComment = await ctx.db
        .update(comments)
        .set({
          content: content,
        })
        .where(eq(comments.id, id))
        .returning();
      if (!updatedComment || updatedComment.length === 0) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message: "An error happened while updating the comment",
            },
          ],
        };
      }
      return {
        success: true,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: error.message ?? "An Error occurred during update",
          },
        ],
      };
    }
  }
}
