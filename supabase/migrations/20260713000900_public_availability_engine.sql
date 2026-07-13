begin;

create extension if not exists btree_gist with schema extensions;

create table public.appointments (
  id uuid primary key default extensions.gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  service_name_snapshot text not null check (
    char_length(trim(service_name_snapshot)) between 2 and 100
  ),
  duration_minutes_snapshot integer not null check (
    duration_minutes_snapshot between 5 and 720
  ),
  price_cents_snapshot integer check (
    price_cents_snapshot is null or price_cents_snapshot >= 0
  ),
  customer_name text not null check (
    char_length(trim(customer_name)) between 2 and 120
  ),
  customer_phone text not null check (customer_phone ~ '^55[0-9]{10,11}$'),
  customer_email text check (
    customer_email is null or char_length(trim(customer_email)) between 3 and 320
  ),
  customer_note text check (
    customer_note is null or char_length(customer_note) <= 500
  ),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  buffer_after_minutes integer not null default 0 check (
    buffer_after_minutes between 0 and 240
  ),
  occupied_range tstzrange not null,
  status text not null default 'confirmed' check (
    status in ('pending', 'confirmed', 'completed', 'canceled', 'no_show')
  ),
  source text not null default 'public' check (
    source in ('public', 'manual', 'admin', 'import')
  ),
  created_by_user_id uuid references auth.users(id) on delete set null,
  canceled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint appointments_time_order_check check (starts_at < ends_at),
  constraint appointments_cancellation_state_check check (
    (status = 'canceled') = (canceled_at is not null)
  ),
  constraint appointments_completion_state_check check (
    (status = 'completed') = (completed_at is not null)
  ),
  constraint appointments_no_active_overlap exclude using gist (
    business_id with =,
    occupied_range with &&
  ) where (status in ('pending', 'confirmed'))
);

create or replace function public.set_appointment_occupied_range()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.occupied_range := tstzrange(
    new.starts_at,
    new.ends_at + make_interval(mins => new.buffer_after_minutes),
    '[)'
  );

  return new;
end;
$$;

create index appointments_business_starts_at_idx
  on public.appointments(business_id, starts_at);
create index appointments_business_status_starts_at_idx
  on public.appointments(business_id, status, starts_at);
create index appointments_service_id_idx
  on public.appointments(service_id);

create trigger appointments_set_occupied_range
before insert or update of starts_at, ends_at, buffer_after_minutes
on public.appointments
for each row execute function public.set_appointment_occupied_range();

create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

alter table public.appointments enable row level security;

create policy "appointments_select_own"
on public.appointments
for select
to authenticated
using (public.owns_business(business_id));

revoke all on table public.appointments from anon, authenticated;
grant select on table public.appointments to authenticated;

