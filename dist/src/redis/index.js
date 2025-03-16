"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisStore = exports.redisClient = void 0;
const connect_redis_1 = require("connect-redis");
const redis_1 = require("redis");
const env_1 = require("../env");
exports.redisClient = (0, redis_1.createClient)({
    socket: {
        host: env_1.env.REDIS_HOST,
        port: env_1.env.REDIS_PORT,
    },
});
exports.redisClient.on("error", (err) => console.error("Redis error:", err));
exports.redisClient.connect().catch(console.error);
exports.redisStore = new connect_redis_1.RedisStore({
    client: exports.redisClient,
    prefix: "session:",
    disableTouch: true,
});
//# sourceMappingURL=index.js.map