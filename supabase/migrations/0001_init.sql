-- =============================================================================
-- logr — Initial Schema Migration
-- Generated from src/types/database.ts + src/api/index.ts
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- for gen_random_uuid() on PG < 14


-- ---------------------------------------------------------------------------
-- 1. Enum Types
-- ---------------------------------------------------------------------------

create type public.billing_type as enum (
  'hourly',
  'fixed'
);

create type public.payment_status as enum (
  'unpaid',
  'paid'
);

create type public.invoice_status as enum (
  'draft',
  'sent',
  'paid',
  'overdue'
);

create type public.project_status as enum (
  'active',
  'paused',
  'completed',
  'cancelled'
);

create type public.activity_type as enum (
  'call',
  'email',
  'meeting',
  'note',
  'payment'
);


-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

-- ── user_settings ──────────────────────────────────────────────────────────
-- One row per user; upserted on conflict(user_id).
-- Has its own surrogate `id` uuid (Row type includes id: string),
-- but the real unique key is user_id (used in onConflict).
create table public.user_settings (
  id                 uuid        not null default gen_random_uuid() primary key,
  user_id            uuid        not null unique references auth.users (id) on delete cascade,
  full_name          text,
  company            text,
  email              text,
  phone              text,
  address            text,
  default_currency   text        not null default 'USD',
  default_rate       numeric,
  logo_url           text,
  weekly_goal_hours  numeric,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── clients ─────────────────────────────────────────────────────────────────
create table public.clients (
  id          uuid        not null default gen_random_uuid() primary key,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  name        text        not null,
  email       text,
  phone       text,
  company     text,
  address     text,
  country     text,
  website     text,
  tags        text[]      not null default '{}',
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── projects ─────────────────────────────────────────────────────────────────
-- ProjectInsert includes client_id as required (no | null in type).
create table public.projects (
  id            uuid                not null default gen_random_uuid() primary key,
  user_id       uuid                not null references auth.users (id) on delete cascade,
  client_id     uuid                not null references public.clients (id) on delete cascade,
  name          text                not null,
  billing_type  public.billing_type not null,
  rate          numeric,
  fixed_budget  numeric,
  status        public.project_status not null default 'active',
  created_at    timestamptz         not null default now()
);

-- ── sessions (time entries) ───────────────────────────────────────────────
-- client_id and project_id are nullable (string | null in Session).
create table public.sessions (
  id               uuid                  not null default gen_random_uuid() primary key,
  user_id          uuid                  not null references auth.users (id) on delete cascade,
  client_id        uuid                  references public.clients  (id) on delete set null,
  project_id       uuid                  references public.projects (id) on delete set null,
  name             text                  not null,
  notes            text,
  tags             text[]                not null default '{}',
  started_at       timestamptz           not null,
  duration_seconds integer               not null default 0,
  rate             numeric               not null default 0,
  billing_type     public.billing_type   not null,
  payment_status   public.payment_status not null default 'unpaid',
  created_at       timestamptz           not null default now()
);

-- ── invoices ─────────────────────────────────────────────────────────────────
create table public.invoices (
  id              uuid                  not null default gen_random_uuid() primary key,
  user_id         uuid                  not null references auth.users (id) on delete cascade,
  client_id       uuid                  not null references public.clients (id) on delete restrict,
  invoice_number  text                  not null,
  subtotal        numeric               not null default 0,
  tax_rate        numeric               not null default 0,
  tax_amount      numeric               not null default 0,
  total           numeric               not null default 0,
  currency        text                  not null default 'USD',
  status          public.invoice_status not null default 'draft',
  due_date        timestamptz,
  sent_at         timestamptz,
  paid_at         timestamptz,
  notes           text,
  created_at      timestamptz           not null default now()
);

-- ── invoice_items ─────────────────────────────────────────────────────────
-- No user_id — scoped through invoices. session_id is nullable.
create table public.invoice_items (
  id           uuid    not null default gen_random_uuid() primary key,
  invoice_id   uuid    not null references public.invoices  (id) on delete cascade,
  session_id   uuid             references public.sessions  (id) on delete set null,
  description  text    not null,
  quantity     numeric not null default 1,
  rate         numeric not null default 0,
  amount       numeric not null default 0
);

-- ── activities ───────────────────────────────────────────────────────────────
-- client_id is nullable (string | null in Activity).
create table public.activities (
  id           uuid                  not null default gen_random_uuid() primary key,
  user_id      uuid                  not null references auth.users (id) on delete cascade,
  client_id    uuid                  references public.clients (id) on delete set null,
  type         public.activity_type  not null,
  description  text                  not null,
  created_at   timestamptz           not null default now()
);


-- ---------------------------------------------------------------------------
-- 3. Row-Level Security
-- ---------------------------------------------------------------------------

alter table public.user_settings  enable row level security;
alter table public.clients        enable row level security;
alter table public.projects       enable row level security;
alter table public.sessions       enable row level security;
alter table public.invoices       enable row level security;
alter table public.invoice_items  enable row level security;
alter table public.activities     enable row level security;

-- user_settings
create policy "user_settings: own rows"
  on public.user_settings
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- clients
create policy "clients: own rows"
  on public.clients
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- projects
create policy "projects: own rows"
  on public.projects
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- sessions
create policy "sessions: own rows"
  on public.sessions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- invoices
create policy "invoices: own rows"
  on public.invoices
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- invoice_items — no user_id; scope through parent invoice
create policy "invoice_items: own rows via invoice"
  on public.invoice_items
  for all
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and i.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and i.user_id = auth.uid()
    )
  );

-- activities
create policy "activities: own rows"
  on public.activities
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- 4. Indexes
-- ---------------------------------------------------------------------------

-- user_settings — unique constraint on user_id already acts as an index

-- clients
create index clients_user_id_idx     on public.clients  (user_id);
create index clients_created_at_idx  on public.clients  (user_id, created_at desc);

-- projects
create index projects_user_id_idx    on public.projects (user_id);
create index projects_client_id_idx  on public.projects (client_id);

-- sessions
create index sessions_user_id_started_at_idx on public.sessions (user_id, started_at desc);
create index sessions_client_id_idx          on public.sessions (client_id);
create index sessions_project_id_idx         on public.sessions (project_id);

-- invoices
create index invoices_user_id_idx    on public.invoices (user_id);
create index invoices_client_id_idx  on public.invoices (client_id);

-- invoice_items
create index invoice_items_invoice_id_idx on public.invoice_items (invoice_id);
create index invoice_items_session_id_idx on public.invoice_items (session_id);

-- activities
create index activities_user_id_idx    on public.activities (user_id);
create index activities_client_id_idx  on public.activities (client_id);
create index activities_created_at_idx on public.activities (user_id, created_at desc);


-- ---------------------------------------------------------------------------
-- 5. updated_at auto-update trigger
--    (user_settings and clients have updated_at; projects/sessions/invoices do not)
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();
