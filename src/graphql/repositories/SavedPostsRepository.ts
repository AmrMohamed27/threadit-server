import { and, eq } from "drizzle-orm";
import { db } from "../../database/db";
import { savedPosts } from "../../database/schema";

export class SavedPostsRepository {
  static async savePost({
    postId,
    userId,
  }: {
    postId: number;
    userId: number;
  }) {
    return await db.insert(savedPosts).values({ postId, userId });
  }

  static async unsavePost({
    postId,
    userId,
  }: {
    postId: number;
    userId: number;
  }) {
    return await db
      .delete(savedPosts)
      .where(and(eq(savedPosts.postId, postId), eq(savedPosts.userId, userId)));
  }

  static async getSavedPostIds({ userId }: { userId: number }) {
    return await db
      .select({ postId: savedPosts.postId })
      .from(savedPosts)
      .where(eq(savedPosts.userId, userId));
  }
}
