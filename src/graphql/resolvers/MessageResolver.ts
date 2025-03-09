import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import {
  CreateMessageInput,
  MessageResponse,
  UpdateMessageInput,
} from "../../types/inputs";
import { ConfirmResponse, MyContext } from "../../types/resolvers";
import { pubSub } from "../schema";

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
    const senderId = ctx.req.session.userId;
    const result = await ctx.Services.messages.createMessage({
      senderId,
      chatId,
      content,
      media,
    });
    ctx.pubSub.publish("NEW_MESSAGE", result);
    return result;
  }

  // Mutation to update a message
  @Mutation(() => ConfirmResponse)
  async updateMessage(
    @Arg("options") options: UpdateMessageInput,
    @Ctx() ctx: MyContext
  ): Promise<ConfirmResponse> {
    // Destructure input
    const { content, messageId } = options;
    const senderId = ctx.req.session.userId;
    return await ctx.Services.messages.updateMessage({
      messageId,
      content,
      senderId,
    });
  }

  // Mutation to delete a message
  @Mutation(() => ConfirmResponse)
  async deleteMessage(
    @Arg("messageId") messageId: number,
    @Ctx() ctx: MyContext
  ): Promise<ConfirmResponse> {
    const senderId = ctx.req.session.userId;
    return await ctx.Services.messages.deleteMessage({
      messageId,
      senderId,
    });
  }

  // Subscription to listen for new messages
  @Subscription(() => MessageResponse, {
    subscribe: () => pubSub.asyncIterableIterator("NEW_MESSAGE"),
  })
  newMessage(
    @Root() message: MessageResponse,
    @Arg("userId", () => Int) userId: number
    // @Ctx() ctx: MyContext
  ): MessageResponse {
    console.log("New message received:", message);
    return message;
  }
}
