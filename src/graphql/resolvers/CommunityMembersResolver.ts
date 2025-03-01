import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { JoinCommunityInput, LeaveCommunityInput } from "../../types/inputs";
import { ConfirmResponse, MyContext } from "../../types/resolvers";

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
    return await ctx.Services.communityMembers.joinCommunity(
      communityId,
      userId
    );
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
    return await ctx.Services.communityMembers.leaveCommunity(
      communityId,
      userId
    );
  }
}
