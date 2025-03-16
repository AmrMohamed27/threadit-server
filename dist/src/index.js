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
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        const httpServer = http_1.default.createServer(app);
        const schema = yield (0, schema_1.createSchema)();
        const server = new server_1.ApolloServer({
            schema,
            plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
        });
        yield server.start();
        app.use("/graphql", (0, cors_1.default)({
            origin: [env_1.env.CORS_ORIGIN_FRONTEND, env_1.env.CORS_ORIGIN_BACKEND],
            credentials: true,
        }), (0, body_parser_1.json)(), (0, express_session_1.default)({
            name: env_1.env.COOKIE_NAME,
            store: redis_1.redisStore,
            resave: false,
            saveUninitialized: false,
            secret: env_1.env.REDIS_SECRET,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
                secure: env_1.__prod__,
                sameSite: false,
            },
        }), (0, express4_1.expressMiddleware)(server, {
            context: (_a) => __awaiter(this, [_a], void 0, function* ({ req, res }) {
                return ({
                    req,
                    res,
                    db: db_1.db,
                    redis: redis_1.redisClient,
                });
            }),
        }));
        httpServer.listen(4000, () => {
            console.log("🚀 GraphQL Server ready at http://localhost:4000/graphql");
        });
    });
}
startServer();
//# sourceMappingURL=index.js.map