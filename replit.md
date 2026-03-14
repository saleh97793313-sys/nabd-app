# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

### `artifacts/mobile` (`@workspace/mobile`)

Expo React Native mobile app for patients. Connects to the API via `EXPO_PUBLIC_API_URL` env variable or falls back to `EXPO_PUBLIC_DOMAIN`.

- Tabs: الرئيسية (Home), العروض (Offers), الخريطة (Map), مواعيدي (Appointments), حسابي (Profile)
- Map tab uses `expo-location` for user positioning and shows clinics sorted by distance
- Clinics with lat/lng show distance and a "الاتجاهات" (Directions) button
- Clinic detail page has a "عرض على خرائط جوجل" card that opens Google Maps with directions
- Profile tab has a digital loyalty card with QR code (patient phone), level badge, and points display
- Tapping the QR opens full-screen QR modal for easy scanning at clinics
- "سجل النقاط" menu item navigates to `/points-history` screen showing all points transactions
- Points log entries are created automatically on appointment completion and patient registration
- Notifications fetched from API (filtered by patient loyalty level), replacing mock data
- Profile tab shows red unread notification count badge

- Set `EXPO_PUBLIC_API_URL` in `artifacts/mobile/.env` to point to the production API (e.g. `https://your-api.up.railway.app/api`)
- In development, `EXPO_PUBLIC_DOMAIN` is set automatically to the Replit dev domain

### `artifacts/clinic-dashboard` (`@workspace/clinic-dashboard`)

React + Vite admin dashboard for clinics. Built with Tailwind CSS.

- Build requires `BASE_PATH=/dashboard/` and `PORT=3000`
- In production, served as static files by the API server at `/dashboard`
- Login credentials are configured via `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables
- Clinic form has an interactive Leaflet/OpenStreetMap map picker for selecting clinic location (no API key needed)
- Map picker supports search (Nominatim geocoding, scoped to Oman) and click-to-set-pin
- Patients page shows "السجل" button per patient that opens a points history modal showing earned/deducted/balance summary and transaction list
- Messages page ("الرسائل") for composing and broadcasting notifications to patients by loyalty level
- Appointments page has list/calendar toggle with a week calendar grid view showing time slots and appointment chips

## Deployment

### Railway (recommended for 24/7 API)

Config file: `railway.toml` at project root.
GitHub repo: `saleh97793313-sys/nabd-app`

1. Create account at [railway.app](https://railway.app) (login with GitHub)
2. New Project > Deploy from GitHub repo > select `nabd-app`
3. Add a PostgreSQL database service (Railway provides free tier)
4. Add **all** required environment variables in the Railway service settings:
   - `DATABASE_URL` — auto-set if you add Railway's PostgreSQL plugin; otherwise copy from Replit Database tab
   - `PORT` — Railway sets this automatically (do not set manually)
   - `NODE_ENV` — set to `production`
   - `SESSION_SECRET` — any random secret string (e.g. `nabd-secret-2026-xyz`)
   - `ADMIN_EMAIL` — admin login email for the dashboard (e.g. `Saleh97793313@gmail.com`)
   - `ADMIN_PASSWORD` — admin login password for the dashboard (choose a strong password)
5. Railway auto-detects `railway.toml` and builds/deploys
6. Copy the Railway URL and create `artifacts/mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=https://YOUR-RAILWAY-HOST.up.railway.app/api
   ```
   **Important:** The URL must end with `/api` — without it, mobile API calls will fail. See `artifacts/mobile/.env.example` for reference.

### Security Notes

- Never commit credentials or API keys to the repository
- Admin credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) must be set as environment variables/secrets, never hardcoded
- The `SESSION_SECRET` is used for HMAC-SHA256 signing of admin JWT tokens
- After deployment, revoke any GitHub Personal Access Tokens that were shared or exposed

### Replit Deploy

Config is in `.replit` under `[deployment]`. Requires Replit Core plan.

- Build: `BASE_PATH=/dashboard/ PORT=3000 pnpm --filter @workspace/clinic-dashboard run build && pnpm --filter @workspace/api-server run build`
- Run: `node artifacts/api-server/dist/index.cjs`
- Dashboard at `/dashboard`, API at `/api`
