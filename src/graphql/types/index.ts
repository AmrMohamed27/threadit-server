
import { Request, Response } from "express";
import { db } from "src/database/db";

export interface MyContext {
  req: Request;
  res: Response;
  db: typeof db;
}
