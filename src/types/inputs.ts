import {
  ReturnedCommunity,
  ReturnedPost,
  ReturnedUserWithoutPassword,
} from "../database/schema";
import { FieldError, SortOptions, VoteOptions } from "./resolvers";
import { Field, InputType, Int, ObjectType } from "type-graphql";
import { Post } from "../graphql/types/Post";
import { Community } from "../graphql/types/Community";

export type extendedPost = ReturnedPost & {
  upvotesCount?: number;
  commentsCount?: number;
  isUpvoted?: VoteOptions;
  author?: ReturnedUserWithoutPassword | null;
};

// Post Response type
@ObjectType()
export class PostResponse {
  @Field(() => Post, { nullable: true })
  post?: extendedPost;
  @Field(() => [Post], { nullable: true })
  postsArray?: extendedPost[];
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => Int, { nullable: true })
  count?: number;
}

// Get All Posts Input Type
@InputType()
export class GetAllPostsInput {
  @Field()
  page: number;
  @Field()
  limit: number;
  @Field(() => String, { nullable: true })
  sortBy?: SortOptions;
}
// Get Search Result Input Type
@InputType()
export class GetSearchResultInput {
  @Field()
  searchTerm: string;
  @Field()
  page: number;
  @Field()
  limit: number;
  @Field(() => String, { nullable: true })
  sortBy?: SortOptions;
}
@InputType()
export class GetUserPostsInput {
  @Field()
  userId: number;
  @Field()
  page: number;
  @Field()
  limit: number;
}
// Create Post Input Type
@InputType()
export class CreatePostInput {
  @Field()
  title: string;
  @Field()
  content: string;
  @Field()
  communityId: number;
}
// Update Post Input Type
@InputType()
export class UpdatePostInput {
  @Field()
  id: number;
  @Field({ nullable: true })
  title?: string;
  @Field({ nullable: true })
  content?: string;
}

// Get User's Communities' Posts Input Type
@InputType()
export class GetUserCommunityPostsInput {
  @Field()
  page: number;
  @Field()
  limit: number;
  @Field(() => String, { nullable: true })
  sortBy?: SortOptions;
}

export type extendedCommunity = ReturnedCommunity & {
  postsCount?: number;
  membersCount?: number;
  creator?: ReturnedUserWithoutPassword | null;
  isJoined?: boolean;
};

// Community Response type
@ObjectType()
export class CommunityResponse {
  @Field(() => Community, { nullable: true })
  community?: extendedCommunity;
  @Field(() => [Community], { nullable: true })
  communitiesArray?: extendedCommunity[];
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => Int, { nullable: true })
  count?: number;
}

// Input type for creating a community
@InputType()
export class CreateCommunityInput {
  @Field()
  name: string;
  @Field()
  description: string;
  @Field({ nullable: true })
  image?: string;
}
// Input type for updating a community
@InputType()
export class UpdateCommunityInput {
  @Field()
  id: number;
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  description?: string;
  @Field({ nullable: true })
  image?: string;
}

// Input type for getting all posts in a community
@InputType()
export class GetCommunityPostsInput {
  @Field()
  communityId: number;
  @Field()
  page: number;
  @Field()
  limit: number;
  @Field(() => String, { nullable: true })
  sortBy?: SortOptions;
}