import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { User } from "../models/user";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

function getGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.BACKEND_URL}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

async function exchangeCodeForTokens(
  code: string
): Promise<GoogleTokenResponse> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.BACKEND_URL}/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Falha ao trocar código por tokens do Google");
  }

  return response.json();
}

async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Falha ao obter informações do usuário do Google");
  }

  return response.json();
}

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
      exp: "7d",
    })
  )

  .get("/google", ({ redirect }) => {
    return redirect(getGoogleAuthUrl());
  })

  .get(
    "/google/callback",
    async ({ query, jwt, redirect, set }) => {
      try {
        const { code } = query;

        const tokens = await exchangeCodeForTokens(code);
        const googleUser = await getGoogleUserInfo(tokens.access_token);

        const user = await User.findOneAndUpdate(
          { googleId: googleUser.id },
          {
            googleId: googleUser.id,
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
          },
          { upsert: true, new: true }
        );

        const token = await jwt.sign({
          sub: user._id!.toString(),
          email: user.email,
        });

        const frontendUrl = new URL(
          "/auth/callback",
          process.env.FRONTEND_URL!
        );
        frontendUrl.searchParams.set("token", token);

        return redirect(frontendUrl.toString());
      } catch (error) {
        console.error("Erro no callback do Google:", error);

        return redirect(
          `${process.env.FRONTEND_URL}?error=auth_failed`
        );
      }
    },
    {
      query: t.Object({
        code: t.String(),
      }),
    }
  )

  .get("/me", async ({ headers, jwt, set }) => {
    const authHeader = headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Token não fornecido" };
    }

    const token = authHeader.slice(7);
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: "Token inválido" };
    }

    const user = await User.findById(payload.sub).select("-__v");

    if (!user) {
      set.status = 404;
      return { error: "Usuário não encontrado" };
    }

    return { user };
  });
