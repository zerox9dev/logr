-- client_profiles: extra CRM fields for JSONB clients
create table if not exists public.client_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  email text, phone text, website text, country text,
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, client_id)
);
alter table public.client_profiles enable row level security;
create policy "Users manage own client profiles"
  on public.client_profiles for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_client_profiles_updated_at
  before update on public.client_profiles
  for each row execute procedure public.set_updated_at();

-- leads: pipeline kanban cards
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, company text, email text, phone text,
  website text, country text, tags text[] not null default '{}',
  notes text,
  stage text not null default 'lead'
    check (stage in ('lead','negotiation','contract','active','done')),
  estimated_value numeric(12,2), currency text not null default 'USD',
  source text, converted_client_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.leads enable row level security;
create policy "Users manage own leads"
  on public.leads for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute procedure public.set_updated_at();

-- invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null, client_name text not null,
  invoice_number text not null,
  issue_date date not null default current_date, due_date date,
  currency text not null default 'USD',
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status text not null default 'draft'
    check (status in ('draft','sent','paid','overdue','cancelled')),
  notes text, session_ids text[] not null default '{}',
  sent_at timestamptz, paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.invoices enable row level security;
create policy "Users manage own invoices"
  on public.invoices for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_invoices_updated_at
  before update on public.invoices
  for each row execute procedure public.set_updated_at();
