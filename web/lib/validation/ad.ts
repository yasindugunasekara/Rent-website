import { z } from "zod";
import {
  text,
  latitude,
  longitude,
  categorySlug,
  contactNumber,
  currencyCode,
  pagination,
} from "@/lib/validation/common";

// An image is either an existing one being kept (`id`, the AdImage row id —
// from a prior GET of this ad) or a freshly uploaded one (`key`, the storage
// object key from POST /api/uploads). Exactly one of the two identifies it;
// `url` is always sent for display but the server never trusts a client-
// supplied url for a *new* image's storage location — only `key` is used to
// build/verify that.
const imageInput = z
  .object({
    id: z.coerce.number().int().positive().optional(),
    key: z.string().trim().min(1).max(512).optional(),
    url: z.string().trim().url().max(512),
  })
  .strict()
  .refine((v) => v.id !== undefined || v.key !== undefined, {
    message: "Each image needs an id (existing) or a key (newly uploaded).",
  });

export const adCreateSchema = z
  .object({
    title: text(150),
    description: text(5000),
    price: z.number().positive().max(999_999_999),
    location: text(255),
    latitude: latitude.optional(),
    longitude: longitude.optional(),
    category: categorySlug,
    contactNumber,
    available: z.boolean().default(true),
    currency: currencyCode.default("USD"),
    images: z.array(imageInput).max(8).default([]),
  })
  .strict();

export const adUpdateSchema = adCreateSchema.partial().strict();

export const availabilitySchema = z.object({ available: z.boolean() }).strict();

export const adListQuerySchema = z
  .object({
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    search: z.string().trim().max(200).optional(),
    category: categorySlug.optional(),
    locationFilter: z.string().trim().max(255).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    currency: currencyCode.default("USD"),
  })
  .merge(pagination);

export const adBatchQuerySchema = z.object({
  ids: z
    .string()
    .trim()
    .min(1)
    .max(2000)
    .transform((s) =>
      s
        .split(",")
        .map((v) => Number.parseInt(v.trim(), 10))
        .filter((n) => Number.isInteger(n) && n > 0),
    )
    .refine((arr) => arr.length > 0 && arr.length <= 100, {
      message: "Provide between 1 and 100 ids.",
    }),
});

export type AdCreateInput = z.infer<typeof adCreateSchema>;
export type AdUpdateInput = z.infer<typeof adUpdateSchema>;
