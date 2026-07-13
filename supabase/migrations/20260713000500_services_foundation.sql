begin;

create table public.service_templates (
  id uuid primary key default extensions.gen_random_uuid(),
  profession_key text not null references public.profession_templates(key) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 100),
  description text check (description is null or char_length(description) <= 300),
  suggested_duration_minutes integer not null check (
    suggested_duration_minutes between 5 and 720
  ),
  suggested_price_cents integer check (
    suggested_price_cents is null or suggested_price_cents >= 0
  ),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (profession_key, name)
);

create index service_templates_profession_order_idx
  on public.service_templates(profession_key, display_order)
  where is_active = true;

create trigger service_templates_set_updated_at
before update on public.service_templates
for each row execute function public.set_updated_at();

insert into public.service_templates (
  profession_key,
  name,
  description,
  suggested_duration_minutes,
  suggested_price_cents,
  display_order
)
values
  ('manicure_pedicure', 'Manicure', 'Cuidado e esmaltação das unhas das mãos.', 60, 3500, 10),
  ('manicure_pedicure', 'Pedicure', 'Cuidado e esmaltação das unhas dos pés.', 60, 4000, 20),
  ('manicure_pedicure', 'Manicure e pedicure', 'Atendimento completo para mãos e pés.', 120, 7000, 30),
  ('manicure_pedicure', 'Esmaltação em gel', 'Esmaltação de maior durabilidade.', 90, 6500, 40),
  ('brow_designer', 'Design de sobrancelhas', 'Modelagem de acordo com o formato do rosto.', 45, 4500, 10),
  ('brow_designer', 'Design com henna', 'Design e aplicação de henna.', 60, 6000, 20),
  ('brow_designer', 'Brow lamination', 'Alinhamento e definição dos fios.', 75, 12000, 30),
  ('lash_designer', 'Extensão fio a fio', 'Aplicação clássica de extensão de cílios.', 150, 16000, 10),
  ('lash_designer', 'Volume brasileiro', 'Extensão com efeito de maior volume.', 180, 19000, 20),
  ('lash_designer', 'Manutenção de cílios', 'Manutenção da extensão existente.', 120, 12000, 30),
  ('hairdresser', 'Corte feminino', 'Corte e finalização.', 60, 8000, 10),
  ('hairdresser', 'Escova', 'Lavagem e escova.', 60, 6000, 20),
  ('hairdresser', 'Coloração', 'Aplicação de coloração e finalização.', 180, null, 30),
  ('hairdresser', 'Hidratação', 'Tratamento e finalização dos fios.', 90, 9000, 40),
  ('barber', 'Corte masculino', 'Corte e acabamento.', 45, 4500, 10),
  ('barber', 'Barba', 'Modelagem e acabamento da barba.', 30, 3000, 20),
  ('barber', 'Corte e barba', 'Atendimento completo de cabelo e barba.', 75, 7000, 30),
  ('esthetician', 'Limpeza de pele', 'Higienização e cuidados faciais.', 90, 14000, 10),
  ('esthetician', 'Massagem relaxante', 'Sessão de massagem para relaxamento.', 60, 12000, 20),
  ('esthetician', 'Drenagem linfática', 'Sessão de drenagem manual.', 60, 13000, 30),
  ('makeup_artist', 'Maquiagem social', 'Maquiagem para compromissos e eventos.', 90, 15000, 10),
  ('makeup_artist', 'Maquiagem para noiva', 'Maquiagem especial para casamento.', 150, null, 20),
  ('makeup_artist', 'Maquiagem express', 'Produção leve e rápida.', 45, 9000, 30);

