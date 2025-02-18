import { Field, Int, ObjectType } from "type-graphql";

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
}
