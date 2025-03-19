import { and, eq } from "drizzle-orm";
import { db } from "../../database/db";
import { hiddenPosts } from "../../database/schema";

export class HiddenPostsRepository {
  static async hidePost({
    postId,
    userId,
  }: {
    postId: number;
    userId: number;
  }) {
    return await db.insert(hiddenPosts).values({ postId, userId }).returning();
  }

  static async unhidePost({
    postId,
    userId,
  }: {
    postId: number;
    userId: number;
  }) {
    return await db
      .delete(hiddenPosts)
      .where(
        and(eq(hiddenPosts.postId, postId), eq(hiddenPosts.userId, userId))
      );
  }

  static async getHiddenPostsIds({ userId }: { userId: number }) {
    return await db
      .select({ postId: hiddenPosts.postId })
      .from(hiddenPosts)
      .where(eq(hiddenPosts.userId, userId));
  }
}
