begin;

create table public.availability_periods (
  id uuid primary key default extensions.gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint availability_periods_time_order_check check (start_time < end_time),
  unique (business_id, weekday, start_time, end_time)
);

comment on column public.availability_periods.weekday is
  'Dia da semana seguindo PostgreSQL extract(dow): domingo=0 e sábado=6.';

create index availability_periods_business_weekday_idx
  on public.availability_periods(business_id, weekday, start_time)
  where is_active = true;

create trigger availability_periods_set_updated_at
before update on public.availability_periods
for each row execute function public.set_updated_at();

alter table public.availability_periods enable row level security;

create policy "availability_periods_select_own"
on public.availability_periods
for select
to authenticated
using (public.owns_business(business_id));

revoke all on table public.availability_periods from anon, authenticated;
grant select on table public.availability_periods to authenticated;

create or replace function public.save_onboarding_availability(selected_periods jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_business_id uuid;
  onboarding_is_completed boolean;
  period_item jsonb;
  item_position bigint;
  normalized_weekday smallint;
  normalized_start time;
  normalized_end time;
  saved_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  if jsonb_typeof(selected_periods) <> 'array' then
    raise exception 'availability_must_be_array';
  end if;

  if jsonb_array_length(selected_periods) < 1 then
    raise exception 'at_least_one_availability_period_required';
  end if;

  if jsonb_array_length(selected_periods) > 50 then
    raise exception 'too_many_availability_periods';
  end if;

  select
    b.id,
    p.onboarding_completed
  into
    current_business_id,
    onboarding_is_completed
  from public.businesses b
  join public.profiles p on p.id = b.owner_id
  where b.owner_id = current_user_id;

  if current_business_id is null then
    raise exception 'business_not_initialized';
  end if;

  if onboarding_is_completed then
    raise exception 'onboarding_already_completed';
  end if;

  delete from public.availability_periods
  where business_id = current_business_id;

  for period_item, item_position in
    select value, ordinality
    from jsonb_array_elements(selected_periods) with ordinality
  loop
    if coalesce(period_item ->> 'weekday', '') !~ '^[0-6]$' then
      raise exception 'invalid_availability_weekday';
    end if;

    normalized_weekday := (period_item ->> 'weekday')::smallint;

    if coalesce(period_item ->> 'start_time', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
      raise exception 'invalid_availability_start_time';
    end if;

    if coalesce(period_item ->> 'end_time', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
      raise exception 'invalid_availability_end_time';
    end if;

    normalized_start := (period_item ->> 'start_time')::time;
    normalized_end := (period_item ->> 'end_time')::time;

    if normalized_start >= normalized_end then
      raise exception 'invalid_availability_period_order';
    end if;

    if exists (
      select 1
      from public.availability_periods ap
      where ap.business_id = current_business_id
        and ap.weekday = normalized_weekday
        and ap.is_active = true
        and ap.start_time < normalized_end
        and ap.end_time > normalized_start
    ) then
      raise exception 'overlapping_availability_periods';
    end if;

    insert into public.availability_periods (
      business_id,
      weekday,
      start_time,
      end_time,
      display_order
    )
    values (
      current_business_id,
      normalized_weekday,
      normalized_start,
      normalized_end,
      item_position::integer * 10
    );

    saved_count := saved_count + 1;
  end loop;

  update public.profiles
  set onboarding_step = 'rules'
  where id = current_user_id
    and onboarding_completed = false;

  return saved_count;
end;
$$;

revoke all on function public.save_onboarding_availability(jsonb) from public, anon;
grant execute on function public.save_onboarding_availability(jsonb) to authenticated;

commit;
