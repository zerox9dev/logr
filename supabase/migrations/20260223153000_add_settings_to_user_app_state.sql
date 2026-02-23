alter table public.user_app_state
add column if not exists settings jsonb not null default '{"hourlyRate":"50","workdayHours":"8"}'::jsonb;
