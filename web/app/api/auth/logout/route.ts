import { route } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { destroySession } from "@/lib/auth/session";

export const POST = route({
  async handler() {
    await destroySession();
    return ok({ message: "Signed out." });
  },
});
