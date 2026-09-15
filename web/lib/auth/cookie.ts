// Split out from session.ts (which pulls in next/headers + Prisma) so
// middleware.ts — which runs in the Edge runtime and can't use either — can
// know the session cookie's name for a lightweight presence check.
const isProd = process.env.NODE_ENV === "production";

// __Host- prefix requires Secure, Path=/, no Domain — the strictest cookie
// binding available, which is why it's reserved for production (HTTPS-only).
export const SESSION_COOKIE_NAME = isProd
  ? "__Host-session"
  : (process.env.SESSION_COOKIE_NAME ?? "session");
