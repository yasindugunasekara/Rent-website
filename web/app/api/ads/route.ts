import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { route } from "@/lib/api/handler";
import { ok, created, ApiError } from "@/lib/api/response";
import { adListQuerySchema, adCreateSchema } from "@/lib/validation/ad";
import { toAdDto } from "@/lib/dto/ad";
import { haversineSqlExpression } from "@/lib/geo";
import { convertToUsd } from "@/lib/currency";
import { publicUrlFor } from "@/lib/storage";

// GET /api/ads — public search/browse feed.
//
// Filtering, price-currency conversion, distance sort, and pagination all
// happen as one indexed SQL query (WHERE + ORDER BY + LIMIT/OFFSET) instead
// of the old backend's `ToListAsync()` that loaded every matching row into
// memory before paginating (AdsController.cs:80,110-113) with no cap on
// `limit`. `limit` here is hard-clamped to 50 by adListQuerySchema.
export const GET = route({
  query: adListQuerySchema,
  async handler({ query }) {
    const hasCoords = query.lat !== undefined && query.lng !== undefined;
    const offset = (query.page - 1) * query.limit;

    const conditions: Prisma.Sql[] = [Prisma.sql`"available" = true`];

    if (query.search) {
      const like = `%${query.search.toLowerCase()}%`;
      conditions.push(Prisma.sql`(
        lower("title") LIKE ${like} OR
        lower("description") LIKE ${like} OR
        lower("category") LIKE ${like} OR
        lower("location") LIKE ${like}
      )`);
    }
    if (query.category) {
      conditions.push(Prisma.sql`lower("category") = ${query.category}`);
    }
    if (query.locationFilter) {
      conditions.push(Prisma.sql`lower("location") LIKE ${"%" + query.locationFilter.toLowerCase() + "%"}`);
    }
    if (query.minPrice !== undefined) {
      const minUsd = await convertToUsd(query.minPrice, query.currency);
      conditions.push(Prisma.sql`"priceUsd" >= ${minUsd}`);
    }
    if (query.maxPrice !== undefined) {
      const maxUsd = await convertToUsd(query.maxPrice, query.currency);
      conditions.push(Prisma.sql`"priceUsd" <= ${maxUsd}`);
    }

    const whereClause = Prisma.join(conditions, " AND ");
    const orderClause = hasCoords
      ? Prisma.sql`ORDER BY distance_km ASC NULLS LAST`
      : Prisma.sql`ORDER BY "createdAt" DESC`;
    const distanceSelect = hasCoords
      ? Prisma.sql`${haversineSqlExpression(query.lat!, query.lng!)} AS distance_km`
      : Prisma.sql`NULL::float AS distance_km`;

    // Fetch one extra row to know if there's a next page without a second
    // COUNT(*) query.
    const rows = await prisma.$queryRaw<{ id: number; distance_km: number | null }[]>(Prisma.sql`
      SELECT "id", ${distanceSelect}
      FROM "ads"
      WHERE ${whereClause}
      ${orderClause}
      LIMIT ${query.limit + 1} OFFSET ${offset}
    `);

    const hasMore = rows.length > query.limit;
    const page = rows.slice(0, query.limit);
    const distanceById = new Map(page.map((r) => [r.id, r.distance_km]));

    const ads = await prisma.ad.findMany({
      where: { id: { in: page.map((r) => r.id) } },
      include: { images: true },
    });
    const byId = new Map(ads.map((a) => [a.id, a]));

    // Re-apply the SQL-determined order — findMany's `in` filter doesn't
    // preserve it.
    const ordered = page
      .map((r) => byId.get(r.id))
      .filter((a): a is NonNullable<typeof a> => a !== undefined)
      .map((a) => toAdDto({ ...a, distanceKm: distanceById.get(a.id) }));

    return ok({ items: ordered, page: query.page, hasMore });
  },
});

// POST /api/ads — create an ad for the signed-in publisher.
export const POST = route({
  auth: true,
  body: adCreateSchema,
  rateLimit: { bucket: "adWrite" },
  async handler({ user, body }) {
    const priceUsd = await convertToUsd(body.price, body.currency);

    // Every image on a brand-new ad must be a fresh upload (`key`) — there
    // are no existing AdImage rows to reference by `id` yet. And critically,
    // the stored `url` is derived from the verified upload key here, never
    // taken from the client's `url` field: trusting a client-supplied url
    // would let anyone store an arbitrary external URL as if it were a
    // vetted upload (the same class of gap as the old backend's unvalidated
    // `ImageUrls`).
    if (body.images.some((img) => !img.key)) {
      throw new ApiError("bad_request", "New ads can only reference freshly uploaded images.");
    }

    const ad = await prisma.ad.create({
      data: {
        title: body.title,
        description: body.description,
        priceUsd,
        location: body.location,
        latitude: body.latitude,
        longitude: body.longitude,
        category: body.category,
        contactNumber: body.contactNumber,
        available: body.available,
        // Ownership comes from the session, never the request body — a
        // client cannot create an ad on someone else's behalf by sending a
        // publisherId field (that field doesn't even exist in the schema).
        publisherId: user!.id,
        images: {
          create: body.images.map((img, i) => ({
            url: publicUrlFor(img.key!),
            storageKey: img.key,
            sortOrder: i,
          })),
        },
      },
      include: { images: true },
    });

    return created(toAdDto(ad));
  },
});
