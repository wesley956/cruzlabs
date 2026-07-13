begin;

create extension if not exists pgtap with schema extensions;
set local timezone to 'UTC';

select plan(18);

select has_table('public', 'appointments', 'appointments table exists');
select has_column('public', 'appointments', 'business_id', 'appointment belongs to a business');
select has_column('public', 'appointments', 'occupied_range', 'appointment occupied range exists');
select has_column(
  'public',
  'appointments',
  'duration_minutes_snapshot',
  'appointment keeps the service duration snapshot'
);
select has_column(
  'public',
  'appointments',
  'customer_phone',
  'appointment keeps the customer phone'
);
select policies_are(
  'public',
  'appointments',
  array['appointments_select_own'],
  'appointments expose only the owner select policy'
);
select function_returns(
  'public',
  'get_public_availability',
  array['text', 'uuid', 'date', 'integer'],
  'jsonb',
  'public availability function returns jsonb'
);
select table_privs_are(
  'public',
  'appointments',
  'authenticated',
  array['SELECT'],
  'authenticated can read owned appointments but cannot write directly'
);
select table_privs_are(
  'public',
  'appointments',
  'anon',
  array[]::text[],
  'anonymous visitors have no direct appointment table privileges'
);
select results_eq(
  $$
    select count(*)
    from pg_catalog.pg_constraint
    where conrelid = 'public.appointments'::regclass
      and conname = 'appointments_no_active_overlap'
      and contype = 'x'
  $$,
  'values (1::bigint)',
  'active appointment overlap exclusion is enforced'
);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '10000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'availability-test@cruzagenda.test',
  '',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Profissional Teste","whatsapp":"5511999999999"}'::jsonb,
  now(),
  now()
);

insert into public.businesses (
  id,
  owner_id,
  business_name,
  profession_key,
  public_profession_name,
  whatsapp,
  city,
  state,
  timezone,
  service_location_type,
  slug,
  public_status,
  is_published,
  published_at
)
values (
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'Agenda Teste',
  'manicure_pedicure',
  'Nail designer',
  '5511999999999',
  'São Paulo',
  'SP',
  'UTC',
  'own_space',
  'agenda-teste-disponibilidade',
  'published',
  true,
  now()
);

insert into public.services (
  id,
  business_id,
  name,
  duration_minutes,
  price_cents,
  show_price,
  online_booking_enabled,
  display_order
)
values (
  '30000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'Manicure',
  60,
  3500,
  true,
  true,
  10
);

insert into public.booking_settings (
  business_id,
  minimum_notice_minutes,
  booking_window_days,
  buffer_after_minutes,
  cancellation_cutoff_minutes,
  reschedule_cutoff_minutes,
  auto_confirm
)
values (
  '20000000-0000-4000-8000-000000000001',
  0,
  60,
  15,
  1440,
  1440,
  true
);

insert into public.availability_periods (
  business_id,
  weekday,
  start_time,
  end_time,
  display_order
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    extract(dow from current_date + 7)::smallint,
    '09:00',
    '12:00',
    10
  ),
  (
    '20000000-0000-4000-8000-000000000001',
    extract(dow from current_date + 8)::smallint,
    '09:00',
    '12:00',
    10
  );

insert into public.subscriptions (
  business_id,
  provider,
  status,
  amount_cents,
  currency,
  trial_started_at,
  trial_ends_at,
  current_period_started_at,
  current_period_ends_at
)
values (
  '20000000-0000-4000-8000-000000000001',
  'mercado_pago',
  'trialing',
  2990,
  'BRL',
  now(),
  now() + interval '30 days',
  now(),
  now() + interval '30 days'
);

select is(
  jsonb_array_length(
    public.get_public_availability(
      'agenda-teste-disponibilidade',
      '30000000-0000-4000-8000-000000000001',
      current_date + 7,
      1
    ) -> 'days' -> 0 -> 'slots'
  ),
  9,
  'a three-hour period exposes nine one-hour starts at fifteen-minute intervals'
);
select is(
  (
    public.get_public_availability(
      'agenda-teste-disponibilidade',
      '30000000-0000-4000-8000-000000000001',
      current_date + 7,
      1
    ) ->> 'service_duration_minutes'
  )::integer,
  60,
  'availability returns the selected service duration'
);
select is(
  public.get_public_availability(
    'agenda-teste-disponibilidade',
    '30000000-0000-4000-8000-000000000001',
    current_date + 7,
    1
  ) ->> 'timezone',
  'UTC',
  'availability returns the business timezone'
);

insert into public.appointments (
  business_id,
  service_id,
  service_name_snapshot,
  duration_minutes_snapshot,
  price_cents_snapshot,
  customer_name,
  customer_phone,
  starts_at,
  ends_at,
  buffer_after_minutes,
  status,
  source
)
values (
  '20000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  'Manicure',
  60,
  3500,
  'Cliente Confirmada',
  '5511988888888',
  ((current_date + 7 + time '10:30') at time zone 'UTC'),
  ((current_date + 7 + time '11:30') at time zone 'UTC'),
  15,
  'confirmed',
  'manual'
);

select is(
  jsonb_array_length(
    public.get_public_availability(
      'agenda-teste-disponibilidade',
      '30000000-0000-4000-8000-000000000001',
      current_date + 7,
      1
    ) -> 'days' -> 0 -> 'slots'
  ),
  2,
  'confirmed appointment and buffers remove overlapping starts'
);

insert into public.appointments (
  business_id,
  service_id,
  service_name_snapshot,
  duration_minutes_snapshot,
  price_cents_snapshot,
  customer_name,
  customer_phone,
  starts_at,
  ends_at,
  buffer_after_minutes,
  status,
  source,
  canceled_at
)
values (
  '20000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  'Manicure',
  60,
  3500,
  'Cliente Cancelada',
  '5511977777777',
  ((current_date + 8 + time '10:30') at time zone 'UTC'),
  ((current_date + 8 + time '11:30') at time zone 'UTC'),
  15,
  'canceled',
  'public',
  now()
);

select is(
  jsonb_array_length(
    public.get_public_availability(
      'agenda-teste-disponibilidade',
      '30000000-0000-4000-8000-000000000001',
      current_date + 8,
      1
    ) -> 'days' -> 0 -> 'slots'
  ),
  9,
  'canceled appointments do not block availability'
);
select is_null(
  public.get_public_availability(
    'agenda-teste-disponibilidade',
    '30000000-0000-4000-8000-000000000099',
    current_date + 7,
    1
  ),
  'a service outside the published business returns no availability'
);
select is(
  jsonb_array_length(
    public.get_public_availability(
      'agenda-teste-disponibilidade',
      '30000000-0000-4000-8000-000000000001',
      current_date + 90,
      1
    ) -> 'days'
  ),
  0,
  'dates outside the booking window return no days'
);

update public.businesses
set online_booking_paused = true
where id = '20000000-0000-4000-8000-000000000001';

select is(
  public.get_public_availability(
    'agenda-teste-disponibilidade',
    '30000000-0000-4000-8000-000000000001',
    current_date + 7,
    1
  ) ->> 'unavailable_reason',
  'paused',
  'paused businesses do not expose available slots'
);

select * from finish();
rollback;
