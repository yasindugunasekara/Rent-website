import { redis } from "@/lib/redis";
import { getEnv } from "@/lib/env";
import { ApiError } from "@/lib/api/response";
import { logger } from "@/lib/logger";

const RATE_CACHE_TTL_SECONDS = 60 * 60; // 1h
const CODES_CACHE_TTL_SECONDS = 24 * 60 * 60; // 24h

interface CurrencyEntry {
  code: string;
  name: string;
}

/**
 * Server-only client for exchangerate-api.com. The API key never leaves the
 * server (it was previously embedded in appsettings.json and reachable only
 * from the backend, which is preserved here — the difference is this file
 * cannot be imported from a client component, so a bundler mistake can't leak
 * it either).
 *
 * Unlike the old backend's ConvertToUsd (which swallowed failures and
 * returned the un-converted amount, silently corrupting prices), every
 * failure here throws — callers must handle it explicitly.
 */

async function fetchSupportedCodes(): Promise<CurrencyEntry[]> {
  const cached = await redis.get("currency:codes").catch(() => null);
  if (cached) return JSON.parse(cached);

  const { EXCHANGE_RATE_API_KEY } = getEnv();
  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/codes`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    logger.error({ status: res.status }, "exchange rate codes fetch failed");
    throw new ApiError("internal_error", "Currency service is temporarily unavailable.");
  }
  const data = await res.json();
  if (data.result !== "success" || !Array.isArray(data.supported_codes)) {
    throw new ApiError("internal_error", "Currency service returned an unexpected response.");
  }
  const codes: CurrencyEntry[] = data.supported_codes.map(([code, name]: [string, string]) => ({
    code,
    name,
  }));

  await redis.set("currency:codes", JSON.stringify(codes), "EX", CODES_CACHE_TTL_SECONDS).catch(() => {});
  return codes;
}

export async function getSupportedCurrencies(): Promise<CurrencyEntry[]> {
  return fetchSupportedCodes();
}

async function assertValidCurrency(code: string): Promise<void> {
  if (code === "USD") return;
  const codes = await fetchSupportedCodes();
  if (!codes.some((c) => c.code === code)) {
    throw new ApiError("bad_request", `Unsupported currency code: ${code}`);
  }
}

/** USD -> `to` conversion rate, validated and cached. */
export async function getExchangeRate(to: string): Promise<number> {
  await assertValidCurrency(to);
  if (to === "USD") return 1;

  const cacheKey = `currency:rate:USD:${to}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return Number.parseFloat(cached);

  const { EXCHANGE_RATE_API_KEY } = getEnv();
  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/pair/USD/${encodeURIComponent(to)}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    logger.error({ status: res.status, to }, "exchange rate pair fetch failed");
    throw new ApiError("internal_error", "Currency service is temporarily unavailable.");
  }
  const data = await res.json();
  if (data.result !== "success" || typeof data.conversion_rate !== "number") {
    throw new ApiError("internal_error", "Currency service returned an unexpected response.");
  }

  await redis.set(cacheKey, String(data.conversion_rate), "EX", RATE_CACHE_TTL_SECONDS).catch(() => {});
  return data.conversion_rate;
}

/** Converts an amount in `from` currency to USD. Throws rather than silently
 * passing through the raw amount on failure — see file header. */
export async function convertToUsd(amount: number, from: string): Promise<number> {
  if (from === "USD") return amount;
  const rate = await getExchangeRate(from); // USD -> from
  if (rate <= 0) {
    throw new ApiError("internal_error", "Currency service returned an invalid rate.");
  }
  return amount / rate;
}
