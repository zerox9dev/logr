# Logr

Freelance time tracker + CRM with Google sign-in, Supabase cloud sync, funnels, and invoice exports.

## Preview

Workspace preview (App Router app shell):

![Logr tracker preview](./public/project-preview.png)

## Routes

- Landing: `/`
- Dashboard: `/dashboard`
- Tracker: `/tracker`
- Clients: `/clients`
- Funnels: `/funnels`
- Invoices: `/invoices`
- Profile: `/profile`

## What it does

- Clients → Projects → Sessions workflow
- Session types: `hourly`, `fixed_project`
- Session statuses: `PENDING`, `ACTIVE`, `DONE`
- Payment status tracking: `UNPAID` / `PAID`
- Dashboard metrics: time, revenue, avg rate, collection %, pricing health, trends
- CSV export and printable PDF invoice
- Light/dark theme + mobile layout

### CRM and Funnel features

- Client cards: email, phone, website, country, tags, notes
- Multi-funnel system (database-backed):
  - Template: Freelancer
  - Template: Job Seeker
  - Template: Custom
- Job seeker funnel includes `Rejected` stage
- Funnel stages editable for custom funnels
- Drag-and-drop pipeline by stage
- Invoices: 4-step wizard, tax rate, due date, status lifecycle (`draft`, `sent`, `paid`, `overdue`, `cancelled`)

## Tech stack

- Next.js 16 (App Router)
- React 19
- Supabase Auth (Google OAuth)
- Supabase Postgres (JSONB app state + relational CRM tables + RLS)
- dnd-kit (drag-and-drop)
- Vercel Analytics + Speed Insights

## Requirements

- Node.js 20+
- npm
- Supabase project
- Google OAuth credentials

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

## Supabase setup

1. Create a Supabase project.
2. Run SQL from `supabase/schema.sql`.
3. Run migrations from `supabase/migrations/` in order.
4. Enable Google provider in Supabase Auth and set OAuth credentials.
5. Add redirect URLs:
   - `http://localhost:3000`
   - your production URL

## Database shape

### `public.user_app_state` (JSONB)

```sql
user_id  uuid primary key references auth.users(id) on delete cascade
clients  jsonb not null default '[]'
sessions jsonb not null default '[]'
settings jsonb not null
```

### `public.client_profiles`

```sql
id        uuid primary key
user_id   uuid references auth.users(id)
client_id text
email, phone, website, country text
tags      text[] default '{}'
notes     text
```

### `public.funnels`

```sql
id         uuid primary key
user_id    uuid references auth.users(id)
name       text
type       text  -- freelancer | jobseeker | custom
```

### `public.funnel_stages`

```sql
id         uuid primary key
funnel_id  uuid references funnels(id)
key        text
title      text
position   int
```

### `public.leads`

```sql
id               uuid primary key
user_id          uuid references auth.users(id)
funnel_id        uuid references funnels(id)
stage_id         uuid references funnel_stages(id)
name, company    text
estimated_value  numeric(12,2)
currency         text default 'USD'
email, phone, website, country, source, notes text
tags             text[] default '{}'
```

### `public.invoices`

```sql
id              uuid primary key
user_id         uuid references auth.users(id)
client_id       text
client_name     text
invoice_number  text
issue_date      date
due_date        date
currency        text default 'USD'
items           jsonb default '[]'
subtotal, tax_rate, tax_amount, total numeric
status          text  -- draft | sent | paid | overdue | cancelled
session_ids     text[] default '{}'
notes           text
```

All relational tables use RLS (`auth.uid() = user_id` scope).

## Migrations

| File | Description |
|------|-------------|
| `20260223153000_add_settings_to_user_app_state.sql` | Add `settings` column |
| `20260223184000_add_require_project_for_fixed_setting.sql` | Backfill `requireProjectForFixed` |
| `20260223193000_add_target_hourly_rate_setting.sql` | Backfill `targetHourlyRate` |
| `20260223202000_default_payment_status_unpaid.sql` | Backfill session `paymentStatus` |
| `20260227120000_add_crm_tables.sql` | Add `client_profiles`, `leads`, `invoices` |
| `20260227133000_add_funnels_and_stage_mapping.sql` | Add `funnels`, `funnel_stages`, lead stage mapping |
| `20260227141000_add_rejected_stage_to_jobseeker_funnels.sql` | Add `rejected` stage for jobseeker funnels |

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Notes

- If Supabase env vars are missing, app shows setup instructions.
- JSONB state (`clients`, `sessions`, `settings`) syncs with debounce.
- CRM entities (profiles, funnels, stages, leads, invoices) persist directly in Supabase.

## License

Apache License 2.0. See `LICENSE` and `NOTICE`.
