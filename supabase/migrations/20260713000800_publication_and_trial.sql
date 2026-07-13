begin;

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists trial_started_at timestamptz;

create table public.reserved_slugs (
  slug text primary key check (
    char_length(slug) between 2 and 50
    and slug ~ '^(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*(?<!-)$'
  ),
  reason text not null default 'system',
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.reserved_slugs (slug, reason)
values
  ('admin', 'rota do sistema'),
  ('api', 'rota do sistema'),
  ('app', 'rota do sistema'),
  ('auth', 'rota do sistema'),
  ('agendamento', 'rota do sistema'),
  ('agenda', 'rota do sistema'),
  ('boas-vindas', 'rota do sistema'),
  ('configuracao', 'rota do sistema'),
  ('criar-conta', 'rota do sistema'),
  ('cruz', 'marca'),
  ('cruz-agenda', 'marca'),
  ('cruz-labs', 'marca'),
  ('cruzagenda', 'marca'),
  ('cruzlabs', 'marca'),
  ('entrar', 'rota do sistema'),
  ('esqueci-minha-senha', 'rota do sistema'),
  ('exemplo', 'demonstração'),
  ('login', 'rota do sistema'),
  ('logout', 'rota do sistema'),
  ('minha-pagina', 'rota do sistema'),
  ('painel', 'rota do sistema'),
  ('privacidade', 'documento legal'),
  ('redefinir-senha', 'rota do sistema'),
  ('servicos', 'rota do sistema'),
  ('suporte', 'rota institucional'),
  ('termos', 'documento legal'),
  ('verificar-email', 'rota do sistema'),
  ('www', 'infraestrutura')
on conflict (slug) do nothing;

create table public.business_slug_history (
  id uuid primary key default extensions.gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  old_slug text not null unique check (
    char_length(old_slug) between 3 and 50
    and old_slug ~ '^(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*(?<!-)$'
  ),
  new_slug text not null check (
    char_length(new_slug) between 3 and 50
    and new_slug ~ '^(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*(?<!-)$'
  ),
  changed_at timestamptz not null default timezone('utc', now()),
  is_redirect_active boolean not null default true
);

create index business_slug_history_business_id_idx
  on public.business_slug_history(business_id, changed_at desc);

create table public.subscriptions (
  id uuid primary key default extensions.gen_random_uuid(),
  business_id uuid not null unique references public.businesses(id) on delete cascade,
  provider text not null default 'mercado_pago' check (
    provider in ('mercado_pago')
  ),
  status text not null default 'trialing' check (
    status in ('trialing', 'active', 'past_due', 'canceled', 'suspended', 'expired')
  ),
  amount_cents integer not null default 2990 check (amount_cents >= 0),
  currency text not null default 'BRL' check (currency = 'BRL'),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  current_period_started_at timestamptz,
  current_period_ends_at timestamptz,
  canceled_at timestamptz,
  provider_customer_id text,
  provider_subscription_id text unique,
  provider_plan_id text,
  provider_status text,
  last_webhook_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint subscriptions_trial_dates_check check (
    (trial_started_at is null and trial_ends_at is null)
    or
    (trial_started_at is not null and trial_ends_at > trial_started_at)
  ),
  constraint subscriptions_current_period_check check (
    current_period_started_at is null
    or current_period_ends_at is null
    or current_period_ends_at > current_period_started_at
  )
);

create index subscriptions_status_idx on public.subscriptions(status);
create index subscriptions_trial_ends_at_idx
  on public.subscriptions(trial_ends_at)
  where status = 'trialing';

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

alter table public.reserved_slugs enable row level security;
alter table public.business_slug_history enable row level security;
alter table public.subscriptions enable row level security;

create policy "business_slug_history_select_own"
on public.business_slug_history
for select
to authenticated
using (public.owns_business(business_id));

create policy "subscriptions_select_own"
on public.subscriptions
for select
to authenticated
using (public.owns_business(business_id));

revoke all on table public.reserved_slugs from anon, authenticated;
revoke all on table public.business_slug_history from anon, authenticated;
revoke all on table public.subscriptions from anon, authenticated;

grant select on table public.business_slug_history to authenticated;
grant select on table public.subscriptions to authenticated;

create or replace function public.is_public_slug_available(selected_slug text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_business_id uuid := public.get_current_business_id();
  normalized_slug text := lower(trim(coalesce(selected_slug, '')));
begin
  if normalized_slug !~ '^(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*(?<!-)$'
    or char_length(normalized_slug) not between 3 and 50 then
    return false;
  end if;

  if exists (
    select 1
    from public.reserved_slugs
    where slug = normalized_slug
  ) then
    return false;
  end if;

  if exists (
    select 1
    from public.businesses
    where slug = normalized_slug
      and (current_business_id is null or id <> current_business_id)
  ) then
    return false;
  end if;

  if exists (
    select 1
    from public.business_slug_history
    where old_slug = normalized_slug
      and (current_business_id is null or business_id <> current_business_id)
  ) then
    return false;
  end if;

  return true;
end;
$$;

create or replace function public.save_onboarding_slug(selected_slug text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_business_id uuid;
  current_slug text;
  onboarding_is_completed boolean;
  normalized_slug text := lower(trim(coalesce(selected_slug, '')));
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  if normalized_slug !~ '^(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*(?<!-)$'
    or char_length(normalized_slug) not between 3 and 50 then
    raise exception 'invalid_public_slug';
  end if;

  select
    b.id,
    b.slug,
    p.onboarding_completed
  into
    current_business_id,
    current_slug,
    onboarding_is_completed
  from public.businesses b
  join public.profiles p on p.id = b.owner_id
  where b.owner_id = current_user_id
  for update of b, p;

  if current_business_id is null then
    raise exception 'business_not_initialized';
  end if;

  if onboarding_is_completed then
    raise exception 'onboarding_already_completed';
  end if;

  if not public.is_public_slug_available(normalized_slug) then
    raise exception 'public_slug_unavailable';
  end if;

  update public.businesses
  set slug = normalized_slug
  where id = current_business_id;

  update public.profiles
  set onboarding_step = 'link'
  where id = current_user_id
    and onboarding_completed = false;

  return normalized_slug;
exception
  when unique_violation then
    raise exception 'public_slug_unavailable';
end;
$$;

create or replace function public.publish_onboarding_business()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_business public.businesses%rowtype;
  current_profile public.profiles%rowtype;
  current_subscription public.subscriptions%rowtype;
  publication_time timestamptz := timezone('utc', now());
  trial_end_time timestamptz;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  select *
    into current_profile
  from public.profiles
  where id = current_user_id
  for update;

  select *
    into current_business
  from public.businesses
  where owner_id = current_user_id
  for update;

  if current_business.id is null then
    raise exception 'business_not_initialized';
  end if;

  if current_profile.onboarding_completed and current_business.is_published then
    select *
      into current_subscription
    from public.subscriptions
    where business_id = current_business.id;

    return jsonb_build_object(
      'slug', current_business.slug,
      'published_at', current_business.published_at,
      'trial_started_at', current_subscription.trial_started_at,
      'trial_ends_at', current_subscription.trial_ends_at,
      'already_published', true
    );
  end if;

  if current_business.business_name is null
    or current_business.public_profession_name is null
    or current_business.whatsapp is null
    or current_business.city is null
    or current_business.state is null
    or current_business.service_location_type is null then
    raise exception 'business_information_incomplete';
  end if;

  if current_business.slug is null
    or not public.is_public_slug_available(current_business.slug) then
    raise exception 'public_slug_unavailable';
  end if;

  if not exists (
    select 1
    from public.services
    where business_id = current_business.id
      and is_active = true
      and online_booking_enabled = true
  ) then
    raise exception 'online_service_required';
  end if;

  if not exists (
    select 1
    from public.availability_periods
    where business_id = current_business.id
      and is_active = true
  ) then
    raise exception 'availability_required';
  end if;

  if not exists (
    select 1
    from public.booking_settings
    where business_id = current_business.id
  ) then
    raise exception 'booking_settings_required';
  end if;

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
    current_business.id,
    'mercado_pago',
    'trialing',
    2990,
    'BRL',
    publication_time,
    publication_time + interval '15 days',
    publication_time,
    publication_time + interval '15 days'
  )
  on conflict (business_id) do nothing;

  select *
    into current_subscription
  from public.subscriptions
  where business_id = current_business.id
  for update;

  if current_subscription.trial_started_at is null
    or current_subscription.trial_ends_at is null then
    raise exception 'subscription_trial_not_initialized';
  end if;

  trial_end_time := current_subscription.trial_ends_at;

  update public.businesses
  set
    public_status = 'published',
    is_published = true,
    published_at = coalesce(published_at, publication_time),
    online_booking_paused = false,
    paused_at = null,
    pause_reason = null
  where id = current_business.id;

  update public.profiles
  set
    onboarding_step = 'completed',
    onboarding_completed = true,
    onboarding_completed_at = coalesce(onboarding_completed_at, publication_time),
    trial_started_at = coalesce(trial_started_at, current_subscription.trial_started_at)
  where id = current_user_id;

  return jsonb_build_object(
    'slug', current_business.slug,
    'published_at', publication_time,
    'trial_started_at', current_subscription.trial_started_at,
    'trial_ends_at', trial_end_time,
    'already_published', false
  );
end;
$$;

create or replace function public.get_public_business_page(selected_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_slug text := lower(trim(coalesce(selected_slug, '')));
  public_business public.businesses%rowtype;
  public_subscription public.subscriptions%rowtype;
  location_text text;
  service_list jsonb;
begin
  select b.*
    into public_business
  from public.businesses b
  where b.slug = normalized_slug
    and b.is_published = true
    and b.public_status = 'published';

  if public_business.id is null then
    return null;
  end if;

  select s.*
    into public_subscription
  from public.subscriptions s
  where s.business_id = public_business.id
    and (
      (s.status = 'trialing' and s.trial_ends_at > timezone('utc', now()))
      or
      (
        s.status = 'active'
        and (
          s.current_period_ends_at is null
          or s.current_period_ends_at > timezone('utc', now())
        )
      )
    );

  if public_subscription.id is null then
    return null;
  end if;

  location_text := case public_business.address_visibility
    when 'full' then concat_ws(
      ', ',
      nullif(public_business.street, ''),
      nullif(public_business.number, ''),
      nullif(public_business.complement, ''),
      nullif(public_business.neighborhood, ''),
      concat_ws(' - ', public_business.city, public_business.state)
    )
    when 'neighborhood_city' then concat_ws(
      ', ',
      nullif(public_business.neighborhood, ''),
      concat_ws(' - ', public_business.city, public_business.state)
    )
    when 'city' then concat_ws(' - ', public_business.city, public_business.state)
    else null
  end;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', service.id,
        'name', service.name,
        'description', service.description,
        'duration_minutes', service.duration_minutes,
        'price_cents', service.price_cents,
        'show_price', service.show_price
      )
      order by service.display_order, service.name
    ),
    '[]'::jsonb
  )
  into service_list
  from public.services service
  where service.business_id = public_business.id
    and service.is_active = true
    and service.online_booking_enabled = true;

  return jsonb_build_object(
    'slug', public_business.slug,
    'business_name', public_business.business_name,
    'public_profession_name', public_business.public_profession_name,
    'description', public_business.description,
    'instagram_username', public_business.instagram_username,
    'theme_key', public_business.theme_key,
    'image_path', public_business.image_path,
    'location_text', location_text,
    'service_location_type', public_business.service_location_type,
    'online_booking_paused', public_business.online_booking_paused,
    'services', service_list
  );
end;
$$;

revoke all on function public.is_public_slug_available(text) from public, anon;
revoke all on function public.save_onboarding_slug(text) from public, anon;
revoke all on function public.publish_onboarding_business() from public, anon;
revoke all on function public.get_public_business_page(text) from public;

grant execute on function public.is_public_slug_available(text) to authenticated;
grant execute on function public.save_onboarding_slug(text) to authenticated;
grant execute on function public.publish_onboarding_business() to authenticated;
grant execute on function public.get_public_business_page(text) to anon, authenticated;

commit;
