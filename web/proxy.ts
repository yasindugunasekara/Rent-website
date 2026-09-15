import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookie";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Runs in the Edge runtime, so it can only do cheap checks — no Prisma, no
 * DB session lookup:
 *
 * 1. A soft redirect for `/dashboard/*` when the session cookie is entirely
 *    absent (pure UX; real enforcement is `requireUser()`/`auth: true` in
 *    the dashboard layout and every API route, which do hit the DB).
 * 2. CSRF defense-in-depth for mutating `/api/*` requests: reject unless the
 *    Origin (or Referer, if Origin is absent) matches this app's own
 *    origin. `SameSite=Lax` on the session cookie already blocks most
 *    cross-site form/script submissions; this catches the rest.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const hasCookie = req.cookies.has(SESSION_COOKIE_NAME);
    if (!hasCookie) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/api/") && MUTATING_METHODS.has(req.method)) {
    const secFetchSite = req.headers.get("sec-fetch-site");
    if (secFetchSite === "cross-site") {
      return NextResponse.json(
        { error: { code: "forbidden", message: "Cross-site request rejected." } },
        { status: 403 },
      );
    }

    // Compared against the request's own Host header, not req.nextUrl.origin:
    // in the standalone Docker image, Next's self-reported origin resolves
    // to the HOSTNAME env var used for binding (0.0.0.0), not the origin the
    // browser actually sees — comparing full origins against that rejected
    // every same-origin request. Host-header comparison sidesteps the whole
    // "what does Next think its own origin is" problem. Scheme isn't part of
    // the comparison (Host has none); that's fine for CSRF purposes — the
    // threat is a *different site* issuing the request, not http-vs-https
    // on the same host.
    const host = req.headers.get("host");
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const sourceHost = origin ? new URL(origin).host : referer ? new URL(referer).host : null;

    if (sourceHost && sourceHost !== host) {
      return NextResponse.json(
        { error: { code: "forbidden", message: "Cross-origin request rejected." } },
        { status: 403 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
