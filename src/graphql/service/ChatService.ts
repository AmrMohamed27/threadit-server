import { and, eq, or, SQL } from "drizzle-orm";
import { chatParticipants, chats } from "../../database/schema";
import { ChatResponse, UserResponse } from "../../types/inputs";
import {
  ChatConfirmResponse,
  ChatOperation,
  ConfirmResponse,
} from "../../types/resolvers";
import { ChatRepository } from "../repositories/ChatRepository";
import { UserRepository } from "../repositories/UserRepository";

export class ChatService {
  constructor(
    private repository: typeof ChatRepository,
    private userRepository: typeof UserRepository
  ) {}

  async chatsFetcher({ filters }: { filters: SQL[] }): Promise<ChatResponse> {
    const result = await this.repository.getAllChatsWithFilters({
      filters,
    });
    if (!result || result.length === 0) {
      return {
        errors: [{ field: "chats", message: "no chats found" }],
      };
    }
    const resultCount = await this.repository.countAllChatsWithFilters({
      filters,
    });
    return {
      chatsArray: result,
      count: resultCount[0].count,
    };
  }

  private async singleChatFetcher({
    filters,
  }: {
    filters: SQL[];
  }): Promise<ChatResponse> {
    const result = await this.repository.getAllChatsWithFilters({
      filters,
    });
    if (!result || result.length === 0) {
      return {
        errors: [{ field: "chats", message: "no chats found" }],
      };
    }
    return {
      chat: result[0],
    };
  }

  async fetchUserChats({ userId }: { userId?: number }): Promise<ChatResponse> {
    // Check if user is logged in
    if (!userId) {
      return {
        errors: [
          {
            field: "root",
            message: "You must be logged in to get user chats",
          },
        ],
      };
    }
    // Get user chats
    try {
      const chatIds = await this.repository.getChatIdsFromParticipant({
        userId,
      });
      if (chatIds.length === 0) {
        return {
          chatsArray: [],
          count: 0,
          errors: [
            {
              field: "root",
              message: "No chats found for user.",
            },
          ],
        };
      }
      const filters: SQL[] = [];
      chatIds.forEach(({ chatId }) => filters.push(eq(chats.id, chatId)));
      const orFilter: SQL[] = [or(...filters)!];
      return await this.chatsFetcher({ filters: orFilter });
    } catch (error) {
      console.error(error);
      return {
        errors: [
          {
            field: "root",
            message:
              error.message ?? "An Error occurred during getting user chats",
          },
        ],
      };
    }
  }

  async fetchChatById({ chatId }: { chatId: number }): Promise<ChatResponse> {
    try {
      const filters = [eq(chats.id, chatId)];
      return await this.singleChatFetcher({ filters });
    } catch (error) {
      console.error(error);
      return {
        errors: [
          {
            field: "root",
            message:
              error.message ?? "An Error occurred during getting chat by id",
          },
        ],
      };
    }
  }

  async fetchChatParticipants({
    chatId,
  }: {
    chatId: number;
  }): Promise<UserResponse> {
    try {
      const result = await this.repository.getChatParticipants({ chatId });
      const users = await Promise.all(
        result.map(async ({ userId }) => {
          const result = await this.userRepository.getUserById({ userId });
          return result[0];
        })
      );
      if (users.length === 0) {
        return {
          errors: [
            {
              field: "root",
              message: "No users found for specified chat",
            },
          ],
        };
      }
      return {
        userArray: users,
        count: users.length,
      };
    } catch (error) {
      console.error(error);
      return {
        errors: [
          {
            field: "root",
            message:
              error.message ??
              "An Error occurred during getting chat participants",
          },
        ],
      };
    }
  }

