begin;

create extension if not exists pgcrypto with schema extensions;

create table public.profession_templates (
  key text primary key check (key ~ '^[a-z0-9_]+$'),
  name text not null check (char_length(trim(name)) between 2 and 80),
  description text,
  icon_key text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger profession_templates_set_updated_at
before update on public.profession_templates
for each row execute function public.set_updated_at();

insert into public.profession_templates (
  key,
  name,
  description,
  icon_key,
  display_order
)
values
  ('manicure_pedicure', 'Manicure e pedicure', 'Cuidados, esmaltação e serviços para unhas.', 'sparkles', 10),
  ('brow_designer', 'Designer de sobrancelhas', 'Design, correção e cuidados com sobrancelhas.', 'eye', 20),
  ('lash_designer', 'Lash designer', 'Extensão, manutenção e cuidados com cílios.', 'eye', 30),
  ('hairdresser', 'Cabeleireira', 'Cortes, tratamentos, escovas e coloração.', 'scissors', 40),
  ('barber', 'Barbeiro', 'Cabelo, barba e cuidados masculinos.', 'scissors', 50),
  ('esthetician', 'Esteticista', 'Procedimentos estéticos e cuidados pessoais.', 'flower', 60),
  ('makeup_artist', 'Maquiadora', 'Maquiagem social, profissional e para eventos.', 'palette', 70),
  ('other', 'Outra atividade', 'Uma atividade diferente das opções apresentadas.', 'briefcase', 999);

create table public.businesses (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text check (business_name is null or char_length(trim(business_name)) between 2 and 80),
  profession_key text not null references public.profession_templates(key),
  custom_profession text check (
    custom_profession is null or char_length(trim(custom_profession)) between 2 and 80
  ),
  public_profession_name text check (
    public_profession_name is null
    or char_length(trim(public_profession_name)) between 2 and 80
  ),
  whatsapp text check (whatsapp is null or whatsapp ~ '^55[0-9]{10,11}$'),
  description text check (description is null or char_length(description) <= 300),
  instagram_username text check (
    instagram_username is null or char_length(instagram_username) <= 100
  ),
  city text check (city is null or char_length(trim(city)) between 2 and 80),
  state text check (state is null or state ~ '^[A-Z]{2}$'),
  timezone text not null default 'America/Sao_Paulo',
  service_location_type text check (
    service_location_type is null
    or service_location_type in ('own_space', 'home_service', 'mixed', 'arranged_location')
  ),
  address_visibility text not null default 'city' check (
    address_visibility in ('full', 'neighborhood_city', 'city', 'hidden')
  ),
  postal_code text check (postal_code is null or postal_code ~ '^[0-9]{8}$'),
  street text check (street is null or char_length(trim(street)) <= 120),
  number text check (number is null or char_length(trim(number)) <= 20),
  complement text check (complement is null or char_length(trim(complement)) <= 80),
  neighborhood text check (neighborhood is null or char_length(trim(neighborhood)) <= 80),
  image_path text,
  theme_key text not null default 'essencia_nobre',
  slug text unique check (
    slug is null
    or (
      char_length(slug) between 3 and 50
      and slug ~ '^(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*(?<!-)$'
    )
  ),
  public_status text not null default 'draft' check (
    public_status in ('draft', 'published', 'paused', 'subscription_inactive', 'suspended')
  ),
  is_published boolean not null default false,
  published_at timestamptz,
  online_booking_paused boolean not null default false,
  paused_at timestamptz,
  pause_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint businesses_custom_profession_check check (
    (profession_key = 'other' and custom_profession is not null)
    or
    (profession_key <> 'other')
  ),
  constraint businesses_publish_date_check check (
    (is_published = false and published_at is null)
    or
    (is_published = true and published_at is not null)
  )
);

create index businesses_owner_id_idx on public.businesses(owner_id);
create index businesses_public_status_idx on public.businesses(public_status);

create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

alter table public.profession_templates enable row level security;
alter table public.businesses enable row level security;

create policy "profession_templates_select_active"
on public.profession_templates
for select
to authenticated
using (is_active = true);

create policy "businesses_select_own"
on public.businesses
for select
to authenticated
using ((select auth.uid()) = owner_id);

revoke all on table public.profession_templates from anon, authenticated;
grant select on table public.profession_templates to authenticated;

revoke all on table public.businesses from anon, authenticated;
grant select on table public.businesses to authenticated;

create or replace function public.owns_business(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.businesses
    where id = target_business_id
      and owner_id = auth.uid()
  );
$$;

create or replace function public.get_current_business_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from public.businesses
  where owner_id = auth.uid()
  limit 1;
$$;

create or replace function public.save_onboarding_profession(
  selected_profession_key text,
  selected_custom_profession text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_key text := lower(trim(selected_profession_key));
  normalized_custom text := nullif(trim(selected_custom_profession), '');
  template_name text;
  profile_whatsapp text;
  saved_business_id uuid;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  select name
    into template_name
  from public.profession_templates
  where key = normalized_key
    and is_active = true;

  if template_name is null then
    raise exception 'invalid_profession';
  end if;

  if normalized_key = 'other' then
    if normalized_custom is null or char_length(normalized_custom) not between 2 and 80 then
      raise exception 'custom_profession_required';
    end if;

    template_name := normalized_custom;
  else
    normalized_custom := null;
  end if;

  select whatsapp
    into profile_whatsapp
  from public.profiles
  where id = current_user_id;

  insert into public.businesses (
    owner_id,
    profession_key,
    custom_profession,
    public_profession_name,
    whatsapp
  )
  values (
    current_user_id,
    normalized_key,
    normalized_custom,
    template_name,
    profile_whatsapp
  )
  on conflict (owner_id)
  do update set
    profession_key = excluded.profession_key,
    custom_profession = excluded.custom_profession,
    public_profession_name = case
      when public.businesses.public_profession_name is null
        or public.businesses.public_profession_name = (
          select name
          from public.profession_templates
          where key = public.businesses.profession_key
        )
      then excluded.public_profession_name
      else public.businesses.public_profession_name
    end
  returning id into saved_business_id;

  update public.profiles
  set onboarding_step = 'business'
  where id = current_user_id
    and onboarding_completed = false;

  return saved_business_id;
end;
$$;

create or replace function public.save_onboarding_business(
  selected_business_name text,
  selected_public_profession_name text,
  selected_whatsapp text,
  selected_description text,
  selected_instagram_username text,
  selected_city text,
  selected_state text,
  selected_service_location_type text,
  selected_address_visibility text,
  selected_postal_code text default null,
  selected_street text default null,
  selected_number text default null,
  selected_complement text default null,
  selected_neighborhood text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_business_name text := trim(selected_business_name);
  normalized_profession_name text := trim(selected_public_profession_name);
  normalized_whatsapp text := regexp_replace(coalesce(selected_whatsapp, ''), '[^0-9]', '', 'g');
  normalized_description text := nullif(trim(selected_description), '');
  normalized_instagram text := nullif(
    regexp_replace(trim(coalesce(selected_instagram_username, '')), '^@', ''),
    ''
  );
  normalized_city text := trim(selected_city);
  normalized_state text := upper(trim(selected_state));
  normalized_postal_code text := nullif(
    regexp_replace(coalesce(selected_postal_code, ''), '[^0-9]', '', 'g'),
    ''
  );
  saved_business_id uuid;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  if char_length(normalized_business_name) not between 2 and 80 then
    raise exception 'invalid_business_name';
  end if;

  if char_length(normalized_profession_name) not between 2 and 80 then
    raise exception 'invalid_public_profession_name';
  end if;

  if normalized_whatsapp !~ '^55[0-9]{10,11}$' then
    raise exception 'invalid_whatsapp';
  end if;

  if normalized_description is not null and char_length(normalized_description) > 300 then
    raise exception 'description_too_long';
  end if;

  if normalized_instagram is not null and char_length(normalized_instagram) > 100 then
    raise exception 'instagram_too_long';
  end if;

  if char_length(normalized_city) not between 2 and 80 then
    raise exception 'invalid_city';
  end if;

  if normalized_state !~ '^[A-Z]{2}$' then
    raise exception 'invalid_state';
  end if;

  if selected_service_location_type not in (
    'own_space',
    'home_service',
    'mixed',
    'arranged_location'
  ) then
    raise exception 'invalid_service_location_type';
  end if;

  if selected_address_visibility not in ('full', 'neighborhood_city', 'city', 'hidden') then
    raise exception 'invalid_address_visibility';
  end if;

  if normalized_postal_code is not null and normalized_postal_code !~ '^[0-9]{8}$' then
    raise exception 'invalid_postal_code';
  end if;

  if selected_address_visibility = 'full' and nullif(trim(selected_street), '') is null then
    raise exception 'street_required_for_full_address';
  end if;

  update public.businesses
  set
    business_name = normalized_business_name,
    public_profession_name = normalized_profession_name,
    whatsapp = normalized_whatsapp,
    description = normalized_description,
    instagram_username = normalized_instagram,
    city = normalized_city,
    state = normalized_state,
    service_location_type = selected_service_location_type,
    address_visibility = selected_address_visibility,
    postal_code = normalized_postal_code,
    street = nullif(trim(selected_street), ''),
    number = nullif(trim(selected_number), ''),
    complement = nullif(trim(selected_complement), ''),
    neighborhood = nullif(trim(selected_neighborhood), '')
  where owner_id = current_user_id
  returning id into saved_business_id;

  if saved_business_id is null then
    raise exception 'business_not_initialized';
  end if;

  update public.profiles
  set onboarding_step = 'services'
  where id = current_user_id
    and onboarding_completed = false;

  return saved_business_id;
end;
$$;

revoke all on function public.owns_business(uuid) from public, anon;
revoke all on function public.get_current_business_id() from public, anon;
revoke all on function public.save_onboarding_profession(text, text) from public, anon;
revoke all on function public.save_onboarding_business(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) from public, anon;

grant execute on function public.owns_business(uuid) to authenticated;
grant execute on function public.get_current_business_id() to authenticated;
grant execute on function public.save_onboarding_profession(text, text) to authenticated;
grant execute on function public.save_onboarding_business(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;

commit;
