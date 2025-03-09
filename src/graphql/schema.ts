import { PubSub as GraphQLPubSub } from "graphql-subscriptions";
import "reflect-metadata";
import { MessageResponse } from "src/types/inputs";
import { buildSchema, PubSub } from "type-graphql";
import { CommentResolver } from "./resolvers/CommentResolver";
import { CommunityMembersResolver } from "./resolvers/CommunityMembersResolver";
import { CommunityResolver } from "./resolvers/CommunityResolver";
import { HiddenPostsResolver } from "./resolvers/HiddenPostsResolver";
import { MessageResolver } from "./resolvers/MessageResolver";
import { PostResolver } from "./resolvers/PostResolver";
import { SavedPostsResolver } from "./resolvers/SavedPostsResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { VoteResolver } from "./resolvers/VoteResolver";

// Create an adapter that implements type-graphql's PubSub

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
