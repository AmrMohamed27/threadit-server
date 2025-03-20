import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import {
  CreatePostInput,
  GetAllPostsInput,
  GetCommunityPostsInput,
  GetSearchResultInput,
  GetUserCommunityPostsInput,
  GetUserHiddenPostsInput,
  GetUserPostsInput,
  GetUserVotedPostsOptions,
  PostResponse,
  UpdatePostInput,
} from "../../types/inputs";
import { ConfirmResponse, MyContext } from "../../types/resolvers";

@Resolver()
export class PostResolver {
  // Query to get all posts
  @Query(() => PostResponse)
  // Context object contains request and response headers and database connection, function returns an array of posts or errors
  async getAllPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetAllPostsInput
  ): Promise<PostResponse> {
    // Destructure input
    const { page, limit, sortBy } = options;
    // Get user id from session if logged in
    const userId = ctx.userId;
    return await ctx.Services.posts.fetchAllPosts({
      sortBy,
      userId,
      limit,
      page,
    });
  }

  // Query to get all posts in the communities where the user is a member
  @Query(() => PostResponse)
  async getUserCommunityPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetUserCommunityPostsInput
  ): Promise<PostResponse> {
    // Destructure input
    const { page, limit, sortBy } = options;
    // Get user id from session
    const userId = ctx.userId;
    // Returns all posts if user is not logged in, else returns posts from only the user's communities
    return await ctx.Services.posts.fetchUserCommunityPosts({
      sortBy,
      userId,
      limit,
      page,
    });
  }

  // Query to get all posts in a community
  @Query(() => PostResponse)
  async getCommunityPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetCommunityPostsInput
  ): Promise<PostResponse> {
    // Destructure input
    const { communityId, page, limit, sortBy } = options;
    // Get user id from session
    const userId = ctx.userId;
    return await ctx.Services.posts.fetchCommunityPosts({
      sortBy,
      userId,
      limit,
      page,
      communityId,
    });
  }

  // Query to search for posts using a search term
  @Query(() => PostResponse)
  async searchPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetSearchResultInput
  ): Promise<PostResponse> {
    // Destructure input
    const { searchTerm, page, limit, sortBy } = options;
    // Get user id from session
    const userId = ctx.userId;
    // Fetch all posts from database
    return await ctx.Services.posts.fetchSearchPosts({
      sortBy,
      userId,
      limit,
      page,
      searchTerm,
    });
  }

  // Query to get all the user's posts
  @Query(() => PostResponse)
  // Context object contains request and response headers and database connection, function returns an array of posts or errors
  async getUserPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetUserPostsInput
  ): Promise<PostResponse> {
    // Destructure input
    const { userId, page, limit, sortBy = "New" } = options;
    const authorId = userId ? userId : ctx.userId;
    return await ctx.Services.posts.fetchUserPosts({
      sortBy,
      userId,
      authorId,
      limit,
      page,
    });
  }

  // Query to get the user's hidden posts
  @Query(() => PostResponse)
  async getUserHiddenPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetUserHiddenPostsInput
  ): Promise<PostResponse> {
    // Destructure input
    const { page, limit, sortBy } = options;
    // Get user id from session
    const userId = ctx.userId;
    return await ctx.Services.posts.fetchUserHiddenPosts({
      sortBy,
      userId,
      limit,
      page,
    });
  }
  // Query to get all posts the user has upvoted or downvoted
  @Query(() => PostResponse)
  async getUserVotedPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetUserVotedPostsOptions
  ): Promise<PostResponse> {
    // Destructure options
    const { sortBy, limit, page, isUpvoted } = options;
    // Check if user is logged in
    const userId = ctx.userId;
    return await ctx.Services.posts.fetchUserVotedPosts({
      sortBy,
      userId,
      limit,
      page,
      isUpvoted,
    });
  }
  // Query to get a post by id
  @Query(() => PostResponse)
  async getPost(
    @Ctx() ctx: MyContext,
    @Arg("id", () => Int) id: number
  ): Promise<PostResponse> {
    // Get user id from session
    const userId = ctx.userId;
    return await ctx.Services.posts.fetchPostById({
      postId: id,
      userId,
    });
  }

  // Mutation to create a new post
  @Mutation(() => PostResponse)
  async createPost(
    @Ctx() ctx: MyContext,
    @Arg("options") options: CreatePostInput
  ): Promise<PostResponse> {
    // Destructure input
    const { title, content, communityId, media, video } = options;
    // Get author id from session
    const authorId = ctx.userId;
    return await ctx.Services.posts.createPost({
      title,
      content,
      communityId,
      authorId,
      media,
      video,
    });
  }

  // Mutation to delete a post
  @Mutation(() => ConfirmResponse)
  async deletePost(
    @Ctx() ctx: MyContext,
    @Arg("id") id: number
  ): Promise<ConfirmResponse> {
    const authorId = ctx.userId;
    return await ctx.Services.posts.deletePost({
      postId: id,
      authorId,
    });
  }

  // Mutation to update a post
  @Mutation(() => ConfirmResponse)
  async updatePost(
    @Ctx() ctx: MyContext,
    @Arg("options") options: UpdatePostInput
  ): Promise<ConfirmResponse> {
    // Destructure input
    const { id, title, content } = options;
    // Get current user id from session
    const authorId = ctx.userId;
    return await ctx.Services.posts.updatePost({
      title,
      content,
      postId: id,
      authorId,
    });
  }
}
