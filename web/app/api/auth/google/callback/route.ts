import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { createSession } from "@/lib/auth/session";
import {
  exchangeGoogleCode,
  decodeGoogleIdToken,
  GoogleOAuthError,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
} from "@/lib/auth/google";
import { logger } from "@/lib/logger";

function redirectToLogin(origin: string, error: string) {
  const res = NextResponse.redirect(new URL(`/login?error=${error}`, origin));
  res.cookies.delete(GOOGLE_STATE_COOKIE);
  res.cookies.delete(GOOGLE_VERIFIER_COOKIE);
  return res;
}

export async function GET(req: NextRequest) {
  const env = getEnv();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = req.cookies.get(GOOGLE_STATE_COOKIE)?.value;
  const codeVerifier = req.cookies.get(GOOGLE_VERIFIER_COOKIE)?.value;

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    return redirectToLogin(env.APP_ORIGIN, "invalid_oauth_state");
  }

  try {
    const tokens = await exchangeGoogleCode(code, codeVerifier);
    const claims = decodeGoogleIdToken(tokens.id_token);

    if (!claims.email_verified) {
      return redirectToLogin(env.APP_ORIGIN, "google_email_unverified");
    }

    // Look up strictly by the provider's stable account id — never by email.
    // This is the fix for the old backend silently converting a password
    // account to Google auth for anyone who controls that email at Google.
    const existingLink = await prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider: "google", providerAccountId: claims.sub } },
    });

    let userId: string;

    if (existingLink) {
      userId = existingLink.userId;
    } else {
      const existingUserByEmail = await prisma.user.findUnique({ where: { email: claims.email } });

      if (existingUserByEmail) {
        // Email matches an existing account (password or a different Google
        // sub) that isn't linked to this Google identity. Do not auto-link —
        // require an explicit, authenticated link step instead.
        return redirectToLogin(env.APP_ORIGIN, "email_in_use");
      }

      const createdUser = await prisma.user.create({
        data: {
          email: claims.email,
          firstName: claims.given_name ?? "Google",
          lastName: claims.family_name ?? "User",
          profilePicUrl: claims.picture,
          emailVerified: true,
          oauthAccounts: {
            create: { provider: "google", providerAccountId: claims.sub },
          },
        },
      });
      userId = createdUser.id;
    }

    await createSession(userId);
    const res = NextResponse.redirect(new URL("/dashboard", env.APP_ORIGIN));
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    res.cookies.delete(GOOGLE_VERIFIER_COOKIE);
    return res;
  } catch (err) {
    if (err instanceof GoogleOAuthError) {
      logger.warn({ err: err.message }, "google oauth exchange failed");
      return redirectToLogin(env.APP_ORIGIN, "google_auth_failed");
    }
    logger.error({ err }, "google oauth callback error");
    return redirectToLogin(env.APP_ORIGIN, "google_auth_failed");
  }
}
