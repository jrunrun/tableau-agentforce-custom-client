import fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import path from "node:path";
import fastifyStatic from "@fastify/static";
import messagingRoutes from "./routes.js";

dotenv.config();

const PORT = parseInt(process.env.PORT || "8080", 10);
const HOST = process.env.HOST || "0.0.0.0";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";

const server = fastify({
  logger: true,
});

async function start() {
  try {
    await server.register(fastifyStatic, {
      root: path.join(process.cwd(), "dist"),
      prefix: "/",
    });

    await server.register(cors, {
      origin: [ALLOWED_ORIGIN],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
        "x-conversation-id",
      ],
      exposedHeaders: ["*"],
      maxAge: 86400,
    });

    await server.register(messagingRoutes, { prefix: "/api" });

    server.setNotFoundHandler((request, reply) => {
      return reply.sendFile("index.html");
    });

    await server.listen({ port: PORT, host: HOST });
    console.log(`Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
