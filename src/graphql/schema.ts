import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/PostResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { CommentResolver } from "./resolvers/CommentResolver";
import { VoteResolver } from "./resolvers/VoteResolver";
import { HiddenPostsResolver } from "./resolvers/HiddenPostsResolver";
import { SavedPostsResolver } from "./resolvers/SavedPostsResolver";

export async function createSchema() {
  return await buildSchema({
    resolvers: [
      PostResolver,
      UserResolver,
      CommentResolver,
      VoteResolver,
      HiddenPostsResolver,
      SavedPostsResolver,
    ],
    validate: false,
  });
}
