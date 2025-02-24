import { and, desc, eq, or } from "drizzle-orm";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import {
  communities,
  communityMembers,
  posts,
  ReturnedCommunity,
  ReturnedUserWithoutPassword,
  users,
} from "../../database/schema";
import { ConfirmResponse, FieldError, MyContext } from "../types";
import { Community } from "../types/Community";

export type extendedCommunity = ReturnedCommunity & {
  postsCount?: number;
  membersCount?: number;
  creator?: ReturnedUserWithoutPassword | null;
};

// Community Response type
@ObjectType()
export class CommunityResponse {
  @Field(() => Community, { nullable: true })
  community?: extendedCommunity;
  @Field(() => [Community], { nullable: true })
  communitiesArray?: extendedCommunity[];
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => Int, { nullable: true })
  count?: number;
}
// Selection object for community
export const communitySelection = ({ ctx }: { ctx: MyContext }) => ({
  id: communities.id,
  name: communities.name,
  description: communities.description,
  image: communities.image,
  createdAt: communities.createdAt,
  updatedAt: communities.updatedAt,
  creatorId: communities.creatorId,
  // Additional Fields
  postsCount: ctx.db.$count(posts, eq(posts.communityId, communities.id)),
  membersCount: ctx.db.$count(
    communityMembers,
    eq(communityMembers.communityId, communities.id)
  ),
  creator: {
    id: users.id,
    name: users.name,
    image: users.image,
    email: users.email,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    confirmed: users.confirmed,
  },
});
// Input type for creating a community
@InputType()
export class CreateCommunityInput {
  @Field()
  name: string;
  @Field()
  description: string;
  @Field({ nullable: true })
  image?: string;
}
// Input type for updating a community
@InputType()
export class UpdateCommunityInput {
  @Field()
  id: number;
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  description?: string;
  @Field({ nullable: true })
  image?: string;
}

@Resolver()
export class CommunityResolver {
  // Query to get all communities
  @Query(() => CommunityResponse)
  async getAllCommunities(@Ctx() ctx: MyContext): Promise<CommunityResponse> {
    // Fetch all communities from database
    const allCommunities = await ctx.db
      .select(communitySelection({ ctx }))
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
      communitiesArray: allCommunities,
      count: allCommunities.length,
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
      .select(communitySelection({ ctx }))
      .from(communities)
      .where(
        or(
          eq(communities.creatorId, userId),
          and(
            eq(communities.id, communityMembers.communityId),
            eq(communityMembers.userId, userId)
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
      communitiesArray: result,
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
