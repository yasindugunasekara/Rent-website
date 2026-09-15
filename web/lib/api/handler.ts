import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodType, ZodTypeDef } from "zod";
import { ApiError, fail } from "@/lib/api/response";
import { checkRateLimit, RATE_LIMITS, type RateLimitBucket } from "@/lib/api/rate-limit";
import { getSession, type SessionUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

// Input decoupled from Output (unlike the ZodSchema<T> alias, which forces
// Input === Output) so schemas that use .transform()/.coerce()/.default()
// — where the parsed input shape legitimately differs from the output shape
// — still let TypeScript infer TQuery/TBody correctly instead of falling
// back to a default generic.
type AnyZodSchema<T> = ZodType<T, ZodTypeDef, any>;

export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

interface RouteContext<TQuery, TBody, TParams> {
  req: NextRequest;
  query: TQuery;
  body: TBody;
  params: TParams;
  user: SessionUser | null;
}

interface RouteConfig<TQuery, TBody, TParams> {
  /** Validates `?search=...` query params. */
  query?: AnyZodSchema<TQuery>;
  /** Validates the JSON request body. Skipped for GET/DELETE by default. */
  body?: AnyZodSchema<TBody>;
  /** When true, a 401 is thrown before the handler runs if there's no session. */
  auth?: boolean;
  /** Redis sliding-window rate limit, keyed per request. */
  rateLimit?: {
    bucket: RateLimitBucket;
    /** Defaults to session user id, falling back to client IP. */
    identifier?: (ctx: {
      req: NextRequest;
      user: SessionUser | null;
      query: TQuery;
      body: TBody;
    }) => string;
  };
  handler: (ctx: RouteContext<TQuery, TBody, TParams>) => Promise<NextResponse>;
}

/**
 * Wraps a Next.js route handler with validation, auth, rate limiting, and
 * uniform error handling so every API route gets these for free instead of
 * a route author having to remember them individually.
 */
export function route<TQuery = undefined, TBody = undefined, TParams = Record<string, string>>(
  config: RouteConfig<TQuery, TBody, TParams>,
) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<TParams> } = { params: Promise.resolve({} as TParams) },
  ): Promise<NextResponse> => {
    try {
      const user = await getSession();

      if (config.auth && !user) {
        throw new ApiError("unauthorized", "Sign in required.");
      }

      let query = undefined as TQuery;
      if (config.query) {
        const raw = Object.fromEntries(new URL(req.url).searchParams.entries());
        query = config.query.parse(raw);
      }

      let body = undefined as TBody;
      if (config.body) {
        const raw = await req.json().catch(() => ({}));
        body = config.body.parse(raw);
      }

      // Every route gets the blanket per-IP "global" limit — this can't be
      // done in proxy.ts because it runs on the Edge runtime, which can't
      // use ioredis. Routes that need something stricter (login, register,
      // writes, uploads) layer their own bucket on top via config.rateLimit;
      // without one, "global" is still there so no route is accidentally
      // left completely unthrottled (e.g. the public GET /api/ads endpoints,
      // which had no limit in the old backend at all).
      const globalLimit = RATE_LIMITS.global;
      const globalResult = await checkRateLimit("global", clientIp(req), globalLimit.limit, globalLimit.windowSeconds);
      if (!globalResult.allowed) {
        const res = fail("rate_limited", "Too many requests. Please try again later.", {
          retryAfterSeconds: globalResult.retryAfterSeconds,
        });
        res.headers.set("Retry-After", String(globalResult.retryAfterSeconds));
        return res;
      }

      if (config.rateLimit) {
        const { bucket, identifier } = config.rateLimit;
        const id = identifier ? identifier({ req, user, query, body }) : (user?.id ?? clientIp(req));
        const { limit, windowSeconds } = RATE_LIMITS[bucket];
        const result = await checkRateLimit(bucket, id, limit, windowSeconds);
        if (!result.allowed) {
          const res = fail("rate_limited", "Too many requests. Please try again later.", {
            retryAfterSeconds: result.retryAfterSeconds,
          });
          res.headers.set("Retry-After", String(result.retryAfterSeconds));
          return res;
        }
      }

      const params = await ctx.params;

      return await config.handler({ req, query, body, params, user });
    } catch (err) {
      return handleRouteError(err, req);
    }
  };
}

function handleRouteError(err: unknown, req: NextRequest): NextResponse {
  if (err instanceof ApiError) {
    return fail(err.code, err.message, err.extra);
  }
  if (err instanceof ZodError) {
    return fail("validation_error", "Invalid request.", {
      issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  // Unknown/unexpected error: log the real detail server-side only, return a
  // generic message to the client. This is the fix for the old backend's
  // `Internal server error: {ex.Message}` leak.
  logger.error({ err, path: req.nextUrl.pathname, method: req.method }, "unhandled route error");
  return fail("internal_error", "Something went wrong. Please try again.");
}
