update public.user_app_state
set settings = coalesce(settings, '{}'::jsonb) || '{"targetHourlyRate":"25"}'::jsonb
where not (coalesce(settings, '{}'::jsonb) ? 'targetHourlyRate');
