import { communitySelection, searchCommunitySelection } from "../../lib/utils";
import { and, desc, eq, ilike, not, notExists, or } from "drizzle-orm";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import {
  communities,
  communityMembers,
  posts,
  users,
} from "../../database/schema";
import { ConfirmResponse, MyContext } from "../../types/resolvers";
import {
  CommunityResponse,
  CreateCommunityInput,
  GetSearchResultInput,
  UpdateCommunityInput,
} from "../../types/inputs";

@Resolver()
export class CommunityResolver {
  // Query to get a community by name
  @Query(() => CommunityResponse)
  async getCommunityByName(
    @Ctx() ctx: MyContext,
    @Arg("name") name: string
  ): Promise<CommunityResponse> {
    // Get user id from session
    const userId = ctx.req.session.userId;
    // Fetch community by name from database
    const result = await ctx.db
      .selectDistinct(communitySelection({ ctx, userId }))
      .from(communities)
      .where(eq(communities.name, name))
      .leftJoin(posts, eq(communities.id, posts.communityId))
      .leftJoin(users, eq(communities.creatorId, users.id))
      .leftJoin(
        communityMembers,
        eq(communities.id, communityMembers.communityId)
      )
      .groupBy(
        communities.id,
        posts.id,
        users.id,
        communityMembers.communityId
      );
    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "name",
            message: "No community found with that name",
          },
        ],
      };
    }
    return {
      community: {
        ...result[0],
        isJoined: result[0].isJoined > 0,
      },
      count: 1,
    };
  }
  // Query to get all communities
  @Query(() => CommunityResponse)
  async getAllCommunities(@Ctx() ctx: MyContext): Promise<CommunityResponse> {
    // Get user id from session
    const userId = ctx.req.session.userId;
    // Fetch all communities from database
    const allCommunities = await ctx.db
      .selectDistinct(communitySelection({ ctx, userId }))
      .from(communities)
      .leftJoin(posts, eq(communities.id, posts.communityId))
      .leftJoin(users, eq(communities.creatorId, users.id))
      .leftJoin(
        communityMembers,
        eq(communities.id, communityMembers.communityId)
      )
      .groupBy(communities.id, posts.id, users.id)
      .orderBy(desc(communities.createdAt));
    if (!allCommunities || allCommunities.length === 0) {
      return {
        errors: [{ field: "communities", message: "No communities found" }],
      };
    }
    return {
      communitiesArray: allCommunities.map((c) => ({
        ...c,
        isJoined: c.isJoined > 0,
      })),
      count: allCommunities.length,
    };
  }

  // Query to get the latest 4 communities where the user isn't joined for the explore page
  @Query(() => CommunityResponse)
  async getExploreCommunities(
    @Ctx() ctx: MyContext,
    @Arg("limit") limit: number
  ): Promise<CommunityResponse> {
    // Get user id from session
    const userId = ctx.req.session.userId;
    // Fetch all communities from database
    const result = await ctx.db
      .selectDistinct(communitySelection({ ctx, userId }))
      .from(communities)
      .where(
        and(
          eq(communities.id, communityMembers.communityId),
          notExists(
            ctx.db
              .select()
              .from(communityMembers)
              .where(
                and(
                  eq(communityMembers.communityId, communities.id),
                  eq(communityMembers.userId, userId ?? 0)
                )
              )
          )
        )
      )
      .leftJoin(posts, eq(communities.id, posts.communityId))
      .leftJoin(users, eq(communities.creatorId, users.id))
      .leftJoin(
        communityMembers,
        eq(communities.id, communityMembers.communityId)
      )
      .groupBy(communities.id, posts.id, users.id)
      .orderBy(desc(communities.updatedAt))
      .limit(limit);

    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "communities",
            message: "No communities found",
          },
        ],
      };
    }
    return {
      communitiesArray: result.map((c) => ({
        ...c,
        isJoined: c.isJoined > 0,
      })),
      count: result.length,
    };
  }

  // Query to search for communities using a search term
  @Query(() => CommunityResponse)
  async searchCommunities(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetSearchResultInput
  ): Promise<CommunityResponse> {
    // Destructure input
    const { searchTerm, page, limit } = options;
    if (searchTerm.length === 0) {
      return {
        errors: [
          {
            field: "searchTerm",
            message: "Search term cannot be empty",
          },
        ],
      };
    }
    // Get user id from session
    const userId = ctx.req.session.userId;
    // Fetch all communities from database
    const result = await ctx.db
      .selectDistinct(searchCommunitySelection({ ctx, userId, searchTerm }))
      .from(communities)
      .where(ilike(communities.name, "%" + searchTerm + "%"))
      .leftJoin(posts, eq(communities.id, posts.communityId))
      .leftJoin(users, eq(communities.creatorId, users.id))
      .leftJoin(
        communityMembers,
        eq(communities.id, communityMembers.communityId)
      )
      .groupBy(communities.id, posts.id, users.id)
      .orderBy(communities.name)
      .limit(limit)
      .offset((page - 1) * limit);

    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "communities",
            message: "No communities found",
          },
        ],
      };
    }
    return {
      communitiesArray: result.map((c) => ({
        ...c,
        isJoined: c.isJoined > 0,
      })),
      count: result[0].totalCount,
    };
  }

  //   Query to get all the user's communities
  @Query(() => CommunityResponse)
  async getUserCommunities(@Ctx() ctx: MyContext): Promise<CommunityResponse> {
    // Get user id from session
    const userId = ctx.req.session.userId;
    if (!userId) {
      return {
        errors: [
          {
            field: "userId",
            message: "You must be logged in to get your communities",
          },
        ],
      };
    }
    // Fetch all communities from database
    const result = await ctx.db
      .selectDistinct(communitySelection({ ctx, userId }))
      .from(communities)
      .where(
        and(
          eq(communities.id, communityMembers.communityId),
          eq(communityMembers.userId, userId)
        )
      )
      .leftJoin(posts, eq(communities.id, posts.communityId))
      .leftJoin(users, eq(communities.creatorId, users.id))
      .leftJoin(
        communityMembers,
        eq(communities.id, communityMembers.communityId)
      )
      .groupBy(communities.id, posts.id, users.id, communityMembers.communityId)
      .orderBy(desc(communities.createdAt));

    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "communities",
            message: "No communities found",
          },
        ],
      };
    }
    return {
      communitiesArray: result.map((c) => ({
        ...c,
        isJoined: c.isJoined > 0,
      })),
      count: result.length,
    };
  }

  //   Mutation to create a new community
  @Mutation(() => CommunityResponse)
  async createCommunity(
    @Ctx() ctx: MyContext,
    @Arg("options") options: CreateCommunityInput
  ): Promise<CommunityResponse> {
    // Destructure input
    const { name, description, image } = options;
    // Get author id from session
    const creatorId = ctx.req.session.userId;
    // Check if user is logged in
    if (!creatorId) {
      return {
        errors: [
          {
            field: "creatorId",
            message: "You must be logged in to create a community",
          },
        ],
      };
    }
    // Create new community and insert it in database
    try {
      const newCommunity = await ctx.db
        .insert(communities)
        .values({ name, description, image, creatorId })
        .returning();
      // handle creation error
      if (!newCommunity || newCommunity.length === 0) {
        return {
          errors: [
            {
              field: "root",
              message: "Error creating community",
            },
          ],
        };
      }
      const createMemberResult = await ctx.db
        .insert(communityMembers)
        .values({ communityId: newCommunity[0].id, userId: creatorId });
      // handle creation error
      if (createMemberResult.rowCount === 0) {
        return {
          errors: [
            {
              field: "root",
              message:
                "Error joining the created community. Please make sure the community was created correctly.",
            },
          ],
        };
      }
      // Return the created community
      return {
        community: newCommunity[0],
        count: 1,
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

  //   Mutation to update a community
  @Mutation(() => ConfirmResponse)
  async updateCommunity(
    @Ctx() ctx: MyContext,
    @Arg("options") options: UpdateCommunityInput
  ): Promise<ConfirmResponse> {
    // Destructure input
    const { id, name, description, image } = options;
    // Check if title or content is provided
    if (!name && !description) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You must provide a name or description to update",
          },
        ],
      };
    }
    // Get author id from session
    const creatorId = ctx.req.session.userId;
    // Check if user is logged in
    if (!creatorId) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You must be logged in to update a community",
          },
        ],
      };
    }
    try {
      // Update community
      const updatedCommunity = await ctx.db
        .update(communities)
        .set({
          name: name === undefined ? communities.name : name,
          description:
            description === undefined ? communities.description : description,
          image: image === undefined ? communities.image : image,
        })
        .where(
          and(eq(communities.id, id), eq(communities.creatorId, creatorId))
        );

      if (!updatedCommunity || updatedCommunity.rowCount === 0) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message: "An error happened while updating the community",
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

  //   Mutation to delete a community
  @Mutation(() => ConfirmResponse)
  async deleteCommunity(
    @Ctx() ctx: MyContext,
    @Arg("id") id: number
  ): Promise<ConfirmResponse> {
    const creatorId = ctx.req.session.userId;
    if (!creatorId) {
      return {
        success: false,
        errors: [
          {
            field: "creatorId",
            message: "You must be logged in to delete a community",
          },
        ],
      };
    }
    const result = await ctx.db
      .delete(communities)
      .where(and(eq(communities.id, id), eq(communities.creatorId, creatorId)));
    if (result.rowCount === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message:
              "No communities deleted. Please make sure a community with this id exists and you have permission to delete it.",
          },
        ],
      };
    }
    return {
      success: true,
    };
  }
}