create table public.services (
  id uuid primary key default extensions.gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  template_id uuid references public.service_templates(id) on delete set null,
  name text not null check (char_length(trim(name)) between 2 and 100),
  description text check (description is null or char_length(description) <= 300),
  duration_minutes integer not null check (duration_minutes between 5 and 720),
  price_cents integer check (price_cents is null or price_cents >= 0),
  show_price boolean not null default true,
  online_booking_enabled boolean not null default true,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_source text not null default 'onboarding' check (
    created_source in ('onboarding', 'professional', 'admin', 'import')
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  constraint services_archive_state_check check (
    (is_active = true and archived_at is null)
    or
    (is_active = false)
  )
);

create unique index services_business_active_name_unique
  on public.services(business_id, lower(trim(name)))
  where is_active = true;

create index services_business_display_order_idx
  on public.services(business_id, display_order)
  where is_active = true;

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

alter table public.service_templates enable row level security;
alter table public.services enable row level security;

create policy "service_templates_select_active"
on public.service_templates
for select
to authenticated
using (is_active = true);

create policy "services_select_own"
on public.services
for select
to authenticated
using (public.owns_business(business_id));

revoke all on table public.service_templates from anon, authenticated;
grant select on table public.service_templates to authenticated;

revoke all on table public.services from anon, authenticated;
grant select on table public.services to authenticated;

create or replace function public.save_onboarding_services(selected_services jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_business_id uuid;
  current_profession_key text;
  onboarding_is_completed boolean;
  service_item jsonb;
  item_position bigint;
  normalized_name text;
  normalized_description text;
  normalized_template_id uuid;
  normalized_duration integer;
  normalized_price integer;
  normalized_show_price boolean;
  normalized_online_booking boolean;
  saved_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  if jsonb_typeof(selected_services) <> 'array' then
    raise exception 'services_must_be_array';
  end if;

  if jsonb_array_length(selected_services) < 1 then
    raise exception 'at_least_one_service_required';
  end if;

  if jsonb_array_length(selected_services) > 30 then
    raise exception 'too_many_services';
  end if;

  select
    b.id,
    b.profession_key,
    p.onboarding_completed
  into
    current_business_id,
    current_profession_key,
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

  delete from public.services
  where business_id = current_business_id;

  for service_item, item_position in
    select value, ordinality
    from jsonb_array_elements(selected_services) with ordinality
  loop
    normalized_name := trim(coalesce(service_item ->> 'name', ''));
    normalized_description := nullif(trim(service_item ->> 'description'), '');

    if char_length(normalized_name) not between 2 and 100 then
      raise exception 'invalid_service_name';
    end if;

    if normalized_description is not null and char_length(normalized_description) > 300 then
      raise exception 'service_description_too_long';
    end if;

    if coalesce(service_item ->> 'duration_minutes', '') !~ '^[0-9]+$' then
      raise exception 'invalid_service_duration';
    end if;

    normalized_duration := (service_item ->> 'duration_minutes')::integer;

    if normalized_duration not between 5 and 720 then
      raise exception 'invalid_service_duration';
    end if;

    if nullif(service_item ->> 'price_cents', '') is null then
      normalized_price := null;
    elsif (service_item ->> 'price_cents') ~ '^[0-9]+$' then
      normalized_price := (service_item ->> 'price_cents')::integer;
    else
      raise exception 'invalid_service_price';
    end if;

    if normalized_price is not null and normalized_price > 100000000 then
      raise exception 'invalid_service_price';
    end if;

    normalized_show_price := coalesce((service_item ->> 'show_price')::boolean, true);
    normalized_online_booking := coalesce(
      (service_item ->> 'online_booking_enabled')::boolean,
      true
    );

    if nullif(service_item ->> 'template_id', '') is null then
      normalized_template_id := null;
    else
      begin
        normalized_template_id := (service_item ->> 'template_id')::uuid;
      exception
        when invalid_text_representation then
          raise exception 'invalid_service_template';
      end;

      if not exists (
        select 1
        from public.service_templates st
        where st.id = normalized_template_id
          and st.profession_key = current_profession_key
          and st.is_active = true
      ) then
        raise exception 'invalid_service_template';
      end if;
    end if;

    insert into public.services (
      business_id,
      template_id,
      name,
      description,
      duration_minutes,
      price_cents,
      show_price,
      online_booking_enabled,
      display_order,
      created_source
    )
    values (
      current_business_id,
      normalized_template_id,
      normalized_name,
      normalized_description,
      normalized_duration,
      normalized_price,
      normalized_show_price,
      normalized_online_booking,
      item_position::integer * 10,
      'onboarding'
    );

    saved_count := saved_count + 1;
  end loop;

  update public.profiles
  set onboarding_step = 'availability'
  where id = current_user_id
    and onboarding_completed = false;

  return saved_count;
end;
$$;

revoke all on function public.save_onboarding_services(jsonb) from public, anon;
grant execute on function public.save_onboarding_services(jsonb) to authenticated;

commit;
