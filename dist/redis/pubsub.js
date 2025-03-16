"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionTopics = exports.redisRealPubSub = void 0;
const graphql_redis_subscriptions_1 = require("graphql-redis-subscriptions");
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../env");
const options = {
    host: env_1.env.REDIS_HOST,
    port: env_1.env.REDIS_PORT,
    username: env_1.env.REDIS_USERNAME,
    password: env_1.env.REDIS_PASSWORD,
    retryStrategy: (times) => Math.min(times * 50, 2000),
};
const redisPub = new ioredis_1.default(options);
const redisSub = new ioredis_1.default(options);
exports.redisRealPubSub = new graphql_redis_subscriptions_1.RedisPubSub({
    publisher: redisPub,
    subscriber: redisSub,
});
var SubscriptionTopics;
(function (SubscriptionTopics) {
    SubscriptionTopics["NEW_MESSAGE"] = "NEW_MESSAGE";
    SubscriptionTopics["MESSAGE_UPDATED"] = "MESSAGE_UPDATED";
    SubscriptionTopics["MESSAGE_DELETED"] = "MESSAGE_DELETED";
    SubscriptionTopics["USER_TYPING"] = "USER_TYPING";
    SubscriptionTopics["USER_ONLINE_STATUS"] = "USER_ONLINE_STATUS";
    SubscriptionTopics["NEW_CHAT"] = "NEW_CHAT";
    SubscriptionTopics["CHAT_UPDATED"] = "CHAT_UPDATED";
    SubscriptionTopics["CHAT_DELETED"] = "CHAT_DELETED";
    SubscriptionTopics["CHAT_PARTICIPANT_ADDED"] = "CHAT_PARTICIPANT_ADDED";
    SubscriptionTopics["CHAT_PARTICIPANT_REMOVED"] = "CHAT_PARTICIPANT_REMOVED";
    SubscriptionTopics["NEW_REPLY_NOTIFICATION"] = "NEW_REPLY_NOTIFICATION";
    SubscriptionTopics["POST_ACTIVITY_NOTIFICATION"] = "POST_ACTIVITY_NOTIFICATION";
    SubscriptionTopics["DIRECT_MESSAGE_NOTIFICATION"] = "DIRECT_MESSAGE_NOTIFICATION";
})(SubscriptionTopics || (exports.SubscriptionTopics = SubscriptionTopics = {}));
//# sourceMappingURL=pubsub.js.map