import { db } from "../database/db";
import { CommunityMembersRepository } from "../repositories/CommunityMembersRepository";
import { communities } from "../database/schema";
import { and, eq } from "drizzle-orm";

export class CommunityMembersService {
  constructor(private repository: typeof CommunityMembersRepository) {}

  async joinCommunity(communityId: number, userId?: number) {
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
      const result = await this.repository.joinCommunity(communityId, userId);
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

  async leaveCommunity(communityId: number, userId?: number) {
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
    const result = await db
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
      const result = await this.repository.leaveCommunity(communityId, userId);
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
