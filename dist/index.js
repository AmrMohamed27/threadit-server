"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const schema_1 = require("./graphql/schema");
const express_session_1 = __importDefault(require("express-session"));
require("reflect-metadata");
const redis_1 = require("./redis");
const env_1 = require("./env");
const db_1 = require("./database/db");
const service_1 = require("./graphql/service");
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/use/ws");
const pubsub_1 = require("./redis/pubsub");
const uuid_1 = require("uuid");
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        process.on("SIGINT", () => {
            console.log("Shutting down...");
            if (pubsub_1.redisRealPubSub) {
                try {
                    const redisPublisher = pubsub_1.redisRealPubSub.publisher;
                    const redisSubscriber = pubsub_1.redisRealPubSub.subscriber;
                    if (redisPublisher)
                        redisPublisher.quit();
                    if (redisSubscriber)
                        redisSubscriber.quit();
                    console.log("Redis connections closed");
                }
                catch (err) {
                    console.error("Error closing Redis connections:", err);
                }
            }
            process.exit(0);
        });
        process.on("unhandledRejection", (reason, promise) => {
            console.error("Unhandled Rejection at:", promise, "reason:", reason);
        });
        const app = (0, express_1.default)();
        const httpServer = http_1.default.createServer(app);
        const wsServer = new ws_1.WebSocketServer({
            server: httpServer,
            path: "/graphql",
        });
        const schema = yield (0, schema_1.createSchema)();
        const serverCleanup = (0, ws_2.useServer)({
            schema,
            context: (ctx, _msg, _args) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                let userId = null;
                const authToken = (_a = ctx.connectionParams) === null || _a === void 0 ? void 0 : _a.authToken;
                if (authToken) {
                    try {
                        const userIdString = yield redis_1.redisClient.get(`ws:token:${authToken}`);
                        if (userIdString) {
                            userId = parseInt(userIdString, 10);
                        }
                    }
                    catch (err) {
                        console.error("Error validating WebSocket token:", err);
                    }
                }
                return {
                    redis: redis_1.redisClient,
                    db: db_1.db,
                    Services: service_1.Services,
                    pubSub: pubsub_1.redisRealPubSub,
                    req: {
                        session: {
                            userId,
                        },
                    },
                    res: {},
                };
            }),
        }, wsServer);
        const server = new server_1.ApolloServer({
            schema,
            plugins: [
                (0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
                {
                    serverWillStart() {
                        return __awaiter(this, void 0, void 0, function* () {
                            return {
                                drainServer() {
                                    return __awaiter(this, void 0, void 0, function* () {
                                        console.log("Shutting down WebSocket server...");
                                        yield serverCleanup.dispose();
                                        wsServer.close();
                                        console.log("WebSocket server closed.");
                                    });
                                },
                            };
                        });
                    },
                },
            ],
        });
        yield server.start();
        app.use("/graphql", (0, cors_1.default)({
            origin: [
                env_1.env.CORS_ORIGIN_FRONTEND,
                env_1.env.CORS_ORIGIN_BACKEND,
                "http://localhost:3000",
            ],
            credentials: true,
        }), (0, body_parser_1.json)(), (0, express_session_1.default)({
            name: env_1.env.COOKIE_NAME,
            store: redis_1.redisStore,
            resave: false,
            saveUninitialized: false,
            secret: env_1.env.REDIS_SECRET,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
                httpOnly: true,
                secure: false,
                sameSite: false,
            },
        }), (0, express4_1.expressMiddleware)(server, {
            context: (_a) => __awaiter(this, [_a], void 0, function* ({ req, res }) {
                return ({
                    req,
                    res,
                    redis: redis_1.redisClient,
                    Services: service_1.Services,
                    db: db_1.db,
                    pubSub: pubsub_1.redisRealPubSub,
                });
            }),
        }));
        app.get("/api/ws-auth", (0, cors_1.default)({
            origin: [
                env_1.env.CORS_ORIGIN_FRONTEND,
                env_1.env.CORS_ORIGIN_BACKEND,
                "http://localhost:3000",
            ],
            credentials: true,
        }), (0, body_parser_1.json)(), (0, express_session_1.default)({
            name: env_1.env.COOKIE_NAME,
            store: redis_1.redisStore,
            resave: false,
            saveUninitialized: false,
            secret: env_1.env.REDIS_SECRET,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
                httpOnly: true,
                secure: false,
                sameSite: false,
            },
        }), (req, res) => {
            if (!req.session.userId) {
                return res.status(401).json({ error: "Not authenticated" });
            }
            const token = (0, uuid_1.v4)();
            redis_1.redisClient.set(`ws:token:${token}`, String(req.session.userId), {
                EX: 300,
            });
            return res.json({ token });
        });
        httpServer.listen(4000, () => {
            console.log("🚀 GraphQL Server ready");
            console.log("📡 WebSocket Server ready");
        });
    });
}
startServer();
//# sourceMappingURL=index.js.map