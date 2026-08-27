import { NextRequest, NextResponse } from "next/server";
import { parse as parseCookie } from "cookie";
import { COOKIE_NAME, decodeOAuthState, ONE_YEAR_MS, OAUTH_STATE_COOKIE } from "@shared/const";
import { upsertUser } from "@/server/db";
import { sdk } from "@/server/_core/sdk";
import { getPostLoginPath } from "@/lib/deployment/surface";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state) return NextResponse.json({ error: "code_and_state_required" }, { status: 400 });
  const decoded = decodeOAuthState(state);
  const expectedNonce = parseCookie(request.headers.get("cookie") ?? "")[OAUTH_STATE_COOKIE];
  const expectedRedirect = `${request.nextUrl.origin}/api/oauth/callback`;
  if (!decoded.nonce || decoded.nonce !== expectedNonce || decoded.redirectUri !== expectedRedirect) return NextResponse.json({ error: "invalid_oauth_state" }, { status: 403 });
  try {
    const token = await sdk.exchangeCodeForToken(code, state);
    const userInfo = await sdk.getUserInfo(token.accessToken);
    if (!userInfo.openId) return NextResponse.json({ error: "openid_missing" }, { status: 400 });
    await upsertUser({ openId: userInfo.openId, name: userInfo.name || null, email: userInfo.email ?? null, loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null, lastSignedIn: new Date() });
    const sessionToken = await sdk.createSessionToken(userInfo.openId, { name: userInfo.name || "", expiresInMs: ONE_YEAR_MS });
    const response = NextResponse.redirect(new URL(getPostLoginPath(), request.url));
    response.cookies.set(COOKIE_NAME, sessionToken, { httpOnly: true, path: "/", maxAge: ONE_YEAR_MS / 1000, sameSite: "none", secure: request.nextUrl.protocol === "https:" });
    response.cookies.set(OAUTH_STATE_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0, sameSite: "none", secure: request.nextUrl.protocol === "https:" });
    return response;
  } catch (error) {
    console.error("[OAuth] Next callback failed", error);
    return NextResponse.json({ error: "oauth_callback_failed" }, { status: 500 });
  }
}
