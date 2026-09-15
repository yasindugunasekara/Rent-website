import { randomBytes, createHash } from "crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import { isProd } from "@/lib/env";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookie";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days absolute
const IDLE_REFRESH_MS = 24 * 60 * 60 * 1000; // refresh lastUsedAt at most once/day

export { SESSION_COOKIE_NAME };

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "PUBLISHER" | "ADMIN";
  preferredCurrency: string;
  profilePicUrl: string | null;
}

async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function createSession(userId: string): Promise<void> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  let ip: string | null = null;
  let userAgent: string | null = null;
  try {
    const h = await headers();
    ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    userAgent = h.get("user-agent");
  } catch {
    // headers() is unavailable outside a request context (e.g. tests); fine.
  }

  await prisma.session.create({
    data: { tokenHash, userId, expiresAt, ip, userAgent: userAgent?.slice(0, 255) },
  });

  await setSessionCookie(token, expiresAt);
}

/**
 * Reads the session for the current request, cached per-request so repeated
 * calls (layout + page + multiple components) hit the DB once. Deletes the
 * row on read if it has expired.
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  if (Date.now() - session.lastUsedAt.getTime() > IDLE_REFRESH_MS) {
    await prisma.session
      .update({ where: { id: session.id }, data: { lastUsedAt: new Date() } })
      .catch(() => {});
  }

  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    preferredCurrency: user.preferredCurrency,
    profilePicUrl: user.profilePicUrl,
  };
});

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.delete({ where: { tokenHash: hashToken(token) } }).catch(() => {});
  }
  store.delete(SESSION_COOKIE_NAME);
}

/** Revokes every session for a user — used on password change and email change. */
export async function destroyAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}
