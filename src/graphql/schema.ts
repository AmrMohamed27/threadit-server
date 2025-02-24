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
    ],
    validate: false,
  });
}
