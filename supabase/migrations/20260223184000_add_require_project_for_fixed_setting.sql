update public.user_app_state
set settings = coalesce(settings, '{}'::jsonb) || '{"requireProjectForFixed": false}'::jsonb
where not (coalesce(settings, '{}'::jsonb) ? 'requireProjectForFixed');
