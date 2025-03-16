import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../env";
import postgres from "postgres";
import * as schema from "../database/schema";

// Drizzle ORM instance
const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle(client, { schema });
