import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis, { RedisOptions } from "ioredis";
import { env } from "../env";

// Create Redis clients for pub & sub
const options: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  retryStrategy: (times) => Math.min(times * 50, 2000), // Retry on failure
};

const redisPub = new Redis(options);
const redisSub = new Redis(options);

redisSub.subscribe("NEW_MESSAGE", (err, count) => {
  if (err) console.error(err.message);
  console.log(`Subscribed to ${count} channels.`);
});

redisSub.on("message", (channel, _) => {
  console.log(`Received message from ${channel} channel.`);
});

export const redisRealPubSub = new RedisPubSub({
  publisher: redisPub,
  subscriber: redisSub,
});

// // Create a wrapper that extends PubSubEngine (the base class for type-graphql's PubSub)
// export class RedisPubSubAdapter extends PubSubEngine {
//   constructor(private pubSub: RedisPubSub) {
//     super();
//   }

//   async publish(triggerName: string, payload: any): Promise<void> {
//     await this.pubSub.publish(triggerName, payload);
//   }

//   async subscribe(
//     triggerName: string,
//     onMessage: (payload: any) => void
//   ): Promise<number> {
//     return this.pubSub.subscribe(triggerName, onMessage);
//   }

//   async unsubscribe(subId: number): Promise<void> {
//     await this.pubSub.unsubscribe(subId);
//   }
// }

// // Export an instance of our adapter
// export const redisPubSub = new RedisPubSubAdapter(redisRealPubSub);

// Define subscription topics/events
export enum SubscriptionTopics {
  NEW_MESSAGE = "NEW_MESSAGE",
  MESSAGE_UPDATED = "MESSAGE_UPDATED",
  MESSAGE_DELETED = "MESSAGE_DELETED",
  USER_TYPING = "USER_TYPING",
  USER_ONLINE_STATUS = "USER_ONLINE_STATUS",
}
