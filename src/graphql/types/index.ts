import { Request, Response } from "express";
import { db } from "src/database/db";
import { redisClient } from "src/redis";
import { ObjectType, Field, registerEnumType } from "type-graphql";

export interface MyContext {
  req: Request;
  res: Response;
  db: typeof db;
  redis: typeof redisClient;
}
// Error Type

@ObjectType()
export class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}
@ObjectType()
export class ConfirmResponse {
  @Field(() => Boolean)
  success: boolean;
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
export type voteOptions = "upvote" | "downvote" | "none";

export enum VoteOptions {
  Upvote = "upvote",
  Downvote = "downvote",
  None = "none",
}

registerEnumType(VoteOptions, {
  name: "VoteOptions", // This name will be used in GraphQL schema
  description: "Represents the user's vote status on a post",
});

export type SortOptions = "Best" | "Hot" | "New" | "Top" | "Old";
