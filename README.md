# Logr

Freelance time tracker for client/project work with CSV and invoice export.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Supabase Auth (Google OAuth)
- Supabase Postgres (`user_app_state` table, RLS)
- localStorage fallback cache (`logr_clients`, `logr_sessions`)

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open: `http://localhost:3000`

## Supabase Setup

1. Create a Supabase project.
2. In Supabase SQL Editor run `/Users/zerox9dev/logr/supabase/schema.sql`.
3. In Supabase Dashboard copy:
   - Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
   - Project API anon key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Put values in `.env.local` (see `.env.example`).
5. In Supabase Auth -> Providers -> Google:
   - Enable Google provider
   - Add Google Client ID / Secret
6. Add redirect URLs:
   - `http://localhost:3000`
   - your production URL (for deploy)

After this, app will show Google sign-in and sync clients/sessions to Supabase per user.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Features

- Google sign-in via Supabase Auth
- Personal cloud workspace (RLS by `auth.uid()`)
- Clients -> Projects -> Tasks hierarchy
- Start/stop timer with `Space`
- Task statuses: `PENDING`, `ACTIVE`, `DONE`
- Manual session entry (date/hours/minutes/rate/status)
- Date filters: all, 7 days, current month, custom month
- Inline edit for completed sessions
- CSV export
- Printable invoice (PDF via browser print dialog)
- Light/Dark theme toggle
- Mobile-friendly sidebar behavior

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Start / Stop timer (outside inputs) |
| `Enter` | Confirm add client/project in inline input |
| `Escape` | Close add client/project inline input |

## Database Shape

```sql
user_app_state (
  user_id uuid primary key,
  clients jsonb,
  sessions jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
```

## License

This project is licensed under the Apache License 2.0.

- License text: `/Users/zerox9dev/logr/LICENSE`
- Attribution notices: `/Users/zerox9dev/logr/NOTICE`

If you copy, fork, or redistribute this project (including modified versions),
you must keep copyright and attribution notices.
