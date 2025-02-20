import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { VoteOptions, voteOptions } from ".";

@ObjectType()
export class Post {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;

  @Field(() => Int)
  authorId: number;

  // Additional Fields
  @Field(() => Int, { nullable: true })
  upvotesCount?: number;

  @Field(() => VoteOptions, { nullable: true })
  isUpvoted?: voteOptions;

  @Field(() => Int, { nullable: true })
  commentsCount?: number;

  @Field(() => User, { nullable: true })
  author?: User;
}
