import { route } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { getSupportedCurrencies } from "@/lib/currency";

export const GET = route({
  async handler() {
    const codes = await getSupportedCurrencies();
    return ok(codes);
  },
});
