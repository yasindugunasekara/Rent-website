import { prisma } from "@/lib/db";
import { route } from "@/lib/api/handler";
import { ok, ApiError } from "@/lib/api/response";
import { profileUpdateSchema } from "@/lib/validation/user";
import { toProfileDto } from "@/lib/dto/user";
import { destroyAllUserSessions, createSession } from "@/lib/auth/session";

export const GET = route({
  auth: true,
  async handler({ user }) {
    const full = await prisma.user.findUniqueOrThrow({ where: { id: user!.id } });
    return ok(toProfileDto(full));
  },
});

export const PATCH = route({
  auth: true,
  body: profileUpdateSchema,
  async handler({ user, body }) {
    const current = await prisma.user.findUniqueOrThrow({ where: { id: user!.id } });
    const emailChanged = body.email !== current.email;

    if (emailChanged) {
      const taken = await prisma.user.findUnique({ where: { email: body.email } });
      if (taken) throw new ApiError("conflict", "Email is already taken.");
    }

    const updated = await prisma.user.update({
      where: { id: user!.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        location: body.location,
        bio: body.bio,
        profilePicUrl: body.profilePicUrl,
        preferredCurrency: body.preferredCurrency ?? current.preferredCurrency,
        // An email change invalidates the identity the session was issued
        // for, so it must be re-verified before it's trusted again.
        emailVerified: emailChanged ? false : current.emailVerified,
      },
    });

    if (emailChanged) {
      // Revoke every session (including this one) and issue a fresh one for
      // the current browser, so any other logged-in device is signed out.
      await destroyAllUserSessions(user!.id);
      await createSession(updated.id);
    }

    return ok(toProfileDto(updated));
  },
});
