import { env } from "./src/env";
import { defineConfig } from "drizzle-kit";

console.log("🛠️ DATABASE_URL:", env.DATABASE_URL); // Debugging

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./drizzle", // Where migrations will be stored
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
