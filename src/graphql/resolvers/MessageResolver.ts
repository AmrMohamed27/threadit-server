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
import { redisRealPubSub } from "../../redis/pubsub";
import { withFilter } from "graphql-subscriptions";

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
    await ctx.pubSub.publish("NEW_MESSAGE", result);

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
    subscribe: withFilter(
      () => redisRealPubSub.asyncIterator("NEW_MESSAGE"),
      (rootValue, args, context, info) => {
        console.log("Root Value: ", rootValue);
        console.log("Args: ", args);
        console.log("Context: ", context);
        console.log("Info: ", info);
        // const result = rootValue as MessageResponse;
        // if (args.userId && result.message) {
        //   return (
        //     result.message.senderId === args.userId ||
        //     result.message.receiverId === args.userId
        //   );
        // }
        return true;
      }
    ),
    // topics: "NEW_MESSAGE",
    // filter: ({ payload, args, context, info }) => {
    //   console.log("Payload: ", payload);
    //   console.log("Args: ", args);
    //   console.log("Context: ", context);
    //   console.log("Info: ", info);
    //   if (args.userId) {
    //     return (
    //       payload.message.senderId === args.userId ||
    //       payload.message.receiverId === args.userId
    //     );
    //   }
    //   return true;
    // },
  })
  newMessage(
    @Root() response: MessageResponse,
    // @Ctx() ctx: MyContext,
    @Arg("userId", () => Int, { nullable: true }) userId?: number
  ) {
    // console.log("New message received:", message);
    // Handle filtering here
    if (userId && response.message) {
      // Only return the message if it's relevant to this user
      if (response.message.senderId === userId) {
        return response;
      }
      // Return null or undefined to filter out this message
      return null;
    }

    // If no userId filter or message passes the filter, return it
    return response;
  }
}
