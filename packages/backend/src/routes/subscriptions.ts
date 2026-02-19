import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { Subscription } from "../models/Subscription";

export const subscriptionRoutes = new Elysia({ prefix: "/subscriptions" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
      exp: "7d",
    })
  )
  .get("/", async ({ headers, jwt, set }) => {
    const authHeader = headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Token não fornecido" };
    }

    const token = authHeader.slice(7);
    let payload: { sub?: string } | null = null;
    try {
      payload = await jwt.verify(token);
    } catch {
      set.status = 401;
      return { error: "Token inválido" };
    }
    if (!payload) {
      set.status = 401;
      return { error: "Token inválido" };
    }

    const subscriptions = await Subscription.find({ userId: payload.sub })
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    return { subscriptions };
  })
  .post(
    "/",
    async ({ headers, jwt, body, set }) => {
      const authHeader = headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Token não fornecido" };
      }

      const token = authHeader.slice(7);
      let payload: { sub?: string } | null = null;
      try {
        payload = await jwt.verify(token);
      } catch {
        set.status = 401;
        return { error: "Token inválido" };
      }
      if (!payload) {
        set.status = 401;
        return { error: "Token inválido" };
      }

      const subscription = await Subscription.create({
        userId: payload.sub,
        nome: body.nome,
        diaRenovacao: body.diaRenovacao,
        preco: body.preco,
        recorrencia: body.recorrencia,
        logoUrl: body.logoUrl ?? "",
        mesInicio: body.mesInicio ?? 1,
      });

      const { __v, ...sub } = subscription.toObject();
      return { subscription: sub };
    },
    {
      body: t.Object({
        nome: t.String(),
        diaRenovacao: t.String(),
        preco: t.String(),
        recorrencia: t.UnionEnum(["mensal", "trimestral", "semestral", "anual"]),
        logoUrl: t.Optional(t.String()),
        mesInicio: t.Optional(t.Number()),
      }),
    }
  )
  .delete(
    "/:id",
    async ({ headers, jwt, params, set }) => {
      const authHeader = headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Token não fornecido" };
      }

      const token = authHeader.slice(7);
      let payload: { sub?: string } | null = null;
      try {
        payload = await jwt.verify(token);
      } catch {
        set.status = 401;
        return { error: "Token inválido" };
      }
      if (!payload) {
        set.status = 401;
        return { error: "Token inválido" };
      }

      const result = await Subscription.findOneAndDelete({
        _id: params.id,
        userId: payload.sub,
      });

      if (!result) {
        set.status = 404;
        return { error: "Assinatura não encontrada" };
      }

      return { ok: true };
    },
    { params: t.Object({ id: t.String() }) }
  );