  async createGroupChat({
    creatorId,
    name,
    image,
    participantIds,
  }: {
    creatorId?: number;
    name: string;
    image?: string;
    participantIds: number[];
  }): Promise<ChatResponse> {
    // Check if user is logged in
    if (!creatorId) {
      return {
        errors: [
          {
            field: "root",
            message: "You must be logged in to create a chat",
          },
        ],
      };
    }
    // Create new chat
    try {
      const isGroupChat = participantIds.length > 1;
      const result = await this.repository.createChat({
        creatorId,
        name,
        image,
        isGroupChat,
      });
      // handle creation error
      if (!result || result.length === 0) {
        return {
          errors: [
            {
              field: "root",
              message: "Error creating chat",
            },
          ],
        };
      }
      const createdChat = result[0];
      participantIds.forEach(async (id) => {
        await this.repository.addChatParticipant({
          userId: id,
          chatId: createdChat.id,
        });
      });
      return await this.singleChatFetcher({
        filters: [eq(chats.id, createdChat.id)],
      });
    } catch (error) {
      console.error(error);
      return {
        errors: [
          {
            field: "root",
            message: error.message ?? "An Error occurred during chat creation",
          },
        ],
      };
    }
  }

  async createConversation({
    creatorId,
    name,
    image,
    participantIds,
  }: {
    creatorId?: number;
    name: string;
    image?: string;
    participantIds?: number[];
  }): Promise<ChatResponse> {
    // Check if user is logged in
    if (!creatorId || !participantIds) {
      return {
        errors: [
          {
            field: "root",
            message: "You must be logged in to create a chat",
          },
        ],
      };
    }
    // filter out creator from participantIds
    const participantIdsFiltered = participantIds.filter(
      (id) => id !== creatorId
    );
    const chateeId = participantIdsFiltered[0];
    const filters: SQL[] = [
      eq(chats.isGroupChat, false),
      or(
        and(
          eq(chats.creatorId, creatorId),
          eq(chatParticipants.chatId, chats.id),
          eq(chatParticipants.userId, chateeId)
        ),
        and(
          eq(chats.creatorId, chateeId),
          eq(chatParticipants.chatId, chats.id),
          eq(chatParticipants.userId, creatorId)
        )
      )!,
    ];
    // Check if a chat with the same user already exists
    const chatExists = await this.repository.getAllChatsWithFilters({
      filters,
    });
    if (chatExists.length > 0) {
      return {
        chat: chatExists[0],
        errors: [
          {
            field: "chat_exists",
            message: "You already have a chat with this user",
          },
        ],
      };
    }
    // Create new chat
    try {
      const isGroupChat = false;
      const result = await this.repository.createChat({
        creatorId,
        name,
        image,
        isGroupChat,
      });
      // handle creation error
      if (!result || result.length === 0) {
        return {
          errors: [
            {
              field: "root",
              message: "Error creating chat",
            },
          ],
        };
      }
      const createdChat = result[0];
      //   Add creator to chat participants
      await this.repository.addChatParticipant({
        userId: creatorId,
        chatId: createdChat.id,
      });
      //   Add participants to chat participants
      await this.repository.addChatParticipant({
        userId: chateeId,
        chatId: createdChat.id,
      });
      return await this.singleChatFetcher({
        filters: [eq(chats.id, createdChat.id)],
      });
    } catch (error) {
      console.error(error);
      return {
        errors: [
          {
            field: "root",
            message: error.message ?? "An Error occurred during chat creation",
          },
        ],
      };
    }
  }

  async updateChat({
    creatorId,
    chatId,
    name,
    image,
  }: {
    creatorId?: number;
    chatId: number;
    name?: string;
    image?: string;
  }): Promise<ChatResponse> {
    // Check if user is logged in
    if (!creatorId) {
      return {
        errors: [
          {
            field: "creatorId",
            message: "You must be logged in to update a chat",
          },
        ],
      };
    }
    // Update chat
    try {
      const result = await this.repository.updateChat({
        creatorId,
        chatId,
        name,
        image,
      });
      // handle update error
      if (!result || result.length === 0) {
        return {
          errors: [
            {
              field: "root",
              message:
                "Error updating chat, make sure you are updating a chat you created and the chat exists.",
            },
          ],
        };
      }
      return {
        chat: result[0],
      };
    } catch (error) {
      console.error(error);
      return {
        errors: [
          {
            field: "root",
            message: error.message ?? "An Error occurred during updating chat",
          },
        ],
      };
    }
  }