create or replace function public.get_public_availability(
  selected_slug text,
  selected_service_id uuid,
  selected_start_date date default null,
  selected_days integer default 14
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_slug text := lower(trim(coalesce(selected_slug, '')));
  public_business_id uuid;
  public_business_timezone text;
  public_booking_paused boolean;
  service_name text;
  service_duration_minutes integer;
  minimum_notice_minutes integer;
  booking_window_days integer;
  buffer_after_minutes integer;
  local_now timestamp without time zone;
  effective_start_date date;
  effective_end_date date;
  booking_window_end_date date;
  minimum_start_at timestamptz;
  slot_date date;
  day_slots jsonb;
  availability_days jsonb := '[]'::jsonb;
begin
  if normalized_slug !~ '^(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*(?<!-)$'
    or char_length(normalized_slug) not between 3 and 50 then
    return null;
  end if;

  if selected_service_id is null
    or selected_days is null
    or selected_days not between 1 and 31 then
    return null;
  end if;

  select
    business.id,
    business.timezone,
    business.online_booking_paused,
    service.name,
    service.duration_minutes,
    settings.minimum_notice_minutes,
    settings.booking_window_days,
    settings.buffer_after_minutes
  into
    public_business_id,
    public_business_timezone,
    public_booking_paused,
    service_name,
    service_duration_minutes,
    minimum_notice_minutes,
    booking_window_days,
    buffer_after_minutes
  from public.businesses business
  join public.subscriptions subscription
    on subscription.business_id = business.id
  join public.booking_settings settings
    on settings.business_id = business.id
  join public.services service
    on service.business_id = business.id
   and service.id = selected_service_id
  where business.slug = normalized_slug
    and business.is_published = true
    and business.public_status = 'published'
    and service.is_active = true
    and service.online_booking_enabled = true
    and (
      (
        subscription.status = 'trialing'
        and subscription.trial_ends_at > now()
      )
      or
      (
        subscription.status = 'active'
        and (
          subscription.current_period_ends_at is null
          or subscription.current_period_ends_at > now()
        )
      )
    );

  if public_business_id is null then
    return null;
  end if;

  local_now := timezone(public_business_timezone, now());
  effective_start_date := greatest(
    coalesce(selected_start_date, local_now::date),
    local_now::date
  );
  booking_window_end_date := local_now::date + (booking_window_days - 1);
  minimum_start_at := now() + make_interval(mins => minimum_notice_minutes);

  if effective_start_date > booking_window_end_date then
    return jsonb_build_object(
      'slug', normalized_slug,
      'service_id', selected_service_id,
      'service_name', service_name,
      'service_duration_minutes', service_duration_minutes,
      'timezone', public_business_timezone,
      'slot_interval_minutes', 15,
      'booking_window_ends_on', booking_window_end_date,
      'unavailable_reason', case when public_booking_paused then 'paused' else null end,
      'days', '[]'::jsonb
    );
  end if;

  effective_end_date := least(
    effective_start_date + (selected_days - 1),
    booking_window_end_date
  );

  if public_booking_paused then
    return jsonb_build_object(
      'slug', normalized_slug,
      'service_id', selected_service_id,
      'service_name', service_name,
      'service_duration_minutes', service_duration_minutes,
      'timezone', public_business_timezone,
      'slot_interval_minutes', 15,
      'booking_window_ends_on', booking_window_end_date,
      'unavailable_reason', 'paused',
      'days', '[]'::jsonb
    );
  end if;

  for slot_date in
    select date_series.generated_date::date
    from generate_series(
      effective_start_date::timestamp,
      effective_end_date::timestamp,
      interval '1 day'
    ) as date_series(generated_date)
  loop
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'starts_at', candidates.candidate_start,
          'ends_at', candidates.candidate_end
        )
        order by candidates.candidate_start
      ),
      '[]'::jsonb
    )
    into day_slots
    from (
      select
        slot_series.generated_start as candidate_start,
        slot_series.generated_start + make_interval(mins => service_duration_minutes)
          as candidate_end
      from public.availability_periods period
      cross join lateral generate_series(
        ((slot_date + period.start_time) at time zone public_business_timezone),
        (
          (slot_date + period.end_time) at time zone public_business_timezone
        ) - make_interval(mins => service_duration_minutes),
        interval '15 minutes'
      ) as slot_series(generated_start)
      where period.business_id = public_business_id
        and period.is_active = true
        and period.weekday = extract(dow from slot_date)::smallint
        and slot_series.generated_start >= minimum_start_at
        and not exists (
          select 1
          from public.appointments appointment
          where appointment.business_id = public_business_id
            and appointment.status in ('pending', 'confirmed')
            and appointment.occupied_range && tstzrange(
              slot_series.generated_start,
              slot_series.generated_start + make_interval(
                mins => service_duration_minutes + buffer_after_minutes
              ),
              '[)'
            )
        )
    ) as candidates;

    availability_days := availability_days || jsonb_build_array(
      jsonb_build_object(
        'date', slot_date,
        'weekday', extract(dow from slot_date)::integer,
        'slots', day_slots
      )
    );
  end loop;

  return jsonb_build_object(
    'slug', normalized_slug,
    'service_id', selected_service_id,
    'service_name', service_name,
    'service_duration_minutes', service_duration_minutes,
    'timezone', public_business_timezone,
    'slot_interval_minutes', 15,
    'minimum_notice_minutes', minimum_notice_minutes,
    'booking_window_ends_on', booking_window_end_date,
    'unavailable_reason', null,
    'days', availability_days
  );
end;
$$;

revoke all on function public.set_appointment_occupied_range() from public, anon, authenticated;
revoke all on function public.get_public_availability(text, uuid, date, integer) from public;
grant execute on function public.get_public_availability(text, uuid, date, integer)
  to anon, authenticated;

commit;
