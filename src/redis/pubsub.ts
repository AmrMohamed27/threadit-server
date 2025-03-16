import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis, { RedisOptions } from "ioredis";
import { env } from "../env";

// Create Redis clients for pub & sub
const options: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000), // Retry on failure
};

const redisPub = new Redis(options);
const redisSub = new Redis(options);

export const redisRealPubSub = new RedisPubSub({
  publisher: redisPub,
  subscriber: redisSub,
});

// Define subscription topics/events
export enum SubscriptionTopics {
  NEW_MESSAGE = "NEW_MESSAGE",
  MESSAGE_UPDATED = "MESSAGE_UPDATED",
  MESSAGE_DELETED = "MESSAGE_DELETED",
  USER_TYPING = "USER_TYPING",
  USER_ONLINE_STATUS = "USER_ONLINE_STATUS",
  NEW_CHAT = "NEW_CHAT",
  CHAT_UPDATED = "CHAT_UPDATED",
  CHAT_DELETED = "CHAT_DELETED",
  CHAT_PARTICIPANT_ADDED = "CHAT_PARTICIPANT_ADDED",
  CHAT_PARTICIPANT_REMOVED = "CHAT_PARTICIPANT_REMOVED",
  NEW_REPLY_NOTIFICATION = "NEW_REPLY_NOTIFICATION",
  POST_ACTIVITY_NOTIFICATION = "POST_ACTIVITY_NOTIFICATION",
  DIRECT_MESSAGE_NOTIFICATION = "DIRECT_MESSAGE_NOTIFICATION",
}


