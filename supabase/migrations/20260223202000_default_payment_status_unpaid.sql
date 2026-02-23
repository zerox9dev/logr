update public.user_app_state
set sessions = (
  select jsonb_agg(
    case
      when jsonb_typeof(item) = 'object' and not (item ? 'paymentStatus')
        then item || '{"paymentStatus":"UNPAID"}'::jsonb
      else item
    end
  )
  from jsonb_array_elements(coalesce(sessions, '[]'::jsonb)) as item
)
where sessions is not null;
