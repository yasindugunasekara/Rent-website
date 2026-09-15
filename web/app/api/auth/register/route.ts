import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { route } from "@/lib/api/handler";
import { created } from "@/lib/api/response";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/validation/user";

export const POST = route({
  body: registerSchema,
  rateLimit: { bucket: "register" },
  async handler({ body }) {
    // Password is hashed unconditionally, before the uniqueness check, so
    // the response time doesn't reveal whether the email was already taken.
    const passwordHash = await hashPassword(body.password);

    try {
      await prisma.user.create({
        data: {
          email: body.email,
          passwordHash,
          firstName: body.firstName,
          lastName: body.lastName,
        },
      });
    } catch (err) {
      // P2002 = unique constraint violation on email. Swallowed deliberately:
      // returning the same response whether or not the account already
      // existed removes the registration-time user-enumeration oracle the
      // old backend had ("User with this email already exists.").
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) {
        throw err;
      }
    }

    return created({
      message: "If this email isn't already registered, an account has been created. You can now sign in.",
    });
  },
});
