import { and, count, eq, SQL } from "drizzle-orm";
import { db } from "../database/db";
import {
  comments,
  communities,
  communityMembers,
  hiddenPosts,
  posts,
  users,
  votes,
} from "../database/schema";
import { postSelection, postsSorter } from "../lib/utils";
import { SortOptions } from "../types/resolvers";
import { PgSelect } from "drizzle-orm/pg-core";

export class PostRepository {
  // Helper method to build base query with common joins
  private static buildBaseQuery({ userId }: { userId?: number }) {
    return db
      .select(postSelection({ userId }))
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(votes, eq(posts.id, votes.postId))
      .leftJoin(communities, eq(posts.communityId, communities.id))
      .leftJoin(comments, eq(posts.id, comments.postId))
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
      .groupBy(posts.id, users.id, communities.id, communityMembers.communityId)
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(postsSorter(sortBy));
  }

  static async withPostJoins<T extends PgSelect>({ qb }: { qb: T }) {
    return await qb
      .leftJoin(users, eq(posts.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
      .leftJoin(communities, eq(posts.communityId, communities.id)) // Join communities to get community details
      .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
      .leftJoin(
        communityMembers,
        eq(posts.communityId, communityMembers.communityId)
      ) // Join community members to get community member count
      .groupBy(
        posts.id,
        users.id,
        communities.id,
        communityMembers.communityId
      );
  }

  static async getAllPostsWithFilters({
    sortBy,
    userId,
    limit,
    page,
    filters,
    communityOnly,
    hiddenOnly,
  }: {
    sortBy?: SortOptions;
    userId?: number;
    limit: number;
    page: number;
    filters: SQL[];
    communityOnly?: boolean;
    hiddenOnly?: boolean;
  }) {
    // Start with a base query with common joins
    let qb = this.buildBaseQuery({ userId });
    if (hiddenOnly && userId) {
      // When fetching hidden posts, join hiddenPosts first
      qb = qb.leftJoin(hiddenPosts, eq(posts.id, hiddenPosts.postId));
    }
    if (communityOnly && userId) {
      // When fetching community posts, join communityMembers first
      qb = qb.leftJoin(
        communityMembers,
        and(
          eq(posts.communityId, communityMembers.communityId),
          eq(communityMembers.userId, userId)
        )
      );
    } else {
      qb = qb.leftJoin(
        communityMembers,
        and(eq(posts.communityId, communityMembers.communityId))
      );
    }

    // Now apply the filters after all necessary joins are in place
    qb = qb.where(and(...filters));

    // Apply pagination and sorting
    return await this.withPagination({
      qb,
      limit,
      page,
      sortBy: sortBy ?? "Best",
    });
  }
  static async countAllPostsWithFilters({
    filters,
    communityOnly,
    hiddenOnly,
    votesOnly,
  }: {
    filters: SQL[];
    communityOnly?: boolean;
    hiddenOnly?: boolean;
    votesOnly?: boolean;
  }) {
    if (communityOnly) {
      return await db
        .select({ count: count() })
        .from(posts)
        .leftJoin(
          communityMembers,
          eq(posts.communityId, communityMembers.communityId)
        )
        .where(and(...filters));
    } else if (hiddenOnly) {
      return await db
        .select({ count: count() })
        .from(posts)
        .leftJoin(hiddenPosts, eq(posts.id, hiddenPosts.postId))
        .where(and(...filters));
    } else if (votesOnly) {
      return await db
        .select({ count: count() })
        .from(posts)
        .leftJoin(votes, eq(posts.id, votes.postId))
        .where(and(...filters));
    } else {
      return await db
        .select({ count: count() })
        .from(posts)
        .where(and(...filters));
    }
  }
  static async getSinglePost({
    userId,
    postId,
    filters,
  }: {
    userId?: number;
    postId: number;
    filters: SQL[];
  }) {
    const qb = db
      .select(postSelection({ userId }))
      .from(posts)
      .where(and(eq(posts.id, postId), and(...filters)))
      .$dynamic();
    return await this.withPostJoins({ qb });
  }

  static async insertPost({
    title,
    content,
    authorId,
    communityId,
    media,
  }: {
    title: string;
    content: string;
    authorId: number;
    communityId: number;
    media?: string[];
  }) {
    return await db
      .insert(posts)
      .values({ title, content, authorId, communityId, media })
      .returning();
  }

  static async updatePost({
    title,
    content,
    postId,
    authorId,
  }: {
    title: string;
    content: string;
    postId: number;
    authorId: number;
  }) {
    return await db
      .update(posts)
      .set({
        title,
        content,
      })
      .where(and(eq(posts.id, postId), eq(posts.authorId, authorId)))
      .returning();
  }
  static async deletePost({
    postId,
    authorId,
  }: {
    postId: number;
    authorId: number;
  }) {
    return await db
      .delete(posts)
      .where(and(eq(posts.id, postId), eq(posts.authorId, authorId)));
  }
}
