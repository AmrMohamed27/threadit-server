import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType()
export class Community {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => String, { nullable: true })
  image: string;

  @Field(() => String, { nullable: true })
  cover: string;

  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;

  @Field(() => Int)
  creatorId: number;

  // Additional Fields
  @Field(() => Int, { nullable: true })
  postsCount?: number;
  @Field(() => Int, { nullable: true })
  membersCount?: number;

  @Field(() => User, { nullable: true })
  creator?: User;

  @Field(() => Boolean, { nullable: true })
  isJoined?: boolean;
}
