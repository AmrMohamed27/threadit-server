import {
  ReturnedComment,
  ReturnedCommunity,
  ReturnedPost,
  ReturnedUserWithoutPassword,
} from "../database/schema";
import { FieldError, SortOptions, VoteOptions } from "./resolvers";
import { Field, InputType, Int, ObjectType } from "type-graphql";
import { Post } from "../graphql/types/Post";
import { Community } from "../graphql/types/Community";
import { Comment } from "../graphql/types/Comment";

export type ExtendedPost = ReturnedPost & {
  upvotesCount?: number;
  commentsCount?: number;
  isUpvoted?: VoteOptions;
  author?: ReturnedUserWithoutPassword | null;
};

// Post Response type
@ObjectType()
export class PostResponse {
  @Field(() => Post, { nullable: true })
  post?: ExtendedPost;
  @Field(() => [Post], { nullable: true })
  postsArray?: ExtendedPost[];
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
  @Field({ nullable: true })
  userId?: number;
  @Field()
  page: number;
  @Field()
  limit: number;
  @Field(() => String, { nullable: true })
  sortBy?: SortOptions;
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
  @Field()
  title: string;
  @Field()
  content: string;
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
  @Field(() => Boolean, { nullable: true })
  isPrivate?: boolean;
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

@InputType()
export class UpdateUserImageInput {
  @Field()
  image: string;
}

// Extended comment response type
export type ExtendedComment = ReturnedComment & {
  upvotesCount?: number;
  downvotesCount?: number;
  isUpvoted?: VoteOptions;
  author?: ReturnedUserWithoutPassword | null;
  replies?: ExtendedComment[];
};

// Comment Response type
@ObjectType()
export class CommentResponse {
  @Field(() => Comment, { nullable: true })
  comment?: ExtendedComment;
  @Field(() => [Comment], { nullable: true })
  commentsArray?: ExtendedComment[];
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => Int, { nullable: true })
  count?: number;
}
// Get Comment By Id Input Type
@InputType()
export class GetCommentByIdInput {
  @Field(() => Int)
  commentId: number;
}

// Create Comment Input Type
@InputType()
export class CreateCommentInput {
  @Field()
  content: string;
  @Field()
  postId: number;
  @Field(() => Int, { nullable: true })
  parentCommentId?: number;
}

// Update Comment Input Type
@InputType()
export class UpdateCommentInput {
  @Field()
  id: number;
  @Field()
  content: string;
}

@InputType()
export class GetPostCommentsInput {
  @Field(() => Int)
  postId: number;
  @Field(() => String, { nullable: true })
  sortBy?: SortOptions;
  @Field(() => String, { nullable: true })
  searchTerm?: string;
}

@InputType()
export class GetUserCommentsInput {
  @Field(() => Int, { nullable: true })
  userId?: number;
  @Field(() => String, { nullable: true })
  sortBy?: SortOptions;
  @Field()
  limit: number;
  @Field()
  page: number;
}

@InputType()
export class GetUserHiddenPostsInput {
  @Field(() => String, { nullable: true })
  sortBy?: SortOptions;
  @Field()
  limit: number;
  @Field()
  page: number;
}

@InputType()
export class GetUserVotedPostsOptions {
  @Field(() => String, { nullable: true })
  sortBy?: SortOptions;
  @Field()
  limit: number;
  @Field()
  page: number;
  @Field()
  isUpvoted: boolean;
}

// Update user name input
@InputType()
export class UpdateUserNameInput {
  @Field()
  name: string;
}
