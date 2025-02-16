import { Request, Response } from "express";
import { db } from "src/database/db";
import { redisClient } from "src/redis";

export interface MyContext {
  req: Request;
  res: Response;
  db: typeof db;
  redis: typeof redisClient;
}
