begin;

create table public.booking_settings (
  id uuid primary key default extensions.gen_random_uuid(),
  business_id uuid not null unique references public.businesses(id) on delete cascade,
  minimum_notice_minutes integer not null default 120 check (
    minimum_notice_minutes between 0 and 10080
  ),
  booking_window_days integer not null default 60 check (
    booking_window_days between 1 and 365
  ),
  buffer_after_minutes integer not null default 0 check (
    buffer_after_minutes between 0 and 240
  ),
  cancellation_cutoff_minutes integer not null default 1440 check (
    cancellation_cutoff_minutes between 0 and 10080
  ),
  reschedule_cutoff_minutes integer not null default 1440 check (
    reschedule_cutoff_minutes between 0 and 10080
  ),
  auto_confirm boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on column public.booking_settings.minimum_notice_minutes is
  'Antecedência mínima entre o momento atual e o início de um agendamento público.';
comment on column public.booking_settings.booking_window_days is
  'Quantidade máxima de dias futuros exibidos para novos agendamentos.';
comment on column public.booking_settings.buffer_after_minutes is
  'Intervalo indisponível acrescentado depois da duração de cada serviço.';
comment on column public.booking_settings.cancellation_cutoff_minutes is
  'Antecedência mínima para a cliente cancelar pelo link de gerenciamento.';
comment on column public.booking_settings.reschedule_cutoff_minutes is
  'Antecedência mínima para a cliente reagendar pelo link de gerenciamento.';
comment on column public.booking_settings.auto_confirm is
  'Quando verdadeiro, agendamentos públicos entram confirmados sem revisão manual.';

create trigger booking_settings_set_updated_at
before update on public.booking_settings
for each row execute function public.set_updated_at();

alter table public.booking_settings enable row level security;

create policy "booking_settings_select_own"
on public.booking_settings
for select
to authenticated
using (public.owns_business(business_id));

revoke all on table public.booking_settings from anon, authenticated;
grant select on table public.booking_settings to authenticated;

create or replace function public.save_onboarding_booking_settings(selected_rules jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_business_id uuid;
  onboarding_is_completed boolean;
  normalized_minimum_notice integer;
  normalized_booking_window integer;
  normalized_buffer_after integer;
  normalized_cancellation_cutoff integer;
  normalized_reschedule_cutoff integer;
  normalized_auto_confirm boolean;
  saved_settings_id uuid;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  if jsonb_typeof(selected_rules) <> 'object' then
    raise exception 'booking_rules_must_be_object';
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

  if coalesce(selected_rules ->> 'minimum_notice_minutes', '') !~ '^[0-9]+$' then
    raise exception 'invalid_minimum_notice';
  end if;

  if coalesce(selected_rules ->> 'booking_window_days', '') !~ '^[0-9]+$' then
    raise exception 'invalid_booking_window';
  end if;

  if coalesce(selected_rules ->> 'buffer_after_minutes', '') !~ '^[0-9]+$' then
    raise exception 'invalid_buffer_after';
  end if;

  if coalesce(selected_rules ->> 'cancellation_cutoff_minutes', '') !~ '^[0-9]+$' then
    raise exception 'invalid_cancellation_cutoff';
  end if;

  if coalesce(selected_rules ->> 'reschedule_cutoff_minutes', '') !~ '^[0-9]+$' then
    raise exception 'invalid_reschedule_cutoff';
  end if;

  if coalesce(selected_rules ->> 'auto_confirm', '') not in ('true', 'false') then
    raise exception 'invalid_auto_confirm';
  end if;

  normalized_minimum_notice := (selected_rules ->> 'minimum_notice_minutes')::integer;
  normalized_booking_window := (selected_rules ->> 'booking_window_days')::integer;
  normalized_buffer_after := (selected_rules ->> 'buffer_after_minutes')::integer;
  normalized_cancellation_cutoff := (
    selected_rules ->> 'cancellation_cutoff_minutes'
  )::integer;
  normalized_reschedule_cutoff := (
    selected_rules ->> 'reschedule_cutoff_minutes'
  )::integer;
  normalized_auto_confirm := (selected_rules ->> 'auto_confirm')::boolean;

  if normalized_minimum_notice not between 0 and 10080 then
    raise exception 'invalid_minimum_notice';
  end if;

  if normalized_booking_window not between 1 and 365 then
    raise exception 'invalid_booking_window';
  end if;

  if normalized_buffer_after not between 0 and 240 then
    raise exception 'invalid_buffer_after';
  end if;

  if normalized_cancellation_cutoff not between 0 and 10080 then
    raise exception 'invalid_cancellation_cutoff';
  end if;

  if normalized_reschedule_cutoff not between 0 and 10080 then
    raise exception 'invalid_reschedule_cutoff';
  end if;

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
    current_business_id,
    normalized_minimum_notice,
    normalized_booking_window,
    normalized_buffer_after,
    normalized_cancellation_cutoff,
    normalized_reschedule_cutoff,
    normalized_auto_confirm
  )
  on conflict (business_id)
  do update set
    minimum_notice_minutes = excluded.minimum_notice_minutes,
    booking_window_days = excluded.booking_window_days,
    buffer_after_minutes = excluded.buffer_after_minutes,
    cancellation_cutoff_minutes = excluded.cancellation_cutoff_minutes,
    reschedule_cutoff_minutes = excluded.reschedule_cutoff_minutes,
    auto_confirm = excluded.auto_confirm
  returning id into saved_settings_id;

  update public.profiles
  set onboarding_step = 'link'
  where id = current_user_id
    and onboarding_completed = false;

  return saved_settings_id;
end;
$$;

revoke all on function public.save_onboarding_booking_settings(jsonb) from public, anon;
grant execute on function public.save_onboarding_booking_settings(jsonb) to authenticated;

commit;
