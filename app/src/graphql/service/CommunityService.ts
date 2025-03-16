import { SortOptions } from "../../types/resolvers";
import { CommunityRepository } from "../repositories/CommunityRepository";
import { and, eq, ilike, notExists, SQL } from "drizzle-orm";
import { mapCommunitiesResult } from "../../lib/utils";
import { communities, communityMembers } from "../../database/schema";
import { CommunityResponse } from "../../types/inputs";
import { db } from "../../database/db";
import { CommunityMembersRepository } from "../repositories/CommunityMembersRepository";

export class CommunityService {
  constructor(private repository: typeof CommunityRepository) {}

  private async communityArrayFetcher({
    sortBy,
    userId,
    limit,
    page,
    filters,
    isExplore,
  }: {
    sortBy?: SortOptions;
    userId?: number;
    limit?: number;
    page?: number;
    filters: SQL[];
    isExplore?: boolean;
  }): Promise<CommunityResponse> {
    const result = await this.repository.getAllCommunitiesWithFilters({
      sortBy,
      userId,
      limit,
      page,
      filters,
    });
    if (!result || result.length === 0) {
      return {
        errors: [{ field: "community", message: "No communities found" }],
      };
    }
    const resultCount = await this.repository.countAllCommunitiesWithFilters({
      filters,
      isExplore,
    });
    return {
      communitiesArray: mapCommunitiesResult(result),
      count: resultCount[0].count,
    };
  }

  private async communityFetcher({
    userId,
    filters,
  }: {
    userId?: number;
    filters: SQL[];
  }): Promise<CommunityResponse> {
    const result = await this.repository.getAllCommunitiesWithFilters({
      userId,
      filters,
    });
    if (!result || result.length === 0) {
      return {
        errors: [{ field: "community", message: "No communities found" }],
      };
    }

    return {
      community: mapCommunitiesResult(result)[0],
      count: 1,
    };
  }

  async fetchCommunityByName({
    userId,
    name,
  }: {
    userId?: number;
    name: string;
  }) {
    const filters = [eq(communities.name, name)];
    return await this.communityFetcher({
      userId,
      filters,
    });
  }

  async fetchAllCommunities({
    userId,
    sortBy,
  }: {
    userId?: number;
    sortBy?: SortOptions;
  }) {
    return await this.communityArrayFetcher({
      userId,
      filters: [],
      sortBy,
    });
  }

  async fetchExploreCommunities({
    userId,
    sortBy,
    limit,
  }: {
    userId?: number;
    sortBy?: SortOptions;
    limit: number;
  }) {
    const filters = [
      and(
        eq(communities.id, communityMembers.communityId),
        notExists(
          db
            .select()
            .from(communityMembers)
            .where(
              and(
                eq(communityMembers.communityId, communities.id),
                eq(communityMembers.userId, userId ?? 0)
              )
            )
        )
      )!,
    ];
    return await this.communityArrayFetcher({
      userId,
      filters,
      limit,
      page: 1,
      sortBy,
      isExplore: true,
    });
  }

  async searchCommunities({
    searchTerm,
    page,
    limit,
    userId,
    sortBy,
  }: {
    searchTerm: string;
    page: number;
    limit: number;
    userId?: number;
    sortBy?: SortOptions;
  }) {
    // Check if search term is empty
    if (searchTerm.trim().length === 0) {
      return {
        errors: [
          {
            field: "searchTerm",
            message: "Search term cannot be empty",
          },
        ],
      };
    }
    const filters = [ilike(communities.name, "%" + searchTerm + "%")];
    return await this.communityArrayFetcher({
      userId,
      filters,
      limit,
      page,
      sortBy,
    });
  }

  async fetchUserCommunities({
    userId,
    sortBy,
  }: {
    userId?: number;
    sortBy?: SortOptions;
  }) {
    // Check if user is logged in
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
    const filters = [
      and(
        eq(communities.id, communityMembers.communityId),
        eq(communityMembers.userId, userId)
      )!,
    ];
    return await this.communityArrayFetcher({
      userId,
      filters,
      sortBy,
      isExplore: true,
    });
  }

  async createCommunity({
    name,
    description,
    image,
    isPrivate,
    creatorId,
  }: {
    name: string;
    description: string;
    image?: string;
    isPrivate: boolean;
    creatorId?: number;
  }) {
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
      const result = await this.repository.createCommunity({
        name,
        description,
        image,
        isPrivate,
        creatorId,
      });
      // handle creation error
      if (!result || result.length === 0) {
        return {
          errors: [
            {
              field: "root",
              message: "Error creating community",
            },
          ],
        };
      }
      const createMemberResult = await CommunityMembersRepository.joinCommunity(
        result[0].id,
        creatorId
      );
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
        community: result[0],
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

  async updateCommunity({
    communityId,
    name,
    description,
    image,
    creatorId,
  }: {
    communityId: number;
    name?: string;
    description?: string;
    image?: string;
    creatorId?: number;
  }) {
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
    // Check if name or description is provided
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
    try {
      // Update community
      const updatedCommunity = await this.repository.updateCommunity({
        id: communityId,
        name,
        description,
        image,
        creatorId,
      });

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

  async deleteCommunity({
    communityId,
    creatorId,
  }: {
    communityId: number;
    creatorId?: number;
  }) {
    // Check if user is logged in
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
    const result = await this.repository.deleteCommunity({
      communityId,
      creatorId,
    });
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
