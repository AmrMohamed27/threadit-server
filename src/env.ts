import "dotenv/config";
import { z } from "zod";

// Define a schema for env variables
const envSchema = z.object({
  DATABASE_URL: z.string(),
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
