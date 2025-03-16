import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

if (!env) {
  console.log("❌ Missing environment variables!");
} else {
  console.log("🛠️ DATABASE_URL:", env.DATABASE_URL);
}

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./drizzle", // Where migrations will be stored
  dialect: "postgresql",
  dbCredentials: {
    url: env?.DATABASE_URL ?? "",
  },
});
