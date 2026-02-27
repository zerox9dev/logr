-- Universal funnels with custom stages
create table if not exists public.funnels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'custom' check (type in ('freelancer','jobseeker','custom')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.funnel_stages (
  id uuid primary key default gen_random_uuid(),
  funnel_id uuid not null references public.funnels(id) on delete cascade,
  key text not null,
  title text not null,
  position int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (funnel_id, key),
  unique (funnel_id, position)
);

alter table public.funnels enable row level security;
alter table public.funnel_stages enable row level security;

create policy "Users manage own funnels"
  on public.funnels for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own funnel stages"
  on public.funnel_stages for all to authenticated
  using (exists (
    select 1 from public.funnels f
    where f.id = funnel_stages.funnel_id
      and f.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.funnels f
    where f.id = funnel_stages.funnel_id
      and f.user_id = auth.uid()
  ));

create trigger trg_funnels_updated_at
  before update on public.funnels
  for each row execute procedure public.set_updated_at();

create trigger trg_funnel_stages_updated_at
  before update on public.funnel_stages
  for each row execute procedure public.set_updated_at();

alter table public.leads add column if not exists funnel_id uuid references public.funnels(id) on delete set null;
alter table public.leads add column if not exists stage_id uuid references public.funnel_stages(id) on delete set null;

alter table public.leads drop constraint if exists leads_stage_check;

create index if not exists idx_leads_user_funnel on public.leads(user_id, funnel_id);
create index if not exists idx_leads_stage_id on public.leads(stage_id);
create index if not exists idx_funnel_stages_funnel on public.funnel_stages(funnel_id, position);
