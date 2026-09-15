import { z } from "zod";
import { prisma } from "@/lib/db";
import { route } from "@/lib/api/handler";
import { ok, noContent, ApiError } from "@/lib/api/response";
import { parseIntParam } from "@/lib/api/params";
import { requireAdOwner } from "@/lib/auth/guard";
import { adUpdateSchema } from "@/lib/validation/ad";

type AdUpdateBody = z.infer<typeof adUpdateSchema>;
import { toAdWithPublisherDto } from "@/lib/dto/ad";
import { convertToUsd } from "@/lib/currency";
import { deleteObject, publicUrlFor } from "@/lib/storage";

// GET /api/ads/[id] — public single-ad view.
//
// Filters on `available = true`, which the old backend's GET /api/Ads/{id}
// did NOT do (AdsController.cs:158-161) — deactivated listings were publicly
// fetchable by id there. The publisher block here is the minimal, non-PII
// shape (see lib/dto/user.ts) instead of email/phone/location/bio.
export const GET = route<undefined, undefined, { id: string }>({
  async handler({ params }) {
    const id = parseIntParam(params.id);
    const ad = await prisma.ad.findFirst({
      where: { id, available: true },
      include: { images: true, publisher: true },
    });
    if (!ad) throw new ApiError("not_found", "Ad not found.");
    return ok(toAdWithPublisherDto(ad));
  },
});

// PATCH /api/ads/[id] — partial update, owner only.
export const PATCH = route<undefined, AdUpdateBody, { id: string }>({
  auth: true,
  body: adUpdateSchema,
  rateLimit: { bucket: "adWrite" },
  async handler({ user, body, params }) {
    const id = parseIntParam(params.id);
    await requireAdOwner(id, user!.id);

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.location !== undefined) data.location = body.location;
    if (body.latitude !== undefined) data.latitude = body.latitude;
    if (body.longitude !== undefined) data.longitude = body.longitude;
    if (body.category !== undefined) data.category = body.category;
    if (body.contactNumber !== undefined) data.contactNumber = body.contactNumber;
    if (body.available !== undefined) data.available = body.available;
    if (body.price !== undefined) {
      data.priceUsd = await convertToUsd(body.price, body.currency ?? "USD");
    }

    const ad = await prisma.$transaction(async (tx) => {
      if (body.images !== undefined) {
        // Reconcile by identity instead of the old backend's unconditional
        // delete-all-then-recreate (AdsController.cs:336-337), which churned
        // every image row's id on every edit. An incoming image is either an
        // existing row being kept (`id`, matched against this ad's current
        // images — an id from a *different* ad is simply ignored, not
        // reassigned) or a fresh upload (`key`, the storage object key).
        const existing = await tx.adImage.findMany({ where: { adId: id } });
        const existingById = new Map(existing.map((img) => [img.id, img]));

        const keepIds = new Set(
          body.images.map((i) => i.id).filter((v): v is number => v !== undefined),
        );
        const toRemove = existing.filter((img) => !keepIds.has(img.id));

        if (toRemove.length > 0) {
          await tx.adImage.deleteMany({ where: { id: { in: toRemove.map((i) => i.id) } } });
        }

        for (const [i, img] of body.images.entries()) {
          if (img.id !== undefined && existingById.has(img.id)) {
            await tx.adImage.update({ where: { id: img.id }, data: { sortOrder: i } });
          } else if (img.key !== undefined) {
            // As in POST /api/ads: the stored url is derived from the
            // verified upload key, never trusted from the client's `url`
            // field.
            await tx.adImage.create({
              data: { adId: id, url: publicUrlFor(img.key), storageKey: img.key, sortOrder: i },
            });
          }
          // An `id` that isn't one of this ad's own images is silently
          // dropped rather than adopted — it doesn't identify anything this
          // request is allowed to touch.
        }

        // Best-effort cleanup of the underlying objects for removed images;
        // failures here shouldn't fail the request.
        await Promise.allSettled(
          toRemove.filter((i) => i.storageKey).map((i) => deleteObject(i.storageKey!)),
        );
      }

      return tx.ad.update({
        where: { id },
        data,
        include: { images: true },
      });
    });

    return ok(ad);
  },
});

// DELETE /api/ads/[id] — owner only. Cascades AdImage rows in the DB and
// best-effort deletes their objects from storage.
export const DELETE = route<undefined, undefined, { id: string }>({
  auth: true,
  rateLimit: { bucket: "adWrite" },
  async handler({ user, params }) {
    const id = parseIntParam(params.id);
    const ad = await requireAdOwner(id, user!.id);
    void ad;

    const images = await prisma.adImage.findMany({ where: { adId: id } });
    await prisma.ad.delete({ where: { id } });
    await Promise.allSettled(
      images.filter((i) => i.storageKey).map((i) => deleteObject(i.storageKey!)),
    );

    return noContent();
  },
});
