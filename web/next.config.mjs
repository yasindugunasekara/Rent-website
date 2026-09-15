/** @type {import('next').NextConfig} */

const imageHosts = (process.env.IMAGE_REMOTE_HOSTS ?? "localhost,minio,127.0.0.1")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy. connect-src/img-src are widened with the configured
// image hosts so the MinIO-backed image host works in both dev and prod.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  `img-src 'self' data: blob: https: ${imageHosts.map((h) => `http://${h}:*`).join(" ")}`,
  "font-src 'self' data:",
  // Next.js dev mode needs 'unsafe-eval' for HMR/refresh; drop it in production.
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=(), payment=()" },
  { key: "Content-Security-Policy", value: csp },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: imageHosts.map((hostname) => ({ protocol: "http", hostname })),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
