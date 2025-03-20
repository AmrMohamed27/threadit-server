import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import { redisRealPubSub, SubscriptionTopics } from "../../redis/pubsub";
import {
  AddChatParticipantInput,
  ChatResponse,
  CreateChatInput,
  MessageResponse,
  UpdateChatInput,
  UserResponse,
} from "../../types/inputs";
import {
  ChatConfirmResponse,
  ConfirmResponse,
  MyContext,
} from "../../types/resolvers";

@Resolver()
export class ChatResolver {
  // Query to get all the user's chats
  @Query(() => ChatResponse)
  async getUserChats(@Ctx() ctx: MyContext): Promise<ChatResponse> {
    // Get user id from session
    const userId = ctx.userId;
    return await ctx.Services.chats.fetchUserChats({ userId });
  }

  //   Query to get all the participants of a chat
  @Query(() => UserResponse)
  async getChatParticipants(
    @Arg("chatId") chatId: number,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    return await ctx.Services.chats.fetchChatParticipants({ chatId });
  }

  //   Query to get a chat by id
  @Query(() => ChatResponse)
  async getChatById(
    @Arg("chatId") chatId: number,
    @Ctx() ctx: MyContext
  ): Promise<ChatResponse> {
    return await ctx.Services.chats.fetchChatById({ chatId });
  }

  //   Query to check if a user is a participant in a chat
  @Query(() => ConfirmResponse)
  async checkChatParticipant(
    @Arg("chatId") chatId: number,
    @Ctx() ctx: MyContext
  ): Promise<ConfirmResponse> {
    // Get user id from session
    const userId = ctx.userId;
    return await ctx.Services.chats.checkChatParticipant({
      userId,
      chatId,
    });
  }

  //   Query to get all the messages in a chat
  @Query(() => MessageResponse)
  async getChatMessages(
    @Arg("chatId") chatId: number,
    @Ctx() ctx: MyContext
  ): Promise<MessageResponse> {
    return await ctx.Services.messages.fetchChatMessages({ chatId });
  }

  // Mutation to create a new chat
  @Mutation(() => ChatResponse)
  async createChat(
    @Ctx() ctx: MyContext,
    @Arg("options") options: CreateChatInput
  ): Promise<ChatResponse> {
    // Destructure input
    const { name, image, isGroupChat, participantIds } = options;
    console.log("Participant Ids: ", participantIds);
    // Get creator id from session
    const creatorId = ctx.userId;
    let result: ChatResponse;
    if (isGroupChat === true) {
      result = await ctx.Services.chats.createGroupChat({
        creatorId,
        name,
        image,
        participantIds,
      });
    } else {
      result = await ctx.Services.chats.createConversation({
        name,
        creatorId,
        image,
        participantIds,
      });
    }
    if (result.chat) {
      const { chat: joinedChat } = await ctx.Services.chats.fetchChatById({
        chatId: result.chat.id,
      });
      await ctx.pubSub.publish(SubscriptionTopics.NEW_CHAT, {
        chat: joinedChat,
        errors: result.errors,
      });
    }

    return result;
  }

  // Mutation to update a chat
  @Mutation(() => ChatResponse)
  async updateChat(
    @Arg("options") options: UpdateChatInput,
    @Ctx() ctx: MyContext
  ): Promise<ChatResponse> {
    // Destructure input
    const { chatId, image, name } = options;
    const creatorId = ctx.userId;
    const result = await ctx.Services.chats.updateChat({
      chatId,
      name,
      image,
      creatorId,
    });
    await ctx.pubSub.publish(SubscriptionTopics.CHAT_UPDATED, result);
    return result;
  }

  // Mutation to delete a chat
  @Mutation(() => ChatConfirmResponse)
  async deleteChat(
    @Arg("chatId") chatId: number,
    @Ctx() ctx: MyContext
  ): Promise<ChatConfirmResponse> {
    const creatorId = ctx.userId;
    const result = await ctx.Services.chats.deleteChat({
      chatId,
      creatorId,
    });
    await ctx.pubSub.publish(SubscriptionTopics.CHAT_DELETED, result);
    return result;
  }

  //   Mutation to add a participant to a chat
  @Mutation(() => ChatConfirmResponse)
  async addChatParticipant(
    @Arg("options") options: AddChatParticipantInput,
    @Ctx() ctx: MyContext
  ): Promise<ChatConfirmResponse> {
    // Destructure input
    const { chatId, participantId } = options;
    const result = await ctx.Services.chats.addChatParticipant({
      chatId,
      participantId,
    });
    if (!result.errors) {
      await ctx.pubSub.publish(
        SubscriptionTopics.CHAT_PARTICIPANT_ADDED,
        result
      );
    }
    return result;
  }

  //   Mutation to remove a participant from a chat
  @Mutation(() => ChatConfirmResponse)
  async removeChatParticipant(
    @Arg("options") options: AddChatParticipantInput,
    @Ctx() ctx: MyContext
  ): Promise<ChatConfirmResponse> {
    // Destructure input
    const { chatId, participantId } = options;
    const result = await ctx.Services.chats.removeChatParticipant({
      chatId,
      participantId,
    });
    if (!result.errors) {
      await ctx.pubSub.publish(
        SubscriptionTopics.CHAT_PARTICIPANT_REMOVED,
        result
      );
    }
    return result;
  }

  // Subscription to listen for new chats
  @Subscription(() => ChatResponse, {
    subscribe: () =>
      redisRealPubSub.asyncIterator([SubscriptionTopics.NEW_CHAT]),
    nullable: true,
  })
  async newChat(@Root() response: ChatResponse, @Ctx() ctx: MyContext) {
    const userId = ctx.userId;
    console.log("Response; ", response.chat);
    // Handle filtering here
    if (userId && response.chat) {
      // Only return the chat if it's relevant to this user
      // Case 1: the user is the creator of the chat so we don't need to check the chat
      if (response.chat.creatorId === userId) {
        console.log("Creator: ", userId);
        return response;
      }
      // Case 2: The user is not the creator so we need to check if the user is a participant in the chat
      const result = await ctx.Services.chats.checkChatParticipant({
        userId,
        chatId: response.chat.id,
      });
      if (result.success) {
        console.log("Participant: ", userId);
        return response;
      } else {
        // Return null or undefined to filter out this chat
        console.log("No Participant: ", userId);
        return null;
      }
    }
    // If no userId filter or chat passes the filter, return null
    console.log("No UserId: ", userId);
    return response;
  }

  // Subscription to listen for chat updates
  @Subscription(() => ChatConfirmResponse, {
    subscribe: () =>
      redisRealPubSub.asyncIterator([
        SubscriptionTopics.CHAT_UPDATED,
        SubscriptionTopics.CHAT_DELETED,
        SubscriptionTopics.CHAT_PARTICIPANT_ADDED,
        SubscriptionTopics.CHAT_PARTICIPANT_REMOVED,
      ]),
  })
  async chatUpdates(
    @Root() response: ChatConfirmResponse,
    @Ctx() ctx: MyContext
  ) {
    const userId = ctx.userId;
    const { operation, participantIds, errors } = response;
    if (userId && operation && participantIds && !errors) {
      return response;
    } else {
      return null;
    }
  }
}
