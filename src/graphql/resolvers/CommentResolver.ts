import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import {
  CommentResponse,
  CreateCommentInput,
  GetCommentByIdInput,
  GetPostCommentsInput,
  GetUserCommentsInput,
  UpdateCommentInput,
} from "../../types/inputs";
import { ConfirmResponse, MyContext } from "../../types/resolvers";

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
    return await ctx.Services.comments.getUserComments({
      userId,
      sortBy,
      limit,
      page,
    });
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
    return await ctx.Services.comments.getPostComments({
      userId,
      sortBy,
      searchTerm,
      postId,
    });
  }

  // Query to get a comment by id
  @Query(() => CommentResponse)
  async getComment(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetCommentByIdInput
  ): Promise<CommentResponse> {
    // Destructure input
    const { commentId } = options;
    // Get user id from session
    const userId = ctx.req.session.userId;
    return await ctx.Services.comments.getCommentById({
      userId,
      commentId,
    });
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
    return await ctx.Services.comments.createComment({
      content,
      authorId,
      postId,
      parentCommentId,
    });
  }
  // Mutation to delete a comment
  @Mutation(() => ConfirmResponse)
  async deleteComment(
    @Ctx() ctx: MyContext,
    @Arg("id") id: number
  ): Promise<ConfirmResponse> {
    const authorId = ctx.req.session.userId;
    return await ctx.Services.comments.deleteComment({
      authorId,
      commentId: id,
    });
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
    return await ctx.Services.comments.updateComment({
      authorId,
      commentId: id,
      content,
    });
  }
}
