import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { connectDatabase } from "./database";
import { authRoutes } from "./routes/auth";
import { subscriptionRoutes } from "./routes/subscriptions";

await connectDatabase();

const app = new Elysia()
  .use(
    cors({
      origin: true, // reflete o Origin da requisição (permite localhost:3000 em dev)
      credentials: true,
    })
  )
  .use(authRoutes)
  .use(subscriptionRoutes)
  .get("/health", () => ({ status: "ok" }))
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
