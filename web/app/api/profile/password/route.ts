import { prisma } from "@/lib/db";
import { route } from "@/lib/api/handler";
import { ok, ApiError } from "@/lib/api/response";
import { passwordChangeSchema } from "@/lib/validation/user";
import { hashPassword, verifyPassword, burnPasswordVerifyTime } from "@/lib/auth/password";
import { destroyAllUserSessions, createSession } from "@/lib/auth/session";

// POST /api/profile/password — actually changes the password. The old
// dashboard's ProfileForm collected currentPassword/newPassword but
// DashboardContext.updateProfile silently dropped them (never sent to the
// backend); this endpoint is what that form should have been calling.
export const POST = route({
  auth: true,
  body: passwordChangeSchema,
  rateLimit: { bucket: "passwordChange" },
  async handler({ user, body }) {
    const full = await prisma.user.findUniqueOrThrow({ where: { id: user!.id } });

    if (!full.passwordHash) {
      throw new ApiError(
        "bad_request",
        "This account signs in with Google and has no password to change.",
      );
    }

    const valid = await verifyPassword(full.passwordHash, body.currentPassword);
    if (!valid) {
      await burnPasswordVerifyTime();
      throw new ApiError("unauthorized", "Current password is incorrect.");
    }

    const newHash = await hashPassword(body.newPassword);
    await prisma.user.update({ where: { id: user!.id }, data: { passwordHash: newHash } });

    // A stolen session cookie shouldn't survive a password change — revoke
    // every session and re-issue only this browser's.
    await destroyAllUserSessions(user!.id);
    await createSession(user!.id);

    return ok({ message: "Password changed." });
  },
});
