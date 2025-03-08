import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/PostResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { CommentResolver } from "./resolvers/CommentResolver";
import { VoteResolver } from "./resolvers/VoteResolver";
import { HiddenPostsResolver } from "./resolvers/HiddenPostsResolver";
import { SavedPostsResolver } from "./resolvers/SavedPostsResolver";
import { CommunityResolver } from "./resolvers/CommunityResolver";
import { CommunityMembersResolver } from "./resolvers/CommunityMembersResolver";
import { MessageResolver } from "./resolvers/MessageResolver";
import { PubSub as GraphQLPubSub, PubSubEngine } from "graphql-subscriptions";
import { PubSub } from "type-graphql";
import { ExtendedMessage, MessageResponse } from "src/types/inputs";

// Create an adapter that implements type-graphql's PubSub
class PubSubAdapter implements PubSub {
  private pubSub: GraphQLPubSub;

  constructor() {
    this.pubSub = new GraphQLPubSub();
  }

  async publish(triggerName: string, payload: any): Promise<void> {
    return this.pubSub.publish(triggerName, payload);
  }

  subscribe(
    triggerName: string,
    onMessage: (...args: any[]) => void
  ): AsyncIterable<unknown> {
    const asyncIterator = this.pubSub.asyncIterableIterator(triggerName);
    // Set up subscription handling
    const subscription = this.pubSub.subscribe(triggerName, onMessage);
    console.log("Hey");
    return asyncIterator;
  }

  asyncIterator(triggerName: string): AsyncIterator<any, any, any> {
    const asyncIterableIterator: AsyncIterator<any, any, any> =
      this.pubSub.asyncIterableIterator(triggerName);
    return asyncIterableIterator;
  }

  async unsubscribe(subId: number): Promise<void> {
    return this.pubSub.unsubscribe(subId);
  }
}

export const pubSub = new GraphQLPubSub<{
  NEW_MESSAGE: MessageResponse;
}>();

export async function createSchema() {
  return await buildSchema({
    resolvers: [
      PostResolver,
      UserResolver,
      CommentResolver,
      VoteResolver,
      HiddenPostsResolver,
      SavedPostsResolver,
      CommunityResolver,
      CommunityMembersResolver,
      MessageResolver,
    ],
    validate: false,
    pubSub: pubSub as unknown as PubSub,
  });
}
