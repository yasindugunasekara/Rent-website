import { randomBytes, createHash } from "crypto";
import { getEnv } from "@/lib/env";

// Hand-rolled Google OAuth 2.0 Authorization Code + PKCE flow (RFC 6749,
// RFC 7636), rather than a library: the obvious candidate (`arctic`) is
// marked "no longer supported" on npm for both its major versions, and
// pulling an unmaintained dependency into the security-critical login path
// of a project whose whole point is fixing security issues would be
// self-defeating. The flow is ~5 small functions; not worth the dependency.

export const GOOGLE_STATE_COOKIE = "g_oauth_state";
export const GOOGLE_VERIFIER_COOKIE = "g_oauth_verifier";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

function base64url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function generateState(): string {
  return base64url(randomBytes(32));
}

export function generateCodeVerifier(): string {
  return base64url(randomBytes(32)); // 43 chars, within RFC 7636's 43-128 range
}

function codeChallengeS256(verifier: string): string {
  return base64url(createHash("sha256").update(verifier).digest());
}

function redirectUri(appOrigin: string): string {
  return `${appOrigin}/api/auth/google/callback`;
}

export function buildGoogleAuthorizationUrl(state: string, codeVerifier: string): URL {
  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID) throw new Error("Google OAuth is not configured.");

  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri(env.APP_ORIGIN));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallengeS256(codeVerifier));
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("access_type", "online");
  return url;
}

export class GoogleOAuthError extends Error {}

interface GoogleTokenResponse {
  id_token: string;
  access_token: string;
  expires_in: number;
  token_type: string;
}

export async function exchangeGoogleCode(
  code: string,
  codeVerifier: string,
): Promise<GoogleTokenResponse> {
  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth is not configured.");
  }

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri(env.APP_ORIGIN),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new GoogleOAuthError(`Google token exchange failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  return res.json();
}

export interface GoogleIdTokenClaims {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

/**
 * Decodes (without re-verifying the signature) the ID token payload. This is
 * safe here specifically because the token was obtained by our server
 * exchanging an authorization code directly with Google's token endpoint
 * over TLS, authenticated with our client secret (RFC 6749 §4.1.3) — it
 * never passed through the browser, unlike the old backend's flow where the
 * client posted a bare `idToken` that had to be cryptographically verified
 * because it could have come from anywhere. `iss`/`aud` are still checked as
 * cheap defense in depth against a token-confusion bug.
 */
export function decodeGoogleIdToken(idToken: string): GoogleIdTokenClaims {
  const parts = idToken.split(".");
  const payloadPart = parts[1];
  if (parts.length !== 3 || !payloadPart) throw new GoogleOAuthError("Malformed ID token.");
  const claims = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as GoogleIdTokenClaims;

  const env = getEnv();
  if (claims.iss !== "https://accounts.google.com" && claims.iss !== "accounts.google.com") {
    throw new GoogleOAuthError("Unexpected ID token issuer.");
  }
  if (claims.aud !== env.GOOGLE_CLIENT_ID) {
    throw new GoogleOAuthError("Unexpected ID token audience.");
  }
  return claims;
}
