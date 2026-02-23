# Logr

Freelance time tracker with Google sign-in, cloud sync in Supabase, and CSV/invoice exports.

## What it does

- Landing page at `/`
- Tracker app at `/tracker`
- Clients -> Projects -> Sessions workflow
- Session types: `hourly` and `fixed_project`
- Session statuses: `PENDING`, `ACTIVE`, `DONE`
- Payment status tracking: `UNPAID` / `PAID`
- Dashboard metrics (money, hours, avg rate, collection %, pricing health, trends)
- Profile settings for default rate, target rate, workday hours, and fixed-task rules
- CSV export and printable invoice export (via browser print dialog)
- Light/dark theme and mobile-friendly layout

## Tech stack

- Next.js 16 (App Router)
- React 19
- Supabase Auth (Google OAuth)
- Supabase Postgres (`public.user_app_state` + RLS policies)
- Vercel Analytics + Speed Insights

## Requirements

- Node.js 20+
- npm
- Supabase project
- Google OAuth credentials (for auth provider)

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Reference template: `/Users/zerox9dev/logr/.env.example`

## Supabase setup

1. Create a Supabase project.
2. Run SQL from `/Users/zerox9dev/logr/supabase/schema.sql` in Supabase SQL Editor.
3. In Supabase Auth -> Providers, enable Google and add OAuth client ID/secret.
4. In Supabase Auth URL settings, add redirect URLs:
   - `http://localhost:3000`
   - your production URL
5. Copy project values to `.env.local`:
   - Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
   - Project API anon key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database shape

`public.user_app_state`:

```sql
user_id uuid primary key references auth.users(id) on delete cascade
clients jsonb not null default '[]'
sessions jsonb not null default '[]'
settings jsonb not null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Default `settings` payload:

```json
{
  "hourlyRate": "50",
  "targetHourlyRate": "25",
  "workdayHours": "8",
  "requireProjectForFixed": false
}
```

RLS policies restrict read/write to `auth.uid() = user_id`.

## Migrations

SQL migrations are in `/Users/zerox9dev/logr/supabase/migrations` and include:

- adding `settings` support
- backfilling `requireProjectForFixed`
- backfilling `targetHourlyRate`
- backfilling missing session `paymentStatus` with `UNPAID`

For a fresh project, applying `schema.sql` is enough. For existing environments, run migrations as needed.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Keyboard shortcut

- `Space`: start/stop active hourly timer (outside input fields)

## Notes

- If Supabase env vars are missing, tracker shows a setup screen instead of the app.
- Cloud state is synced to Supabase and additionally cached in `sessionStorage` (`logr-cloud-cache-v1`) for faster reloads.

## License

Apache License 2.0.

- License text: `/Users/zerox9dev/logr/LICENSE`
- Attribution notices: `/Users/zerox9dev/logr/NOTICE`
