import { db } from "../database/db";
import { Services } from "../service";
import { Request, Response } from "express";
import { redisClient } from "src/redis";
import { ObjectType, Field, registerEnumType } from "type-graphql";

export interface MyContext {
  req: Request;
  res: Response;
  redis: typeof redisClient;
  Services: typeof Services;
  db: typeof db;
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
  isUpvoted?: boolean;
}

export interface newSelectionProps {
  userId?: number;
}

export interface searchSelectionProps extends selectionProps {
  searchTerm: string;
}

export interface PostQueryResult {
  id: number;
  title: string;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  authorId: number;
  communityId: number;

  // Author Details
  author: {
    id: number;
    name: string;
    image: string | null;
    email: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    confirmed: boolean;
  } | null;

  // Community Details
  community: {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    creatorId: number;
    isPrivate: boolean | null;
    membersCount: number;
    postsCount: number;
  } | null;

  // Vote & Comment Data
  upvotesCount: number;
  downvotesCount: number;
  isUpvoted: number;
  isDownvoted: number;
  commentsCount: number;
}

export interface CommentQueryResult {
  id: number;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  authorId: number;
  postId: number;
  parentCommentId: number | null;
  // Author Details
  author: {
    id: number;
    name: string;
    image: string | null;
    email: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    confirmed: boolean;
  } | null;
  // Upvote Count
  upvotesCount: number;
  downvotesCount: number;
  isUpvoted: number;
  isDownvoted: number;
}
