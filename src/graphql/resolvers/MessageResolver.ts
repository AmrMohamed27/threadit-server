import { Arg, Ctx, Mutation, Resolver, Root, Subscription } from "type-graphql";
import { redisRealPubSub, SubscriptionTopics } from "../../redis/pubsub";
import {
  CreateMessageInput,
  MessageResponse,
  UpdateMessageInput,
} from "../../types/inputs";
import { ConfirmResponse, MyContext } from "../../types/resolvers";

@Resolver()
export class MessageResolver {
  // Mutation to create a new message
  @Mutation(() => MessageResponse)
  async createMessage(
    @Ctx() ctx: MyContext,
    @Arg("options") options: CreateMessageInput
  ): Promise<MessageResponse> {
    // Destructure input
    const { chatId, content, media } = options;
    // Get author id from session
    const senderId = ctx.userId;
    const result = await ctx.Services.messages.createMessage({
      senderId,
      chatId,
      content,
      media,
    });
    await ctx.pubSub.publish(SubscriptionTopics.NEW_MESSAGE, result);
    await ctx.pubSub.publish(
      SubscriptionTopics.DIRECT_MESSAGE_NOTIFICATION,
      result
    );

    return result;
  }

  // Mutation to update a message
  @Mutation(() => ConfirmResponse)
  async updateMessage(
    @Arg("options") options: UpdateMessageInput,
    @Ctx() ctx: MyContext
  ): Promise<MessageResponse> {
    // Destructure input
    const { content, messageId } = options;
    const senderId = ctx.userId;
    const result = await ctx.Services.messages.updateMessage({
      messageId,
      content,
      senderId,
    });
    await ctx.pubSub.publish(SubscriptionTopics.MESSAGE_UPDATED, result);
    return result;
  }

  // Mutation to delete a message
  @Mutation(() => ConfirmResponse)
  async deleteMessage(
    @Arg("messageId") messageId: number,
    @Ctx() ctx: MyContext
  ): Promise<ConfirmResponse> {
    const senderId = ctx.userId;
    const result = await ctx.Services.messages.deleteMessage({
      messageId,
      senderId,
    });
    if (result.success) {
      await ctx.pubSub.publish(SubscriptionTopics.MESSAGE_DELETED, result);
    }
    return result;
  }

  // Subscription to listen for new messages
  @Subscription(() => MessageResponse, {
    subscribe: () =>
      redisRealPubSub.asyncIterator([SubscriptionTopics.NEW_MESSAGE]),
  })
  async newMessage(@Root() response: MessageResponse, @Ctx() ctx: MyContext) {
    const userId = ctx.userId;
    console.log(userId);

    // Handle filtering here
    if (userId && response.message) {
      // Only return the message if it's relevant to this user
      // Case 1: the user is the sender of the message so we don't need to check the chat
      if (response.message.senderId === userId) {
        return response;
      }
      // Case 2: The user is not the sender so we need to check if the user is a participant in the chat
      const chatId = response.message.chatId;
      const result = await ctx.Services.chats.checkChatParticipant({
        userId,
        chatId,
      });
      if (result.success) {
        return response;
      }
      // Return null to filter out this message
      return null;
    }

    // If no userId or no message response, return null
    return null;
  }
}
