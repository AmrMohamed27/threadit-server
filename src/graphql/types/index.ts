import { Request, Response } from "express";
import { db } from "src/database/db";
import { redisClient } from "src/redis";
import { ObjectType, Field } from "type-graphql";

export interface MyContext {
  req: Request;
  res: Response;
  db: typeof db;
  redis: typeof redisClient;
}
// Error Type

@ObjectType()
export class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}
@ObjectType()
export class ConfirmResponse {
  @Field(() => Boolean)
  success: boolean;
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
