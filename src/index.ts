import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { json } from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { createSchema } from "./graphql/schema";
import "reflect-metadata";

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
    cors(), // Enable CORS
    json(), // Parse JSON bodies
    expressMiddleware(server)
  );

  // Start Express Server
  httpServer.listen(4000, () => {
    console.log("🚀 GraphQL Server ready at http://localhost:4000/graphql");
  });
}

startServer();
