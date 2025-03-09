import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { Chat } from "./Chat";

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
  chatId: number;

  @Field(() => User, { nullable: true })
  sender?: User;

  @Field(() => Chat, { nullable: true })
  chat?: Chat;

  @Field(() => String, { nullable: true })
  media?: string;
}
