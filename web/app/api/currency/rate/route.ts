import { z } from "zod";
import { route } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { currencyCode } from "@/lib/validation/common";
import { getExchangeRate } from "@/lib/currency";

const querySchema = z.object({ to: currencyCode });

export const GET = route({
  query: querySchema,
  async handler({ query }) {
    const { rate, stale } = await getExchangeRate(query.to);
    return ok({ rate, stale });
  },
});
