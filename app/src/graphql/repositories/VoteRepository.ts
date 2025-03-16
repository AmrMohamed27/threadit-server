import { and, eq, or } from "drizzle-orm";
import { db } from "../../database/db";
import { votes } from "../../database/schema";

export class VoteRepository {
  static async getIfUserVotedOnPost({
    postId,
    authorId,
  }: {
    postId: number;
    authorId: number;
  }) {
    return await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, authorId), eq(votes.postId, postId)));
  }
  static async getIfUserVotedOnComment({
    commentId,
    authorId,
  }: {
    commentId: number;
    authorId: number;
  }) {
    return await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, authorId), eq(votes.commentId, commentId)));
  }
  static async getVoteById({ voteId }: { voteId: number }) {
    return await db.select().from(votes).where(eq(votes.id, voteId));
  }
  static async deleteVote({
    postId,
    commentId,
    authorId,
  }: {
    authorId: number;
    postId?: number;
    commentId?: number;
  }) {
    return await db
      .delete(votes)
      .where(
        and(
          eq(votes.userId, authorId),
          or(eq(votes.postId, postId ?? 0), eq(votes.commentId, commentId ?? 0))
        )
      );
  }
  static async updateVote({
    postId,
    commentId,
    isUpvote,
    userId,
  }: {
    postId?: number;
    commentId?: number;
    isUpvote: boolean;
    userId: number;
  }) {
    return await db
      .update(votes)
      .set({
        isUpvote,
      })
      .where(
        and(
          eq(votes.userId, userId),
          or(eq(votes.postId, postId ?? 0), eq(votes.commentId, commentId ?? 0))
        )
      );
  }
  static async createVote({
    isUpvote,
    postId,
    commentId,
    authorId,
  }: {
    isUpvote: boolean;
    postId?: number;
    commentId?: number;
    authorId: number;
  }) {
    return await db
      .insert(votes)
      .values({
        userId: authorId,
        postId,
        commentId,
        isUpvote,
      })
      .returning();
  }
}
