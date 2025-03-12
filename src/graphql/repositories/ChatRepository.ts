import { and, count, eq, SQL } from "drizzle-orm";
import { db } from "../../database/db";
import { chatParticipants, chats } from "../../database/schema";
import { chatCreator, chatSelection } from "../../lib/utils";

export class ChatRepository {
  static async getAllChatsWithFilters({ filters }: { filters: SQL[] }) {
    const whereCondition = filters.length > 1 ? and(...filters) : filters[0];
    return await db
      .select(chatSelection())
      .from(chats)
      .where(whereCondition)
      .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
      .innerJoin(chatCreator, eq(chats.creatorId, chatCreator.id))
      .groupBy(
        chats.id,
        chatParticipants.chatId,
        chatParticipants.lastReadMessageId,
        chatCreator.id
      );
  }

  static async getChatIdsFromParticipant({ userId }: { userId: number }) {
    return await db
      .select({ chatId: chatParticipants.chatId })
      .from(chatParticipants)
      .where(eq(chatParticipants.userId, userId));
  }

  static async countAllChatsWithFilters({ filters }: { filters: SQL[] }) {
    return await db
      .select({ count: count() })
      .from(chats)
      .where(and(...filters));
  }
  static async createChat({
    creatorId,
    isGroupChat,
    name,
    image,
  }: {
    creatorId: number;
    isGroupChat: boolean;
    name: string;
    image?: string;
  }) {
    return await db
      .insert(chats)
      .values({ creatorId, name, image, isGroupChat })
      .returning({ id: chats.id });
  }
  static async addChatParticipant({
    userId,
    chatId,
  }: {
    userId: number;
    chatId: number;
  }) {
    return await db.insert(chatParticipants).values({ userId, chatId });
  }

  static async removeChatParticipant({
    userId,
    chatId,
  }: {
    userId: number;
    chatId: number;
  }) {
    return await db
      .delete(chatParticipants)
      .where(
        and(
          eq(chatParticipants.userId, userId),
          eq(chatParticipants.chatId, chatId)
        )
      );
  }

  static async getChatById({ chatId }: { chatId: number }) {
    return await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      with: {
        creator: true,
      },
    });
  }
  static async getChatParticipants({ chatId }: { chatId: number }) {
    return await db
      .select()
      .from(chatParticipants)
      .where(eq(chatParticipants.chatId, chatId));
  }

  static async checkChatParticipant({
    userId,
    chatId,
  }: {
    userId: number;
    chatId: number;
  }) {
    return await db
      .select()
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.chatId, chatId),
          eq(chatParticipants.userId, userId)
        )
      );
  }

  static async updateChat({
    creatorId,
    chatId,
    name,
    image,
  }: {
    creatorId: number;
    chatId: number;
    name?: string;
    image?: string;
  }) {
    return await db
      .update(chats)
      .set({
        name: name ? name : chats.name,
        image: image ? image : chats.image,
      })
      .where(and(eq(chats.id, chatId), eq(chats.creatorId, creatorId)))
      .returning();
  }
  static async deleteChat({
    chatId,
    creatorId,
  }: {
    chatId: number;
    creatorId: number;
  }) {
    return await db
      .delete(chats)
      .where(and(eq(chats.id, chatId), eq(chats.creatorId, creatorId)));
  }
}
