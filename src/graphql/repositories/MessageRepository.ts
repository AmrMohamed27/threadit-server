import { and, asc, count, eq, SQL } from "drizzle-orm";
import { db } from "../../database/db";
import { messages } from "../../database/schema";
import { messageSelection, receiver, sender } from "../../lib/utils";

export class MessageRepository {
  // Helper method to build base query with common joins
  private static buildBaseQuery() {
    return db
      .select(messageSelection())
      .from(messages)
      .innerJoin(sender, eq(messages.senderId, sender.id)) // Join users table to get sender details
      .innerJoin(receiver, eq(messages.receiverId, receiver.id)) // Join users table to get receiver details
      .groupBy(messages.id, sender.id, receiver.id) // Group by to avoid duplicates
      .orderBy(asc(messages.createdAt))
      .$dynamic();
  }

  static async getAllMessagesWithFilters({ filters }: { filters: SQL[] }) {
    // Start with a base query with common joins
    let qb = this.buildBaseQuery();
    // Apply pagination and sorting
    return await qb.where(and(...filters));
  }
  static async countAllMessagesWithFilters({ filters }: { filters: SQL[] }) {
    return await db
      .select({ count: count() })
      .from(messages)
      .where(and(...filters));
  }
  static async insertMessage({
    senderId,
    receiverId,
    content,
    media,
  }: {
    senderId: number;
    receiverId: number;
    content: string;
    media?: string;
  }) {
    return await db
      .insert(messages)
      .values({ senderId, receiverId, content, media })
      .returning({ id: messages.id });
  }
  static async updateMessage({
    content,
    messageId,
    senderId,
  }: {
    content: string;
    messageId: number;
    senderId: number;
  }) {
    return await db
      .update(messages)
      .set({
        content,
      })
      .where(and(eq(messages.id, messageId), eq(messages.senderId, senderId)));
  }
  static async deleteMessage({
    messageId,
    senderId,
  }: {
    messageId: number;
    senderId: number;
  }) {
    return await db
      .delete(messages)
      .where(and(eq(messages.id, messageId), eq(messages.senderId, senderId)));
  }
}
