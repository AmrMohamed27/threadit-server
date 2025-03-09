import "reflect-metadata";
import { buildSchema, PubSub } from "type-graphql";
import { redisRealPubSub } from "../redis/pubsub";
import { CommentResolver } from "./resolvers/CommentResolver";
import { CommunityMembersResolver } from "./resolvers/CommunityMembersResolver";
import { CommunityResolver } from "./resolvers/CommunityResolver";
import { HiddenPostsResolver } from "./resolvers/HiddenPostsResolver";
import { MessageResolver } from "./resolvers/MessageResolver";
import { PostResolver } from "./resolvers/PostResolver";
import { SavedPostsResolver } from "./resolvers/SavedPostsResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { VoteResolver } from "./resolvers/VoteResolver";

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
    pubSub: redisRealPubSub as unknown as PubSub,
  });
}
