-- Add missing `rejected` stage to existing jobseeker funnels.
insert into public.funnel_stages (funnel_id, key, title, position)
select f.id, 'rejected', 'Rejected', 5
from public.funnels f
where f.type = 'jobseeker'
  and not exists (
    select 1
    from public.funnel_stages fs
    where fs.funnel_id = f.id
      and fs.key = 'rejected'
  );
