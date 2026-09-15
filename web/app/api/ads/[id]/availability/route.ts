import { prisma } from "@/lib/db";
import { route } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { parseIntParam } from "@/lib/api/params";
import { requireAdOwner } from "@/lib/auth/guard";
import { availabilitySchema } from "@/lib/validation/ad";
import { toMineDto } from "@/lib/dto/ad";

// PATCH /api/ads/[id]/availability — a dedicated toggle. Replaces the old
// dashboard's pattern of sending a full PUT with every field just to flip
// `available` (publisher-dashboard/lib/DashboardContext.js:227-262), which
// round-tripped the whole ad and happened to omit `currency`.
export const PATCH = route<undefined, { available: boolean }, { id: string }>({
  auth: true,
  body: availabilitySchema,
  rateLimit: { bucket: "adWrite" },
  async handler({ user, body, params }) {
    const id = parseIntParam(params.id);
    await requireAdOwner(id, user!.id);

    const ad = await prisma.ad.update({
      where: { id },
      data: { available: body.available },
      include: { images: true },
    });

    return ok(toMineDto(ad));
  },
});
