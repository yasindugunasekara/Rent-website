import { redis } from "@/lib/redis";

/**
 * Redis-backed sliding-window rate limiter. Uses a sorted set per key: each
 * call adds the current timestamp as a member, trims anything outside the
 * window, and counts what's left — all inside one Lua script so the
 * check-and-increment is atomic across concurrent requests/replicas.
 */
const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]

redis.call("ZREMRANGEBYSCORE", key, 0, now - window_ms)
local count = redis.call("ZCARD", key)

if count >= limit then
  local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")
  local retryAfterMs = window_ms
  if oldest[2] ~= nil then
    retryAfterMs = window_ms - (now - tonumber(oldest[2]))
  end
  return {0, retryAfterMs}
end

redis.call("ZADD", key, now, member)
redis.call("PEXPIRE", key, window_ms)
return {1, 0}
`;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export async function checkRateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const key = `rl:${bucket}:${identifier}`;
  const now = Date.now();
  const member = `${now}:${Math.random().toString(36).slice(2, 8)}`;

  try {
    const [allowed, retryAfterMs] = (await redis.eval(
      SLIDING_WINDOW_SCRIPT,
      1,
      key,
      now,
      windowSeconds * 1000,
      limit,
      member,
    )) as [number, number];

    return { allowed: allowed === 1, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  } catch (err) {
    // Fail open on Redis outage rather than taking the whole API down, but
    // log loudly — a persistent failure here silently disables rate limiting.
    console.error(`[rate-limit] redis error for bucket "${bucket}":`, err);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/** Named buckets so every call site agrees on the same limits. */
export const RATE_LIMITS = {
  login: { limit: 5, windowSeconds: 15 * 60 },
  register: { limit: 3, windowSeconds: 60 * 60 },
  passwordChange: { limit: 5, windowSeconds: 60 * 60 },
  adWrite: { limit: 30, windowSeconds: 60 * 60 },
  upload: { limit: 20, windowSeconds: 60 * 60 },
  global: { limit: 300, windowSeconds: 60 },
} as const;

export type RateLimitBucket = keyof typeof RATE_LIMITS;
