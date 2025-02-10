import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/HelloResolver";
import { PostResolver } from "./resolvers/PostResolver";

export async function createSchema() {
  return await buildSchema({
    resolvers: [HelloResolver, PostResolver],
    validate: false,
  });
}
