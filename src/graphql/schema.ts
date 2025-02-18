import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/PostResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { CommentResolver } from "./resolvers/CommentResolver";
import { VoteResolver } from "./resolvers/VoteResolver";

export async function createSchema() {
  return await buildSchema({
    resolvers: [PostResolver, UserResolver, CommentResolver, VoteResolver],
    validate: false,
  });
}
