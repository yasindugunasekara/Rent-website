import { route } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";

export const GET = route({
  async handler({ user }) {
    return ok({ user });
  },
});
