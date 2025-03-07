import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { CreateMessageInput, MessageResponse } from "../../types/inputs";
import { ConfirmResponse, MyContext } from "../../types/resolvers";

@Resolver()
export class MessageResolver {
  // Query to get a chat between the current user and another user
  @Query(() => MessageResponse)
  async getChat(
    @Ctx() ctx: MyContext,
    @Arg("user2", () => Int) user2: number
  ): Promise<MessageResponse> {
    const user1 = ctx.req.session.userId;
    return await ctx.Services.messages.fetchChat({
      user1,
      user2,
    });
  }

  // Mutation to create a new message
  @Mutation(() => MessageResponse)
  async createMessage(
    @Ctx() ctx: MyContext,
    @Arg("options") options: CreateMessageInput
  ): Promise<MessageResponse> {
    // Destructure input
    const { receiverId, content, media } = options;
    // Get author id from session
    const senderId = ctx.req.session.userId;
    return await ctx.Services.messages.createMessage({
      senderId,
      receiverId,
      content,
      media,
    });
  }

  // Mutation to update a message
  @Mutation(() => ConfirmResponse)
  async updateMessage(
    @Arg("messageId") messageId: number,
    @Arg("content") content: string,
    @Ctx() ctx: MyContext
  ): Promise<ConfirmResponse> {
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
}
