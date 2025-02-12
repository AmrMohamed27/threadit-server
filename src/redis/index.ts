import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import { env } from "../env";

// Initialize client.
export const redisClient = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
});

// Handle Redis errors
redisClient.on("error", (err) => console.error("Redis error:", err));
// Connect to Redis
redisClient.connect().catch(console.error);

// Initialize store.
export const redisStore = new RedisStore({
  client: redisClient,
  prefix: "session:",
  disableTouch: true,
});
