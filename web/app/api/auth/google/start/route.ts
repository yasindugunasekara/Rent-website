import { NextRequest, NextResponse } from "next/server";
import {
  generateState,
  generateCodeVerifier,
  buildGoogleAuthorizationUrl,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
} from "@/lib/auth/google";
import { getEnv } from "@/lib/env";

const COOKIE_MAX_AGE_SECONDS = 10 * 60; // 10 minutes is plenty for a login round trip

export async function GET(_req: NextRequest) {
  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", env.APP_ORIGIN));
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = buildGoogleAuthorizationUrl(state, codeVerifier);

  const res = NextResponse.redirect(url);
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
  res.cookies.set(GOOGLE_STATE_COOKIE, state, cookieOpts);
  res.cookies.set(GOOGLE_VERIFIER_COOKIE, codeVerifier, cookieOpts);
  return res;
}
