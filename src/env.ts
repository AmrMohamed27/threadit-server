import "dotenv/config";
import { z } from "zod";

// Define a schema for env variables
const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_SECRET: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform((val) => parseInt(val)),
  COOKIE_NAME: z.string(),
  CORS_ORIGIN_FRONTEND: z.string(),
  CORS_ORIGIN_BACKEND: z.string(),
  NODE_ENV: z.enum(["development", "production"]),
  GOOGLE_APP_PASSWORD: z.string().length(16, {
    message: "Google app password should be exactly 16 letters",
  }),
  GOOGLE_APP_HOST: z.string().email("Google app host should be a valid email"),
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
