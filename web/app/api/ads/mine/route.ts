import { prisma } from "@/lib/db";
import { route } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { pagination } from "@/lib/validation/common";
import { toMineDto } from "@/lib/dto/ad";

// GET /api/ads/mine — the publisher's own ads, available or not. Returns a
// mapped DTO (not the raw Prisma row) unlike the old backend's `/my-ads`,
// which returned the full `Ad` entity including internal fields.
export const GET = route({
  query: pagination,
  auth: true,
  async handler({ user, query }) {
    const ads = await prisma.ad.findMany({
      where: { publisherId: user!.id },
      include: { images: true },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return ok({ items: ads.map(toMineDto) });
  },
});
