import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { connectDatabase } from "./database";
import { authRoutes } from "./routes/auth";

await connectDatabase();

const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    })
  )
  .use(authRoutes)
  .get("/health", () => ({ status: "ok" }))
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
