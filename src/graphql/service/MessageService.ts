import { eq, SQL } from "drizzle-orm";
import { messages } from "../../database/schema";
import { MessageResponse } from "../../types/inputs";
import { ConfirmResponse } from "../../types/resolvers";
import { MessageRepository } from "../repositories/MessageRepository";

export class MessageService {
  constructor(private repository: typeof MessageRepository) {}

  async messagesFetcher({
    filters,
  }: {
    filters: SQL[];
  }): Promise<MessageResponse> {
    const result = await this.repository.getAllMessagesWithFilters({
      filters,
    });
    if (!result || result.length === 0) {
      return {
        errors: [{ field: "messages", message: "no messages found" }],
      };
    }
    const resultCount = await this.repository.countAllMessagesWithFilters({
      filters,
    });
    return {
      messagesArray: result,
      count: resultCount[0].count,
    };
  }

  private async singleMessageFetcher({
    filters,
  }: {
    filters: SQL[];
  }): Promise<MessageResponse> {
    const result = await this.repository.getAllMessagesWithFilters({
      filters,
    });
    if (!result || result.length === 0) {
      return {
        errors: [{ field: "messages", message: "no messages found" }],
      };
    }
    return {
      message: result[0],
    };
  }
  async createMessage({
    senderId,
    chatId,
    content,
    media,
  }: {
    senderId?: number;
    chatId?: number;
    content: string;
    media?: string;
  }): Promise<MessageResponse> {
    // Check if user is logged in
    if (!senderId) {
      return {
        errors: [
          {
            field: "root",
            message: "You must be logged in to create a message",
          },
        ],
      };
    }
    // Check if a chat id is provided
    if (!chatId) {
      return {
        errors: [
          {
            field: "root",
            message: "You must provide a chatId to create a message",
          },
        ],
      };
    }
    // Create new message
    try {
      const result = await this.repository.insertMessage({
        senderId,
        chatId,
        content,
        media,
      });
      // handle creation error
      if (!result || result.length === 0) {
        return {
          errors: [
            {
              field: "root",
              message: "Error creating message",
            },
          ],
        };
      }
      return await this.singleMessageFetcher({
        filters: [eq(messages.id, result[0].id)],
      });
    } catch (error) {
      console.error(error);
      return {
        errors: [
          {
            field: "root",
            message: error.message ?? "An Error occurred during creation",
          },
        ],
      };
    }
  }

  async updateMessage({
    senderId,
    messageId,
    content,
  }: {
    senderId?: number;
    messageId: number;
    content: string;
  }): Promise<MessageResponse> {
    // Check if user is logged in
    if (!senderId) {
      return {
        errors: [
          {
            field: "senderId",
            message: "You must be logged in to update a message",
          },
        ],
      };
    }
    // Update message
    try {
      const result = await this.repository.updateMessage({
        content,
        messageId,
        senderId,
      });
      // handle update error
      if (!result || result.length === 0) {
        return {
          errors: [
            {
              field: "root",
              message:
                "Error updating message, make sure you are updating a message you sent and the message exists.",
            },
          ],
        };
      }
      return this.singleMessageFetcher({
        filters: [eq(messages.id, messageId)],
      });
    } catch (error) {
      console.error(error);
      return {
        errors: [
          {
            field: "root",
            message: error.message ?? "An Error occurred during update",
          },
        ],
      };
    }
  }

  async deleteMessage({
    senderId,
    messageId,
  }: {
    senderId?: number;
    messageId: number;
  }): Promise<ConfirmResponse> {
    // Check if user is logged in
    if (!senderId) {
      return {
        success: false,
        errors: [
          {
            field: "senderId",
            message: "You must be logged in to delete a message",
          },
        ],
      };
    }
    // Delete message
    try {
      const result = await this.repository.deleteMessage({
        messageId,
        senderId,
      });
      // handle deletion error
      if (!result) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message:
                "Error deleting message, make sure you are deleting a message you sent and the message exists.",
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
            message: error.message ?? "An Error occurred during deletion",
          },
        ],
      };
    }
  }

  async fetchChatMessages({
    chatId,
  }: {
    chatId: number;
  }): Promise<MessageResponse> {
    try {
      const filters = [eq(messages.chatId, chatId)];
      return await this.messagesFetcher({ filters });
    } catch (error) {
      console.error(error);
      return {
        errors: [
          {
            field: "root",
            message:
              error.message ?? "An Error occurred during getting chat messages",
          },
        ],
      };
    }
  }
}
