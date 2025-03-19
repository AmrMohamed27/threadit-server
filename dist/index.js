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
require("reflect-metadata");
const redis_1 = require("./redis");
const env_1 = require("./env");
const db_1 = require("./database/db");
const service_1 = require("./graphql/service");
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/use/ws");
const pubsub_1 = require("./redis/pubsub");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        process.on("SIGINT", () => {
            console.log("Shutting down...");
            process.exit(0);
        });
        const app = (0, express_1.default)();
        const httpServer = http_1.default.createServer(app);
        const schema = yield (0, schema_1.createSchema)();
        const wsServer = new ws_1.WebSocketServer({
            server: httpServer,
            path: "/graphql",
        });
        const serverCleanup = (0, ws_2.useServer)({
            schema,
            context: (ctx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                let userId = null;
                const authHeader = (_a = ctx.connectionParams) === null || _a === void 0 ? void 0 : _a.Authorization;
                if (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer ")) {
                    const token = authHeader.split(" ")[1];
                    try {
                        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
                        userId = decoded.userId;
                    }
                    catch (err) {
                        console.error("Invalid WebSocket token:", err);
                    }
                }
                return {
                    userId,
                    redis: redis_1.redisClient,
                    db: db_1.db,
                    Services: service_1.Services,
                    pubSub: pubsub_1.redisRealPubSub,
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
                env_1.env.CORS_ORIGIN_PROXY,
                "http://localhost:3000",
            ],
            credentials: true,
        }), (0, body_parser_1.json)(), (0, express4_1.expressMiddleware)(server, {
            context: (_a) => __awaiter(this, [_a], void 0, function* ({ req, res }) {
                const authHeader = req.headers.authorization;
                console.log("Auth Header: ", authHeader);
                let userId;
                if (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer ")) {
                    const token = authHeader.split(" ")[1];
                    try {
                        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
                        userId = decoded.userId;
                    }
                    catch (error) {
                        console.error("Invalid JWT:", error);
                    }
                }
                return {
                    userId,
                    req,
                    res,
                    redis: redis_1.redisClient,
                    Services: service_1.Services,
                    db: db_1.db,
                    pubSub: pubsub_1.redisRealPubSub,
                };
            }),
        }));
        app.get("/ping", (_, res) => {
            res.status(200).send("OK");
        });
        httpServer.listen(4000, () => {
            console.log("🚀 GraphQL Server ready");
            console.log("📡 WebSocket Server ready");
        });
    });
}
startServer();
//# sourceMappingURL=index.js.map