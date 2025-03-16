import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class HiddenPost {
  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  postId: number;
}
