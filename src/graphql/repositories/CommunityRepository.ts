import { and, asc, count, desc, eq, SQL } from "drizzle-orm";
import { PgSelect } from "drizzle-orm/pg-core";
import { db } from "../../database/db";
import {
  communities,
  communityMembers,
  posts,
  users,
} from "../../database/schema";
import { communitySelection } from "../../lib/utils";
import { SortOptions } from "../../types/resolvers";

export class CommunityRepository {
  // Helper method to build base query with common joins
  private static buildBaseQuery({ userId }: { userId?: number }) {
    return db
      .selectDistinct(communitySelection({ userId }))
      .from(communities)
      .leftJoin(posts, eq(communities.id, posts.communityId))
      .leftJoin(users, eq(communities.creatorId, users.id))
      .leftJoin(
        communityMembers,
        eq(communities.id, communityMembers.communityId)
      )
      .groupBy(communities.id, posts.id, users.id, communityMembers.communityId)
      .$dynamic();
  }
  static async withPagination<T extends PgSelect>({
    qb,
    page,
    limit,
    sortBy,
  }: {
    qb: T;
    page: number;
    limit: number;
    sortBy: SortOptions;
  }) {
    return await qb
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(
        sortBy === "New"
          ? desc(communities.createdAt)
          : sortBy === "Old"
          ? asc(communities.createdAt)
          : communities.name
      );
  }

  static async getAllCommunitiesWithFilters({
    sortBy,
    userId,
    limit,
    page,
    filters,
  }: {
    sortBy?: SortOptions;
    userId?: number;
    limit?: number;
    page?: number;
    filters: SQL[];
  }) {
    // Start with a base query with common joins
    let qb = this.buildBaseQuery({ userId });

    // Now apply the filters after all necessary joins are in place
    qb = qb.where(and(...filters));

    if (limit && page) {
      // Apply pagination and sorting
      return await this.withPagination({
        qb,
        limit,
        page,
        sortBy: sortBy ?? "Top",
      });
    }
    return await qb;
  }
  static async countAllCommunitiesWithFilters({
    filters,
    isExplore = false,
  }: {
    filters: SQL[];
    isExplore?: boolean;
  }) {
    if (isExplore) {
      return await db
        .select({ count: count() })
        .from(communities)
        .leftJoin(
          communityMembers,
          eq(communities.id, communityMembers.communityId)
        )
        .where(and(...filters));
    } else {
      return await db
        .select({ count: count() })
        .from(communities)
        .where(and(...filters));
    }
  }

  static async createCommunity({
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
    creatorId: number;
  }) {
    return await db
      .insert(communities)
      .values({ name, description, image, creatorId, isPrivate })
      .returning();
  }

  static async updateCommunity({
    id,
    name,
    description,
    image,
    creatorId,
  }: {
    id: number;
    name?: string;
    description?: string;
    image?: string;
    creatorId: number;
  }) {
    return await db
      .update(communities)
      .set({
        name: name === undefined ? communities.name : name,
        description:
          description === undefined ? communities.description : description,
        image: image === undefined ? communities.image : image,
      })
      .where(and(eq(communities.id, id), eq(communities.creatorId, creatorId)));
  }

  static async deleteCommunity({
    communityId,
    creatorId,
  }: {
    communityId: number;
    creatorId: number;
  }) {
    return await db
      .delete(communities)
      .where(
        and(
          eq(communities.id, communityId),
          eq(communities.creatorId, creatorId)
        )
      );
  }
}
