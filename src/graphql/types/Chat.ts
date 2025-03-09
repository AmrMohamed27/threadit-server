import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { Message } from "./Message";

@ObjectType()
export class Chat {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;

  @Field(() => Int)
  creatorId: number;

  @Field(() => Boolean)
  isGroupChat: boolean;

  @Field(() => User, { nullable: true })
  creator?: User;

  @Field(() => [Message], { nullable: true })
  messages?: Message[];

  @Field(() => [User], { nullable: true })
  participants?: User[];

  @Field(() => Int, { nullable: true })
  lastReadMessageId?: number;
}
