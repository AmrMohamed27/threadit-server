import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { VoteOptionsEnum } from "../../types/resolvers";
import { Community } from "./Community";

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

  @Field(() => VoteOptionsEnum, { nullable: true })
  isUpvoted?: VoteOptionsEnum;

  @Field(() => Int, { nullable: true })
  commentsCount?: number;

  @Field(() => User, { nullable: true })
  author?: User;

  @Field(() => Community, { nullable: true })
  community?: Community;

  @Field(() => Int)
  communityId: number;

  @Field(() => [String], { nullable: true })
  media?: string[];

  @Field(() => String, { nullable: true })
  video?: string;
}
