import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api/response";
import { getSession, type SessionUser } from "@/lib/auth/session";

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new ApiError("unauthorized", "Sign in required.");
  return user;
}

export function requireRole(user: SessionUser, role: SessionUser["role"]): void {
  if (user.role !== role) throw new ApiError("forbidden", "Not allowed.");
}

/**
 * Loads an ad and asserts the given user owns it. Returns 404 (not 403) for
 * someone else's ad, so ownership of an ad id can't be probed by comparing
 * 403 vs 404 responses.
 */
export async function requireAdOwner(adId: number, userId: string) {
  const ad = await prisma.ad.findUnique({ where: { id: adId } });
  if (!ad || ad.publisherId !== userId) {
    throw new ApiError("not_found", "Ad not found.");
  }
  return ad;
}
