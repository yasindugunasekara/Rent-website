import { prisma } from "@/lib/db";
import { route, clientIp } from "@/lib/api/handler";
import { ok, ApiError } from "@/lib/api/response";
import { verifyPassword, burnPasswordVerifyTime } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/user";
import { toSessionUserDto } from "@/lib/dto/user";

const INVALID_CREDENTIALS = "Invalid email or password.";

export const POST = route({
  body: loginSchema,
  rateLimit: {
    bucket: "login",
    // Per IP+email, so a single attacker can't lock out someone else's
    // account by hammering their email from many IPs, and can't bypass the
    // limit by rotating email guesses from one IP.
    identifier: ({ req, body }) => `${clientIp(req)}:${body.email}`,
  },
  async handler({ body }) {
    const user = await prisma.user.findUnique({ where: { email: body.email } });

    if (!user || !user.passwordHash) {
      // No account, or a Google-only account with no password set: burn the
      // same time a real verification would take, then respond identically
      // to a wrong password so login timing can't be used to enumerate
      // accounts or discover which auth method they used.
      await burnPasswordVerifyTime();
      throw new ApiError("unauthorized", INVALID_CREDENTIALS);
    }

    const valid = await verifyPassword(user.passwordHash, body.password);
    if (!valid) {
      throw new ApiError("unauthorized", INVALID_CREDENTIALS);
    }

    await createSession(user.id);
    return ok(toSessionUserDto(user));
  },
});
