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
export type VoteOptions = "upvote" | "downvote" | "none";

export enum VoteOptionsEnum {
  Upvote = "upvote",
  Downvote = "downvote",
  None = "none",
}

registerEnumType(VoteOptionsEnum, {
  name: "VoteOptions", // This name will be used in GraphQL schema
  description: "Represents the user's vote status on a post",
});

export type SortOptions = "Best" | "Hot" | "New" | "Top" | "Old";

export interface selectionProps {
  ctx: MyContext;
  userId?: number;
  postId?: number;
  communityId?: number;
}

export interface searchSelectionProps extends selectionProps {
  searchTerm: string;
}