  async deleteChat({
    creatorId,
    chatId,
  }: {
    creatorId?: number;
    chatId: number;
  }): Promise<ChatConfirmResponse> {
    const operation: ChatOperation = { delete: true };
    // Check if user is logged in
    if (!creatorId) {
      return {
        operation,
        chatId,
        errors: [
          {
            field: "creatorId",
            message: "You must be logged in to delete a chat",
          },
        ],
      };
    }
    // Delete chat
    try {
      // First get the participant Ids to publish the update to them.
      const participants = await this.repository.getChatParticipants({
        chatId,
      });
      const participantIds = participants.map((p) => p.userId);
      await this.repository.deleteChat({
        chatId,
        creatorId,
      });
      return {
        operation,
        chatId,
        participantIds,
      };
    } catch (error) {
      console.error(error);
      return {
        operation,
        chatId,
        errors: [
          {
            field: "root",
            message: error.message ?? "An Error occurred during deletion",
          },
        ],
      };
    }
  }

  async addChatParticipant({
    chatId,
    participantId,
  }: {
    chatId: number;
    participantId: number;
  }): Promise<ChatConfirmResponse> {
    const operation: ChatOperation = { addParticipant: true };
    // Add participant to chat
    try {
      const result = await this.repository.addChatParticipant({
        userId: participantId,
        chatId,
      });
      // handle creation error
      if (!result || result.length === 0) {
        return {
          operation,
          chatId,
          errors: [
            {
              field: "root",
              message: "Error adding participant to chat",
            },
          ],
        };
      }
      const participants = await this.repository.getChatParticipants({
        chatId,
      });
      const participantIds = participants.map((p) => p.userId);
      return {
        operation,
        chatId,
        participantIds,
      };
    } catch (error) {
      console.error(error);
      return {
        operation,
        chatId,
        errors: [
          {
            field: "root",
            message:
              error.message ??
              "An Error occurred during adding participant to chat",
          },
        ],
      };
    }
  }

  async removeChatParticipant({
    chatId,
    participantId,
  }: {
    chatId: number;
    participantId: number;
  }): Promise<ChatConfirmResponse> {
    const operation: ChatOperation = { removeParticipant: true };
    // Remove participant from chat
    try {
      const participants = await this.repository.getChatParticipants({
        chatId,
      });
      const participantIds = participants.map((p) => p.userId);
      const result = await this.repository.removeChatParticipant({
        userId: participantId,
        chatId,
      });
      // handle creation error
      if (!result) {
        return {
          operation,
          chatId,
          errors: [
            {
              field: "root",
              message: "Error removing participant from chat",
            },
          ],
        };
      }
      return {
        operation,
        chatId,
        participantIds,
      };
    } catch (error) {
      console.error(error);
      return {
        operation,
        chatId,
        errors: [
          {
            field: "root",
            message:
              error.message ??
              "An Error occurred during removing participant from chat",
          },
        ],
      };
    }
  }

  async checkChatParticipant({
    userId,
    chatId,
  }: {
    userId?: number;
    chatId: number;
  }): Promise<ConfirmResponse> {
    // Check if user is logged in
    if (!userId) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message:
              "You must be logged in to check if a user is a participant in a chat",
          },
        ],
      };
    }
    // Check if user is a participant in the chat
    try {
      const result = await this.repository.checkChatParticipant({
        userId,
        chatId,
      });
      // handle creation error
      if (!result || result.length === 0) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message: "User is not a participant in chat",
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
            message:
              error.message ??
              "An Error occurred during checking if user is a participant in chat",
          },
        ],
      };
    }
  }
}
