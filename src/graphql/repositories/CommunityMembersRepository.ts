import { and, eq } from "drizzle-orm";
import { db } from "../../database/db";
import { communityMembers } from "../../database/schema";

export class CommunityMembersRepository {
  // Join Community
  static async joinCommunity(communityId: number, userId: number) {
    return await db
      .insert(communityMembers)
      .values({
        communityId,
        userId,
      })
      .returning();
  }

  // Leave Community
  static async leaveCommunity(communityId: number, userId: number) {
    return await db
      .delete(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, userId)
        )
      );
  }
}
