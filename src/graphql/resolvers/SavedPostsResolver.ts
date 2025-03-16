import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { GetAllPostsInput, PostResponse } from "../../types/inputs";
import { ConfirmResponse, MyContext } from "../../types/resolvers";

@Resolver()
export class SavedPostsResolver {
  // Mutation to save a post
  @Mutation(() => ConfirmResponse)
  async savePost(
    @Arg("postId") postId: number,
    @Ctx() ctx: MyContext
  ): Promise<ConfirmResponse> {
    const userId = ctx.userId;
    return await ctx.Services.savedPosts.savePost({ postId, userId });
  }

  // Mutation to unsave a post
  @Mutation(() => ConfirmResponse)
  async unsavePost(
    @Arg("postId") postId: number,
    @Ctx() ctx: MyContext
  ): Promise<ConfirmResponse> {
    const userId = ctx.userId;
    return await ctx.Services.savedPosts.unsavePost({ postId, userId });
  }

  // Returns an array of saved post IDs
  @Query(() => [Number])
  async getSavedPostsIds(@Ctx() ctx: MyContext) {
    // Check if user is logged in
    const userId = ctx.userId;
    return await ctx.Services.savedPosts.getSavedPostIds({ userId });
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
    const userId = ctx.userId;
    return await ctx.Services.posts.fetchUserSavedPosts({
      userId,
      page,
      limit,
      sortBy,
    });
  }
}
