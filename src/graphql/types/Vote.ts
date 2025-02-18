import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class Vote {
  @Field(() => Int)
  id: number;

  @Field()
  isUpvote: boolean;

  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;

  @Field(() => Int)
  userId: number;

  @Field(() => Int, { nullable: true })
  postId: number;

  @Field(() => Int, { nullable: true })
  commentId: number;
}
