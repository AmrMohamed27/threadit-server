import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../env";
import * as schema from "./schema";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// Drizzle ORM instance
export const db = drizzle(pool, { schema });
