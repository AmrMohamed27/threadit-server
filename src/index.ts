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
import { Services } from "./service";

// Start Apollo Server
export async function startServer() {
  // Create Express App
  const app = express();
  const httpServer = http.createServer(app);

  // Create TypeGraphQL Schema
  const schema = await createSchema();

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })], // Graceful shutdown support
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
        maxAge: 1000 * 60 * 60 * 24, // cookie valid for 1 day
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
      }),
    })
  );

  // Start Express Server
  httpServer.listen(4000, () => {
    console.log("🚀 GraphQL Server ready at http://localhost:4000/graphql");
  });
}

startServer();
