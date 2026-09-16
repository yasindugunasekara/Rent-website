# Rent Website

A rental marketplace: browse and list items for rent. Originally a Next.js
frontend + separate publisher dashboard talking to an ASP.NET Core backend;
now a single Next.js app (`web/`) with the backend implemented as Next API
routes, backed by Postgres, Redis, and MinIO — all runnable with one
`docker compose up`.

The old `backend/` (ASP.NET Core), `User-frontend/`, and `publisher-dashboard/`
directories have been removed now that `web/` is verified — see "Migrated
from a .NET backend" below for what to do about the secrets that were
committed in that old backend's config.

## Stack

- **Next.js 16** (App Router), one app serving the public marketplace
  (`/`, `/bookmarks`, `/items/[id]`), the publisher dashboard (`/dashboard/*`),
  auth pages (`/login`, `/register`), and the API (`/api/**`).
- **Postgres 17** via Prisma, with `citext` (case-insensitive unique email)
  and `pg_trgm` (indexed text search) extensions.
- **Redis 7** for rate limiting and exchange-rate/currency-code caching.
- **MinIO** (S3-compatible) for uploaded images.
- Session auth: opaque tokens in an httpOnly cookie, hashed server-side —
  not JWTs. See `web/lib/auth/session.ts`.
- **Currency**: one shared list (`web/lib/currencies.ts`) backs every
  selector (public site, dashboard, profile) — a bundled ~36-currency
  fallback so it's never empty, superseded by the live exchangerate-api.com
  list when reachable. Exchange rates cache in Redis and fall back to the
  last known-good rate (marked `stale`) on a live-fetch failure rather than
  erroring outright — see `web/lib/currency.ts`.
- **Language**: English, Sinhala (සිංහල), Tamil (தமிழ்) — a client-side
  switcher (no URL change, persisted to `localStorage`, same pattern as the
  currency/bookmark preferences) covering the whole UI. Translation files
  are `web/messages/{en,si,ta}.json`; see `web/lib/i18n/LocaleContext.jsx`.
  The Sinhala/Tamil copy was AI-translated — worth a native-speaker pass
  before this is customer-facing.

## Quick start

```bash
cp .env.example .env
# Edit .env: at minimum set real passwords (openssl rand -base64 24) and
# EXCHANGE_RATE_API_KEY (free tier at exchangerate-api.com). GOOGLE_CLIENT_ID/
# SECRET are optional — Google sign-in is just disabled without them.

docker compose up --build
```

Then open http://localhost:3000. The `migrate` service runs Prisma
migrations and seeds two demo publisher accounts before `web` starts:

| Email | Password |
|---|---|
| `ava.publisher@example.com` | `DevPassword123!` |
| `sam.rentals@example.com` | `DevPassword123!` |

Sign in at `/login` with either — both land on `/dashboard`, each scoped to
their own listings (see `web/prisma/seed.ts` to change or add accounts).
Registration (`/register`) and login are rate-limited (3/hour and 5/15min
per IP); if you hit that while testing, clear it with:

```bash
docker compose exec redis redis-cli -a "$(grep REDIS_PASSWORD .env | cut -d= -f2-)" --no-auth-warning FLUSHDB
```

**Dev mode** (hot reload, exposed `db`/`redis` ports):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

**DB browser** (Adminer, dev-only):

```bash
docker compose --profile dev up adminer
```

## Local development without Docker

Requires Node 22+ and a reachable Postgres/Redis/MinIO (the `docker compose
up db redis minio minio-init` subset works fine for this).

```bash
cd web
npm install
cp ../.env.example .env   # then point DATABASE_URL/REDIS_URL/S3_ENDPOINT at localhost
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

## Verification

`web/scripts/smoke.sh` exercises the security-relevant behaviors (session
cookie flags, PII exposure, ownership checks, rate limiting, CSRF, upload
validation) against a running instance:

```bash
BASE_URL=http://localhost:3000 bash web/scripts/smoke.sh
```

## Migrated from a .NET backend

This app replaces a separate ASP.NET Core backend + two Next.js frontends
(`backend/`, `User-frontend/`, `publisher-dashboard/`), now removed from the
working tree — their history is still in `git log` if you need to refer
back to them.

**Still outstanding — only you can do this:**

1. **Rotate the three secrets that leaked in the old `backend/appsettings.json`**
   (still in git history even though the file is gone): the Postgres
   password, the JWT signing key, and the ExchangeRate API key. Generate new
   values and, for the ExchangeRate key, revoke the old one in their
   dashboard.
2. If this repository is or will be shared, consider rewriting git history
   (`git filter-repo`) to purge those secrets from old commits, not just the
   current files.

## Project layout

```
web/
├── app/
│   ├── (public)/       marketplace: /, /bookmarks, /items/[id]
│   ├── (auth)/          /login, /register
│   ├── (publisher)/     /dashboard/*
│   └── api/             the backend
├── lib/
│   ├── auth/             sessions, passwords, Google OAuth
│   ├── api/              route wrapper, rate limiting, response envelope
│   ├── validation/        Zod schemas
│   ├── dto/               the only place a DB row becomes a client response
│   └── api-client.ts      the one place the frontend calls /api
└── prisma/                schema, migrations, seed
```
