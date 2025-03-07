import {
  ReturnedComment,
  ReturnedCommunity,
  ReturnedMessage,
  ReturnedPost,
  ReturnedUser,
  ReturnedUserWithoutPassword,
  ReturnedVote,
} from "../database/schema";
import { Chat, FieldError, SortOptions, VoteOptions } from "./resolvers";
import { Field, InputType, Int, ObjectType } from "type-graphql";
import { Post } from "../graphql/types/Post";
import { Community } from "../graphql/types/Community";
import { Comment } from "../graphql/types/Comment";
import { User } from "../graphql/types/User";
import { Vote } from "../graphql/types/Vote";
import { Message } from "../graphql/types/Message";

export type ExtendedPost = ReturnedPost & {
  upvotesCount?: number;
  commentsCount?: number;
  isUpvoted?: VoteOptions;
  author?: ReturnedUserWithoutPassword | null;
};

export type ExtendedMessage = ReturnedMessage & {
  sender?: ReturnedUserWithoutPassword | null;
  receiver?: ReturnedUserWithoutPassword | null;
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

// Message Response type
@ObjectType()
export class MessageResponse {
  @Field(() => Message, { nullable: true })
  message?: ExtendedMessage;
  @Field(() => [Message], { nullable: true })
  messagesArray?: ExtendedMessage[];
  @Field(() => [Chat], { nullable: true })
  chats?: Chat[];
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
  @Field(() => [String], { nullable: true })
  media?: string[];
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

// Input type for joining a community
@InputType()
export class JoinCommunityInput {
  @Field()
  communityId: number;
}

// Input type for leaving a community
@InputType()
export class LeaveCommunityInput {
  @Field()
  communityId: number;
}

// Register input type
@InputType()
export class RegisterInput {
  @Field()
  name: string;
  @Field()
  email: string;
  @Field()
  password: string;
}

// Login Input type
@InputType()
export class LoginInput {
  @Field()
  email: string;
  @Field()
  password: string;
}

// Reset password input type
@InputType()
export class ResetPasswordInput {
  @Field()
  newPassword: string;
  @Field()
  token: string;
  @Field()
  email: string;
}

@InputType()
export class CheckTokenInput {
  @Field()
  token: string;
  @Field()
  email: string;
}

// Login Return Type
@ObjectType()
export class UserResponse {
  @Field(() => User, { nullable: true })
  user?: ReturnedUser;
  @Field(() => [User], { nullable: true })
  userArray?: ReturnedUser[];
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => Int, { nullable: true })
  count?: number;
}

// Vote Response type
@ObjectType()
export class VoteResponse {
  @Field(() => Vote, { nullable: true })
  vote?: ReturnedVote;
  @Field(() => [Vote], { nullable: true })
  votesArray?: ReturnedVote[];
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
// Posts and Comments Response Type
// Create Vote Input Type
@InputType()
export class CreateVoteInput {
  @Field({ nullable: true })
  postId?: number;
  @Field({ nullable: true })
  commentId?: number;
  @Field()
  isUpvote: boolean;
}

// Update Vote Input Type
@InputType()
export class UpdateVoteInput {
  @Field(() => Int, { nullable: true })
  postId?: number;
  @Field(() => Int, { nullable: true })
  commentId?: number;
  @Field()
  isUpvote: boolean;
}

// Delete Vote Options Type
@InputType()
export class DeleteVoteOptions {
  @Field(() => Int, { nullable: true })
  postId?: number;
  @Field(() => Int, { nullable: true })
  commentId?: number;
}

// Create Message Input Type
@InputType()
export class CreateMessageInput {
  @Field()
  content: string;
  @Field(() => String, { nullable: true })
  media?: string;
  @Field()
  receiverId: number;
}

// Update message input type
@InputType()
export class UpdateMessageInput {
  @Field()
  content: string;
  @Field(() => Int)
  messageId: number;
}