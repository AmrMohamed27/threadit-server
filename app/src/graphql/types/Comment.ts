import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { VoteOptions, VoteOptionsEnum } from "../../types/resolvers";

@ObjectType()
export class Comment {
  @Field(() => Int)
  id: number;

  @Field()
  content: string;

  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;

  @Field(() => Int)
  authorId: number;

  @Field(() => Int)
  postId: number;

  @Field(() => Int, { nullable: true })
  parentCommentId?: number;

  // Additional Fields
  @Field(() => Int, { nullable: true })
  upvotesCount?: number;

  @Field(() => VoteOptionsEnum, { nullable: true })
  isUpvoted?: VoteOptions;

  @Field(() => User, { nullable: true })
  author?: User;

  @Field(() => [Comment], { nullable: true })
  replies?: Comment[];
}
