import { redis } from "@/lib/redis";
import { getEnv } from "@/lib/env";
import { ApiError } from "@/lib/api/response";
import { logger } from "@/lib/logger";
import { FALLBACK_CURRENCIES } from "@/lib/currencies";

const RATE_CACHE_TTL_SECONDS = 60 * 60; // 1h — fresh
const RATE_STALE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7d — "last known good", served on outage
const CODES_CACHE_TTL_SECONDS = 24 * 60 * 60; // 24h — fresh
const CODES_STALE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7d — "last known good"

interface CurrencyEntry {
  code: string;
  name: string;
}

/**
 * Server-only client for exchangerate-api.com. The API key never leaves the
 * server and cannot be imported from a client component.
 *
 * Resilience strategy (three tiers, cheapest/freshest first):
 *   1. Fresh Redis cache (1h for rates, 24h for the code list).
 *   2. A long-lived "last known good" Redis copy (7d), written alongside
 *      every successful live fetch, read when the live call fails.
 *   3. For the currency *list* only: the static FALLBACK_CURRENCIES bundled
 *      in the app (lib/currencies.ts) — no network or cache dependency at
 *      all, so the list is never truly empty even on a box that has never
 *      once reached the upstream API.
 *
 * Unlike the old backend's ConvertToUsd (which swallowed failures and
 * returned the un-converted amount, silently corrupting prices), a genuine
 * failure with nothing cached at any tier still throws — callers must
 * handle it. What's different from before this file is that "genuine
 * failure" now only means the very first request ever, before any tier has
 * a value to fall back to; after that, a transient outage degrades to a
 * slightly stale rate instead of erroring everywhere (including ad
 * pricing). A stale rate drifts by at most a few hours/days of normal
 * market movement — not the same class of bug as silently treating a
 * foreign amount as USD.
 */

interface CachedCodes {
  codes: CurrencyEntry[];
  stale: boolean;
}

async function fetchSupportedCodes(): Promise<CachedCodes> {
  const fresh = await redis.get("currency:codes").catch(() => null);
  if (fresh) return { codes: JSON.parse(fresh), stale: false };

  const { EXCHANGE_RATE_API_KEY } = getEnv();
  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/codes`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`upstream status ${res.status}`);
    const data = await res.json();
    if (data.result !== "success" || !Array.isArray(data.supported_codes)) {
      throw new Error("unexpected response shape");
    }
    const codes: CurrencyEntry[] = data.supported_codes.map(([code, name]: [string, string]) => ({
      code,
      name,
    }));

    await Promise.all([
      redis.set("currency:codes", JSON.stringify(codes), "EX", CODES_CACHE_TTL_SECONDS).catch(() => {}),
      redis.set("currency:codes:stale", JSON.stringify(codes), "EX", CODES_STALE_TTL_SECONDS).catch(() => {}),
    ]);
    return { codes, stale: false };
  } catch (err) {
    logger.error({ err }, "exchange rate codes fetch failed, trying stale/fallback tiers");

    const stale = await redis.get("currency:codes:stale").catch(() => null);
    if (stale) return { codes: JSON.parse(stale), stale: true };

    // No cache at any tier has ever been populated (e.g. first boot with a
    // bad key) — the bundled static list keeps the UI functional. It's not
    // marked `stale` in the sense of "outdated data"; it's the app's own
    // baseline, not a decaying cache entry.
    return { codes: FALLBACK_CURRENCIES, stale: false };
  }
}

export async function getSupportedCurrencies(): Promise<CurrencyEntry[]> {
  const { codes } = await fetchSupportedCodes();
  return codes;
}

async function assertValidCurrency(code: string): Promise<void> {
  if (code === "USD") return;
  const { codes } = await fetchSupportedCodes();
  if (!codes.some((c) => c.code === code)) {
    throw new ApiError("bad_request", `Unsupported currency code: ${code}`);
  }
}

interface RateResult {
  rate: number;
  stale: boolean;
}

/** USD -> `to` conversion rate, validated and cached with stale-on-failure fallback. */
export async function getExchangeRate(to: string): Promise<RateResult> {
  await assertValidCurrency(to);
  if (to === "USD") return { rate: 1, stale: false };

  const cacheKey = `currency:rate:USD:${to}`;
  const staleKey = `${cacheKey}:stale`;

  const fresh = await redis.get(cacheKey).catch(() => null);
  if (fresh) return { rate: Number.parseFloat(fresh), stale: false };

  const { EXCHANGE_RATE_API_KEY } = getEnv();
  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/pair/USD/${encodeURIComponent(to)}`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(`upstream status ${res.status}`);
    const data = await res.json();
    if (data.result !== "success" || typeof data.conversion_rate !== "number") {
      throw new Error("unexpected response shape");
    }

    await Promise.all([
      redis.set(cacheKey, String(data.conversion_rate), "EX", RATE_CACHE_TTL_SECONDS).catch(() => {}),
      redis.set(staleKey, String(data.conversion_rate), "EX", RATE_STALE_TTL_SECONDS).catch(() => {}),
    ]);
    return { rate: data.conversion_rate, stale: false };
  } catch (err) {
    logger.error({ err, to }, "exchange rate pair fetch failed, trying stale cache");

    const stale = await redis.get(staleKey).catch(() => null);
    if (stale) return { rate: Number.parseFloat(stale), stale: true };

    // Unlike the currency list, there's no sensible static fallback for an
    // actual conversion rate — fabricating one would be exactly the old
    // backend's bug. Only reachable if this pair has never once succeeded.
    throw new ApiError("internal_error", "Currency service is temporarily unavailable.");
  }
}

/** Converts an amount in `from` currency to USD. Throws rather than silently
 * passing through the raw amount on failure — see file header. */
export async function convertToUsd(amount: number, from: string): Promise<number> {
  if (from === "USD") return amount;
  const { rate } = await getExchangeRate(from); // USD -> from
  if (rate <= 0) {
    throw new ApiError("internal_error", "Currency service returned an invalid rate.");
  }
  return amount / rate;
}
