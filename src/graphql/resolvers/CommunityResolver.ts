import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import {
  CommunityResponse,
  CreateCommunityInput,
  GetSearchResultInput,
  UpdateCommunityInput,
} from "../../types/inputs";
import { ConfirmResponse, MyContext } from "../../types/resolvers";

@Resolver()
export class CommunityResolver {
  // Query to get a community by name
  @Query(() => CommunityResponse)
  async getCommunityByName(
    @Ctx() ctx: MyContext,
    @Arg("name") name: string
  ): Promise<CommunityResponse> {
    // Get user id from session
    const userId = ctx.userId;
    return await ctx.Services.communities.fetchCommunityByName({
      userId,
      name,
    });
  }
  // Query to get all communities
  @Query(() => CommunityResponse)
  async getAllCommunities(@Ctx() ctx: MyContext): Promise<CommunityResponse> {
    // Get user id from session
    const userId = ctx.userId;
    return await ctx.Services.communities.fetchAllCommunities({
      userId,
      sortBy: "New",
    });
  }

  // Query to get the latest 4 communities where the user isn't joined for the explore page
  @Query(() => CommunityResponse)
  async getExploreCommunities(
    @Ctx() ctx: MyContext,
    @Arg("limit") limit: number
  ): Promise<CommunityResponse> {
    // Get user id from session
    const userId = ctx.userId;
    return await ctx.Services.communities.fetchExploreCommunities({
      userId,
      sortBy: "New",
      limit,
    });
  }

  // Query to search for communities using a search term
  @Query(() => CommunityResponse)
  async searchCommunities(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetSearchResultInput
  ): Promise<CommunityResponse> {
    // Destructure input
    const { searchTerm, page, limit } = options;
    // Get user id from session
    const userId = ctx.userId;
    return await ctx.Services.communities.searchCommunities({
      userId,
      page,
      limit,
      searchTerm,
      sortBy: "Top",
    });
  }

  //   Query to get all the user's communities
  @Query(() => CommunityResponse)
  async getUserCommunities(@Ctx() ctx: MyContext): Promise<CommunityResponse> {
    // Get user id from session
    const userId = ctx.userId;
    return await ctx.Services.communities.fetchUserCommunities({
      userId,
      sortBy: "New",
    });
  }

  //   Mutation to create a new community
  @Mutation(() => CommunityResponse)
  async createCommunity(
    @Ctx() ctx: MyContext,
    @Arg("options") options: CreateCommunityInput
  ): Promise<CommunityResponse> {
    // Destructure input
    const { name, description, image, isPrivate = false } = options;
    // Get author id from session
    const creatorId = ctx.userId;
    return await ctx.Services.communities.createCommunity({
      name,
      description,
      image,
      isPrivate,
      creatorId,
    });
  }

  //   Mutation to update a community
  @Mutation(() => ConfirmResponse)
  async updateCommunity(
    @Ctx() ctx: MyContext,
    @Arg("options") options: UpdateCommunityInput
  ): Promise<ConfirmResponse> {
    // Destructure input
    const { id, name, description, image } = options;
    // Get author id from session
    const creatorId = ctx.userId;
    return await ctx.Services.communities.updateCommunity({
      communityId: id,
      creatorId,
      name,
      description,
      image,
    });
  }

  //   Mutation to delete a community
  @Mutation(() => ConfirmResponse)
  async deleteCommunity(
    @Ctx() ctx: MyContext,
    @Arg("id") id: number
  ): Promise<ConfirmResponse> {
    const creatorId = ctx.userId;
    return await ctx.Services.communities.deleteCommunity({
      communityId: id,
      creatorId,
    });
  }
}
