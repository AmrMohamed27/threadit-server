import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { ConfirmResponse, MyContext } from "../../types/resolvers";
import { and, eq } from "drizzle-orm";
import { hiddenPosts } from "../../database/schema";

@Resolver()
export class HiddenPostsResolver {
  @Mutation(() => ConfirmResponse)
  async hidePost(
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
            message: "You must be logged in to hide a post.",
          },
        ],
      };
    }

    const result = await ctx.db.insert(hiddenPosts).values({
      userId,
      postId,
    });
    if (result.rowCount === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "An error occurred while hiding the post.",
          },
        ],
      };
    }
    return {
      success: true,
    };
  }

  @Mutation(() => ConfirmResponse)
  async unhidePost(
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
            message: "You must be logged in to unhide a post.",
          },
        ],
      };
    }

    const result = await ctx.db
      .delete(hiddenPosts)
      .where(
        and(eq(hiddenPosts.postId, postId), eq(hiddenPosts.userId, userId))
      );
    if (result.rowCount === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "An error occurred while unhiding the post.",
          },
        ],
      };
    }
    return {
      success: true,
    };
  }

  @Query(() => [Number]) // Returns an array of hidden post IDs
  async getHiddenPosts(@Ctx() ctx: MyContext) {
    // Check if user is logged in
    const userId = ctx.req.session.userId;
    if (!userId) {
      return [];
    }
    const hidden = await ctx.db
      .select({ postId: hiddenPosts.postId })
      .from(hiddenPosts)
      .where(eq(hiddenPosts.userId, userId));

    return hidden.map((h) => h.postId);
  }
}
