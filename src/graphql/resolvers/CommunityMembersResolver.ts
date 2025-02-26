import { communities, communityMembers } from "../../database/schema";
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";
import { ConfirmResponse, MyContext } from "../../types/resolvers";
import { and, eq } from "drizzle-orm";

// Input type for joining a community
@InputType()
export class JoinCommunityInput {
  @Field()
  communityId: number;
}

// Input type for leaving a community
@InputType()
export class LeaveCommunityInput {
  @Field()
  communityId: number;
}

@Resolver()
export class CommunityMembersResolver {
  // Mutation to join a community
  @Mutation(() => ConfirmResponse)
  async joinCommunity(
    @Ctx() ctx: MyContext,
    @Arg("options") options: JoinCommunityInput
  ): Promise<ConfirmResponse> {
    // Destructure input
    const { communityId } = options;
    // Get author id from session
    const userId = ctx.req.session.userId;
    // Check if user is logged in
    if (!userId) {
      return {
        success: false,
        errors: [
          {
            field: "creatorId",
            message: "You must be logged in to join a community",
          },
        ],
      };
    }
    // Add the user to the community
    try {
      const result = await ctx.db
        .insert(communityMembers)
        .values({ communityId, userId });
      // handle creation error
      if (result.rowCount === 0) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message: "Error joining community",
            },
          ],
        };
      }
      // Return success if no errors happened
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
            message: error.message ?? "An Error occurred during creation",
          },
        ],
      };
    }
  }

  //   Mutation to leave a community
  @Mutation(() => ConfirmResponse)
  async leaveCommunity(
    @Ctx() ctx: MyContext,
    @Arg("options") options: LeaveCommunityInput
  ): Promise<ConfirmResponse> {
    // Destructure input
    const { communityId } = options;
    // Get author id from session
    const userId = ctx.req.session.userId;
    // Check if user is logged in
    if (!userId) {
      return {
        success: false,
        errors: [
          {
            field: "userId",
            message: "You must be logged in to leave a community",
          },
        ],
      };
    }
    // Check if the user is the creator of the community
    const result = await ctx.db
      .select()
      .from(communities)
      .where(
        and(eq(communities.id, communityId), eq(communities.creatorId, userId))
      );
    if (result.length > 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You cannot leave your own community",
          },
        ],
      };
    }
    // Remove the user from the community
    try {
      const result = await ctx.db
        .delete(communityMembers)
        .where(
          and(
            eq(communityMembers.communityId, communityId),
            eq(communityMembers.userId, userId)
          )
        );
      if (result.rowCount === 0) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message:
                "Couldn't leave community. Please make sure a community with this id exists and you are a member of it.",
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
