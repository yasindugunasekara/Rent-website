-- Defense-in-depth DB-level constraints that mirror the Zod validation in
-- lib/validation/ad.ts. App-level checks can be bypassed by a bug or a
-- direct DB write; these can't.
ALTER TABLE "ads"
  ADD CONSTRAINT "ads_price_usd_nonnegative" CHECK ("priceUsd" >= 0),
  ADD CONSTRAINT "ads_latitude_range" CHECK ("latitude" IS NULL OR ("latitude" >= -90 AND "latitude" <= 90)),
  ADD CONSTRAINT "ads_longitude_range" CHECK ("longitude" IS NULL OR ("longitude" >= -180 AND "longitude" <= 180));

-- Trigram GIN indexes so the ILIKE '%term%' search in GET /api/ads (title,
-- description, category, location) uses an index scan instead of a
-- sequential scan over the whole table — the old backend's four
-- `.ToLower().Contains()` filters (AdsController.cs:48-66) always did a full
-- scan, with no index able to help a leading-wildcard LIKE.
CREATE INDEX "ads_title_trgm_idx" ON "ads" USING GIN (lower("title") gin_trgm_ops);
CREATE INDEX "ads_description_trgm_idx" ON "ads" USING GIN (lower("description") gin_trgm_ops);
CREATE INDEX "ads_location_trgm_idx" ON "ads" USING GIN (lower("location") gin_trgm_ops);
