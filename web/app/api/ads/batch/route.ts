import { prisma } from "@/lib/db";
import { route } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { adBatchQuerySchema } from "@/lib/validation/ad";
import { toAdDto } from "@/lib/dto/ad";

// GET /api/ads/batch?ids=1,2,3 — used to hydrate bookmarks and prune ids of
// ads that were deleted or made unavailable. Public, only returns available
// ads (same rule as the list endpoint).
export const GET = route({
  query: adBatchQuerySchema,
  async handler({ query }) {
    const ads = await prisma.ad.findMany({
      where: { id: { in: query.ids }, available: true },
      include: { images: true },
    });
    return ok({ items: ads.map((a) => toAdDto(a)) });
  },
});
