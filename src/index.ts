import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { json } from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { createSchema } from "./graphql/schema";
import "reflect-metadata";
import { redisClient } from "./redis";
import { __prod__, env } from "./env";
import { db } from "./database/db";
import { MyContext } from "./types/resolvers";
import { Services } from "./graphql/service";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { redisRealPubSub } from "./redis/pubsub";
import jwt from "jsonwebtoken";

// Start Apollo Server
export async function startServer() {
  process.on("SIGINT", () => {
    console.log("Shutting down...");
    process.exit(0);
  });

  // Create Express App
  const app = express();
  const httpServer = http.createServer(app);

  // Create TypeGraphQL Schema
  const schema = await createSchema();

  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  // WebSocket authentication
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        let userId = null;
        const authHeader = ctx.connectionParams?.Authorization as string;

        if (authHeader?.startsWith("Bearer ")) {
          const token = authHeader.split(" ")[1];
          try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as {
              userId: number;
            };
            userId = decoded.userId;
          } catch (err) {
            console.error("Invalid WebSocket token:", err);
          }
        }

        return {
          userId,
          redis: redisClient,
          db,
          Services,
          pubSub: redisRealPubSub,
        };
      },
    },
    wsServer
  );

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              console.log("Shutting down WebSocket server...");
              await serverCleanup.dispose();
              wsServer.close();
              console.log("WebSocket server closed.");
            },
          };
        },
      },
    ],
  });

  await server.start();

  // Apply Apollo Middleware
  app.use(
    "/graphql",
    cors({
      origin: [
        env.CORS_ORIGIN_FRONTEND,
        env.CORS_ORIGIN_BACKEND,
        env.CORS_ORIGIN_PROXY,
        "http://localhost:3000",
      ],
      credentials: true,
    }),
    json(),
    expressMiddleware(server, {
      context: async ({ req, res }): Promise<MyContext> => {
        const authHeader = req.headers.authorization;
        let userId;

        if (authHeader?.startsWith("Bearer ")) {
          const token = authHeader.split(" ")[1];
          try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as {
              userId: number;
            };
            userId = decoded.userId;
          } catch (error) {
            console.error("Invalid JWT:", error);
          }
        }

        return {
          userId,
          req,
          res,
          redis: redisClient,
          Services,
          db,
          pubSub: redisRealPubSub,
        };
      },
    })
  );

  app.get("/ping", (_, res) => {
    res.status(200).send("OK");
  });

  // Start Express Server
  httpServer.listen(4000, () => {
    console.log("🚀 GraphQL Server ready");
    console.log("📡 WebSocket Server ready");
  });
}

startServer();
