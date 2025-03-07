import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType()
export class Message {
  @Field(() => Int)
  id: number;

  @Field()
  content: string;

  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;

  @Field(() => Int)
  senderId: number;

  @Field(() => Int)
  receiverId: number;

  @Field(() => User, { nullable: true })
  sender?: User;

  @Field(() => User, { nullable: true })
  receiver?: User;

  @Field(() => String, { nullable: true })
  media?: string;
}
