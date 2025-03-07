import { and, eq, or, SQL } from "drizzle-orm";
import { MessageRepository } from "../repositories/MessageRepository";
import { MessageResponse } from "../../types/inputs";
import { messages } from "../../database/schema";
import { ConfirmResponse } from "../../types/resolvers";

export class MessageService {
  constructor(private repository: typeof MessageRepository) {}

  private async messagesFetcher({
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

  async fetchChat({
    user1,
    user2,
  }: {
    user1?: number;
    user2?: number;
  }): Promise<MessageResponse> {
    // Check if users are provided
    if (!user1 || !user2) {
      return {
        errors: [
          {
            field: "root",
            message: "You must provide two users to get a chat between them.",
          },
        ],
      };
    }
    // Get all messages where user1 is sender or receiver and user2 is sender or receiver
    const filters: SQL[] = [
      or(
        and(eq(messages.senderId, user1), eq(messages.receiverId, user2))!,
        and(eq(messages.senderId, user2), eq(messages.receiverId, user1))!
      )!,
    ];
    return await this.messagesFetcher({ filters });
  }

  async createMessage({
    senderId,
    receiverId,
    content,
    media,
  }: {
    senderId?: number;
    receiverId?: number;
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
    if (!receiverId) {
      return {
        errors: [
          {
            field: "root",
            message: "You must provide a receiverId to create a message",
          },
        ],
      };
    }
    // Create new message
    try {
      const result = await this.repository.insertMessage({
        senderId,
        receiverId,
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
      // Return the created message
      return {
        message: result[0],
      };
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
  }): Promise<ConfirmResponse> {
    // Check if user is logged in
    if (!senderId) {
      return {
        success: false,
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
      if (!result || result.rowCount === 0) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message:
                "Error updating message, make sure you are updating a message you sent and the message exists.",
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
      if (!result || result.rowCount === 0) {
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
}
