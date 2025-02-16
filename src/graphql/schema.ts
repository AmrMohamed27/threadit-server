import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/PostResolver";
import { UserResolver } from "./resolvers/UserResolver";

export async function createSchema() {
  return await buildSchema({
    resolvers: [ PostResolver, UserResolver],
    validate: false,
  });
}
