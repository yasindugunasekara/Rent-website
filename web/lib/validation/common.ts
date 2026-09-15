import { z } from "zod";

/** Trimmed, non-empty string with a max length — the base for most text fields. */
export const text = (max: number, min = 1) => z.string().trim().min(min).max(max);

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

export const email = z.string().trim().toLowerCase().email().max(255);

// 12+ chars, at least one letter and one digit. Not a full zxcvbn strength
// check, but a real floor above the old backend's bare MinLength(6).
export const password = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(256)
  .regex(/[A-Za-z]/, "Password must contain a letter.")
  .regex(/[0-9]/, "Password must contain a number.");

export const latitude = z.number().min(-90).max(90);
export const longitude = z.number().min(-180).max(180);

// Category is a free-taxonomy slug in the current UI (not a fixed enum), so
// it's constrained to a safe shape instead of an allowlist: lowercase,
// alphanumeric + hyphen, 2-40 chars. Blocks garbage/injection-shaped input
// without hardcoding a category list that the frontend doesn't actually use.
export const categorySlug = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9-]+$/, "Invalid category.");

export const contactNumber = z
  .string()
  .trim()
  .min(6)
  .max(25)
  .regex(/^[0-9+\-().\s]+$/, "Invalid contact number.");

// ISO-4217-shaped (3 uppercase letters); the actual allowlist check against
// currencies the exchange-rate API supports happens in lib/currency.ts.
export const currencyCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Invalid currency code.");

export const pagination = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
