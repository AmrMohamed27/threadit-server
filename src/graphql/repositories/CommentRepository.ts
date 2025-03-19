import { and, count, eq, SQL } from "drizzle-orm";
import { PgSelect } from "drizzle-orm/pg-core";
import { db } from "../../database/db";
import { comments, users, votes } from "../../database/schema";
import { commentSelection, commentsSorter } from "../../lib/utils";
import { SortOptions } from "../../types/resolvers";

export class CommentRepository {
  // Helper method to build base query with common joins
  private static buildBaseQuery({ userId }: { userId?: number }) {
    return db
      .select(commentSelection({ userId }))
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(comments.id, votes.commentId)) // Join votes to get upvote count
      .groupBy(comments.id, users.id) // Group by to avoid duplicates
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
      .orderBy(commentsSorter(sortBy));
  }

  static async getAllCommentsWithFilters({
    sortBy,
    userId,
    limit,
    page,
    filters,
    isSingle,
  }: {
    sortBy?: SortOptions;
    userId?: number;
    limit: number;
    page: number;
    filters: SQL[];
    isSingle?: boolean;
  }) {
    // Start with a base query with common joins
    let qb = this.buildBaseQuery({ userId });
    // Now apply the filters after all necessary joins are in place
    qb = qb.where(and(...filters));
    // If isSingle is true, return the result directly as there is no need for pagination
    if (isSingle) {
      return await qb.execute();
    }
    // Apply pagination and sorting
    return await this.withPagination({
      qb,
      limit,
      page,
      sortBy: sortBy ?? "Best",
    });
  }
  static async countAllCommentsWithFilters({ filters }: { filters: SQL[] }) {
    return await db
      .select({ count: count() })
      .from(comments)
      .where(and(...filters));
  }
  static async withCommentJoins<T extends PgSelect>({ qb }: { qb: T }) {
    return await qb
      .leftJoin(users, eq(comments.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(comments.id, votes.commentId)) // Join votes to get upvote count
      .groupBy(comments.id, users.id); // Group by to avoid duplicates
  }
  static async getSingleComment({
    userId,
    commentId,
    filters,
  }: {
    userId?: number;
    commentId: number;
    filters: SQL[];
  }) {
    const qb = db
      .select(commentSelection({ userId }))
      .from(comments)
      .where(and(eq(comments.id, commentId), and(...filters)))
      .$dynamic();
    return await this.withCommentJoins({ qb });
  }

  static async insertComment({
    content,
    authorId,
    postId,
    parentCommentId,
  }: {
    content: string;
    authorId: number;
    postId: number;
    parentCommentId?: number;
  }) {
    return await db
      .insert(comments)
      .values({ content, authorId, postId, parentCommentId })
      .returning();
  }

  static async updateComment({
    content,
    commentId,
    authorId,
  }: {
    content: string;
    commentId: number;
    authorId: number;
  }) {
    return await db
      .update(comments)
      .set({
        content,
      })
      .where(and(eq(comments.id, commentId), eq(comments.authorId, authorId)))
      .returning();
  }
  static async deleteComment({
    commentId,
    authorId,
  }: {
    commentId: number;
    authorId: number;
  }) {
    return await db
      .delete(comments)
      .where(and(eq(comments.id, commentId), eq(comments.authorId, authorId)));
  }
}
