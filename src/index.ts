import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { json } from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { createSchema } from "./graphql/schema";
import session from "express-session";
import "reflect-metadata";
import { redisClient, redisStore } from "./redis";
import { __prod__, env } from "./env";
import { db } from "./database/db";
import { MyContext } from "./types/resolvers";
import { Services } from "./graphql/service";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { redisRealPubSub } from "./redis/pubsub";
import { v4 as uuidv4 } from "uuid";

// Start Apollo Server
export async function startServer() {
  process.on("SIGINT", () => {
    console.log("Shutting down...");

    // Close Redis connections
    if (redisRealPubSub) {
      try {
        // Access the underlying Redis clients and quit them
        const redisPublisher = (redisRealPubSub as any).publisher;
        const redisSubscriber = (redisRealPubSub as any).subscriber;

        if (redisPublisher) redisPublisher.quit();
        if (redisSubscriber) redisSubscriber.quit();

        console.log("Redis connections closed");
      } catch (err) {
        console.error("Error closing Redis connections:", err);
      }
    }

    process.exit(0);
  });
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });
  // Create Express App
  const app = express();
  const httpServer = http.createServer(app);

  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });
  // Create TypeGraphQL Schema
  const schema = await createSchema();

  // Hand in the schema we just created and have the
  // WebSocketServer start listening.
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx, _msg, _args) => {
        let userId = null;

        // Get token from connection params
        const authToken = ctx.connectionParams?.authToken as string;

        if (authToken) {
          try {
            // Look up user ID by token
            const userIdString = await redisClient.get(`ws:token:${authToken}`);

            if (userIdString) {
              userId = parseInt(userIdString, 10);
            }
          } catch (err) {
            console.error("Error validating WebSocket token:", err);
          }
        }
        return {
          redis: redisClient,
          db,
          Services,
          pubSub: redisRealPubSub,
          req: {
            session: {
              userId,
            },
          },
          res: {},
        };
      },
    },
    wsServer
  );
  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      // Graceful shutdown support for the http server
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for the WebSocket server.
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
      origin: [env.CORS_ORIGIN_FRONTEND, env.CORS_ORIGIN_BACKEND],
      credentials: true,
    }), // Enable CORS
    json(), // Parse JSON bodies
    // Redis session middleware
    session({
      name: env.COOKIE_NAME,
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // only save session when data exists
      secret: env.REDIS_SECRET,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // cookie valid for 10 years
        httpOnly: true,
        secure: __prod__,
        sameSite: false,
      },
    }),
    // Apollo Middleware
    expressMiddleware(server, {
      context: async ({ req, res }): Promise<MyContext> => ({
        req,
        res,
        redis: redisClient,
        Services: Services,
        db,
        pubSub: redisRealPubSub,
      }),
    })
  );

  // Authentication endpoint for websockets connection
  app.get(
    "/api/ws-auth",
    cors({
      origin: [env.CORS_ORIGIN_FRONTEND, env.CORS_ORIGIN_BACKEND],
      credentials: true,
    }), // Enable CORS
    json(), // Parse JSON bodies
    // Redis session middleware
    session({
      name: env.COOKIE_NAME,
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // only save session when data exists
      secret: env.REDIS_SECRET,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // cookie valid for 10 years
        httpOnly: true,
        secure: __prod__,
        sameSite: false,
      },
    }),
    (req, res) => {
      // Only generate token if user is logged in
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Generate a unique token
      const token = uuidv4();

      // Store in Redis with user ID and short expiration
      redisClient.set(`ws:token:${token}`, String(req.session.userId), {
        EX: 300,
      }); // 5 minutes

      return res.json({ token });
    }
  );

  // Start Express Server
  httpServer.listen(4000, () => {
    console.log("🚀 GraphQL Server ready");
    console.log("📡 WebSocket Server ready");
  });
}

startServer();
