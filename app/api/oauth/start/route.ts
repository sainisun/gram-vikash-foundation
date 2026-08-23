import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { encodeOAuthState, OAUTH_STATE_COOKIE } from "@shared/const";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.searchParams.get("origin");
  if (!origin || new URL(origin).origin !== request.nextUrl.origin) return NextResponse.json({ error: "invalid_origin" }, { status: 400 });
  const portal = process.env.VITE_OAUTH_PORTAL_URL;
  const appId = process.env.VITE_APP_ID;
  if (!portal || !appId) return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  const nonce = randomUUID();
  const redirectUri = `${origin}/api/oauth/callback`;
  const state = encodeOAuthState({ redirectUri, nonce });
  const target = new URL(`${portal}/app-auth`);
  target.searchParams.set("appId", appId);
  target.searchParams.set("redirectUri", redirectUri);
  target.searchParams.set("state", state);
  target.searchParams.set("type", "signIn");
  const response = NextResponse.redirect(target);
  response.cookies.set(OAUTH_STATE_COOKIE, nonce, { httpOnly: true, path: "/", maxAge: 600, sameSite: "none", secure: origin.startsWith("https://") });
  return response;
}
