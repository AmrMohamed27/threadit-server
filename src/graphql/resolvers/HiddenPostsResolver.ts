import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { ConfirmResponse, MyContext } from "../../types/resolvers";

@Resolver()
export class HiddenPostsResolver {
  @Mutation(() => ConfirmResponse)
  async hidePost(
    @Arg("postId") postId: number,
    @Ctx() ctx: MyContext
  ): Promise<ConfirmResponse> {
    const userId = ctx.req.session.userId;
    return await ctx.Services.hiddenPosts.hidePost({ postId, userId });
  }

  @Mutation(() => ConfirmResponse)
  async unhidePost(
    @Arg("postId") postId: number,
    @Ctx() ctx: MyContext
  ): Promise<ConfirmResponse> {
    const userId = ctx.req.session.userId;
    return await ctx.Services.hiddenPosts.unhidePost({ postId, userId });
  }

  @Query(() => [Number]) // Returns an array of hidden post IDs
  async getHiddenPosts(@Ctx() ctx: MyContext) {
    // Check if user is logged in
    const userId = ctx.req.session.userId;
    return await ctx.Services.hiddenPosts.fetchHiddenPostsIds({ userId });
  }
}
