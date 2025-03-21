import { Request, Response } from "express";
import { Field, Int, ObjectType, registerEnumType } from "type-graphql";
import { db } from "../database/db";
import { Services } from "../graphql/service";
import { redisClient } from "../redis";
import { redisRealPubSub } from "../redis/pubsub";

export interface MyContext {
  req: Request;
  res: Response;
  userId?: number;
  redis: typeof redisClient;
  Services: typeof Services;
  db: typeof db;
  pubSub: typeof redisRealPubSub;
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

@ObjectType()
export class ChatOperation {
  @Field(() => Boolean, { nullable: true })
  delete?: boolean;
  @Field(() => Boolean, { nullable: true })
  addParticipant?: boolean;
  @Field(() => Boolean, { nullable: true })
  removeParticipant?: boolean;
  @Field(() => Boolean, { nullable: true })
  update?: boolean;
}
@ObjectType()
export class ChatConfirmResponse {
  @Field(() => ChatOperation)
  operation: ChatOperation;
  @Field()
  chatId: number;
  @Field(() => [Int], { nullable: true })
  participantIds?: number[];
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
  name: "VoteOptions",
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
  media: string[] | null;
  video: string | null;
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

export interface CommunityQueryResult {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  cover: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  creatorId: number;
  isPrivate: boolean | null;
  postsCount: number;
  membersCount: number;
  creator: {
    id: number;
    name: string;
    image: string | null;
    email: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    confirmed: boolean;
  } | null;
  isJoined: number;
}

// Define notification types
export enum NotificationEnum {
  NEW_REPLY = "NEW_REPLY",
  POST_ACTIVITY = "POST_ACTIVITY",
  DIRECT_MESSAGE = "DIRECT_MESSAGE",
}

registerEnumType(NotificationEnum, {
  name: "Notifications",
  description: "Represents the different types of notifications.",
});
@ObjectType()
export class NotificationResponse {
  @Field()
  id: number;
  @Field(() => NotificationEnum)
  type: NotificationEnum;
  @Field()
  userId: number;
  @Field()
  senderId: number;
  @Field()
  senderName: string;
  @Field()
  content: string;
  @Field()
  entityId: number;
  @Field()
  entityType: "Post" | "Comment" | "Message";
  @Field()
  isRead: Boolean;
  @Field(() => String, { nullable: true })
  createdAt: Date | null;
}
