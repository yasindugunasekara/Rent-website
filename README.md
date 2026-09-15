# Rent Website

A rental marketplace: browse and list items for rent. Originally a Next.js
frontend + separate publisher dashboard talking to an ASP.NET Core backend;
now a single Next.js app (`web/`) with the backend implemented as Next API
routes, backed by Postgres, Redis, and MinIO — all runnable with one
`docker compose up`.

The old `backend/`, `User-frontend/`, and `publisher-dashboard/` directories
are retained until the new app is verified in your environment, then should
be deleted (see "Migration cleanup" below).

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

## Migration cleanup (do this after verifying `web/` works for you)

1. **Rotate the three secrets that leaked in `backend/appsettings.json`**
   (committed in git history): the Postgres password, the JWT signing key,
   and the ExchangeRate API key. Moving them to `.env` is not enough —
   generate new values and, for the ExchangeRate key, revoke the old one in
   their dashboard.
2. Delete `backend/`, `User-frontend/`, `publisher-dashboard/` as separate
   commits.
3. If this repository is or will be shared, consider rewriting git history
   (`git filter-repo`) to purge the leaked secrets, not just the files.

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
