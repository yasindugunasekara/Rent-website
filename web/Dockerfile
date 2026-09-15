# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
# sharp needs these at runtime on alpine; libc6-compat helps native addons
# resolve correctly on musl.
RUN apk add --no-cache libc6-compat

# ---- deps: install with full devDependencies (needed to build) ----------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ---- builder: generate Prisma client, compile Next in standalone mode ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Only the client is needed at build time; the schema itself doesn't touch a
# real database.
RUN npx prisma generate
# Dummy values so `next build` (which loads next.config.mjs / lib/env.ts at
# module-eval time in a couple of places) doesn't fail for lack of runtime
# secrets — none of this is baked into the output; real values are supplied
# as container env vars at `next start` time via docker-compose.
ENV NODE_ENV=production \
    DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    REDIS_URL="redis://localhost:6379" \
    APP_ORIGIN="http://localhost:3000" \
    S3_ENDPOINT="http://localhost:9000" \
    S3_BUCKET="build" \
    S3_ACCESS_KEY="build" \
    S3_SECRET_KEY="build" \
    S3_PUBLIC_URL="http://localhost:9000/build" \
    EXCHANGE_RATE_API_KEY="build"
RUN npm run build

# ---- runner: minimal production image ------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Just the generated Prisma client + query engine binary — enough for the
# app to query the DB at runtime. The `migrate` compose service targets the
# `builder` stage instead (it has the full Prisma CLI + tsx for seeding).
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
