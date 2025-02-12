import "dotenv/config";
import { z } from "zod";

// Define a schema for env variables
const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_SECRET: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform((val) => parseInt(val)),
  COOKIE_NAME: z.string(),
  NODE_ENV: z.enum(["development", "production"]),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables!", parsedEnv.error.format());
  process.exit(1); // Exit if env vars are missing or incorrect
} else {
  console.log("✅ Environment variables are valid!");
}

export const env = parsedEnv.data;

export const __prod__ = env.NODE_ENV === "production";
