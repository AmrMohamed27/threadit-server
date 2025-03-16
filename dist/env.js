"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.__prod__ = exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string(),
    REDIS_SECRET: zod_1.z.string(),
    REDIS_HOST: zod_1.z.string(),
    REDIS_PORT: zod_1.z.string().transform((val) => parseInt(val)),
    REDIS_USERNAME: zod_1.z.string(),
    REDIS_PASSWORD: zod_1.z.string(),
    COOKIE_NAME: zod_1.z.string(),
    CORS_ORIGIN_FRONTEND: zod_1.z.string(),
    CORS_ORIGIN_BACKEND: zod_1.z.string(),
    NODE_ENV: zod_1.z.enum(["development", "production"]),
    GOOGLE_APP_PASSWORD: zod_1.z.string().length(16, {
        message: "Google app password should be exactly 16 letters",
    }),
    GOOGLE_APP_HOST: zod_1.z.string().email("Google app host should be a valid email"),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables!", parsedEnv.error.format());
    process.exit(1);
}
else {
    console.log("✅ Environment variables are valid!");
}
exports.env = parsedEnv.data;
exports.__prod__ = exports.env.NODE_ENV === "production";
//# sourceMappingURL=env.js.map