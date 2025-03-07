import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import {
  CreateVoteInput,
  DeleteVoteOptions,
  UpdateVoteInput,
  VoteResponse,
} from "../../types/inputs";
import { ConfirmResponse, MyContext } from "../../types/resolvers";

@Resolver()
export class VoteResolver {
  // Mutation to create a new vote
  @Mutation(() => VoteResponse)
  async createVote(
    @Ctx() ctx: MyContext,
    @Arg("options") options: CreateVoteInput
  ): Promise<VoteResponse> {
    // Destructure input
    const { isUpvote, postId, commentId } = options;
    const authorId = ctx.req.session.userId;
    return await ctx.Services.votes.createVote({
      postId,
      commentId,
      isUpvote,
      authorId,
    });
  }
  // Mutation to delete a vote
  @Mutation(() => ConfirmResponse)
  async deleteVote(
    @Ctx() ctx: MyContext,
    @Arg("options") options: DeleteVoteOptions
  ): Promise<ConfirmResponse> {
    // Destructure options
    const { postId, commentId } = options;
    // Check if user is logged in
    const authorId = ctx.req.session.userId;
    return await ctx.Services.votes.deleteVote({ postId, commentId, authorId });
  }
  // Mutation to update a vote
  @Mutation(() => ConfirmResponse, { nullable: true })
  async updateVote(
    @Ctx() ctx: MyContext,
    @Arg("options") options: UpdateVoteInput
  ): Promise<ConfirmResponse> {
    // Destructure input
    const { postId, commentId, isUpvote } = options;
    // Get author id from session
    const userId = ctx.req.session.userId;
    return await ctx.Services.votes.updateVote({
      userId,
      isUpvote,
      postId,
      commentId,
    });
  }
}
