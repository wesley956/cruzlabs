begin;

alter table public.profiles
  add column terms_accepted_at timestamptz,
  add column terms_version text,
  add column privacy_accepted_at timestamptz,
  add column privacy_version text,
  add constraint profiles_terms_consent_pair_check check (
    (terms_accepted_at is null and terms_version is null)
    or
    (terms_accepted_at is not null and terms_version is not null)
  ),
  add constraint profiles_privacy_consent_pair_check check (
    (privacy_accepted_at is null and privacy_version is null)
    or
    (privacy_accepted_at is not null and privacy_version is not null)
  );

comment on column public.profiles.terms_accepted_at is
  'Momento em que a pessoa declarou aceitar os Termos de Uso durante o cadastro.';
comment on column public.profiles.terms_version is
  'Versão dos Termos de Uso aceita no cadastro.';
comment on column public.profiles.privacy_accepted_at is
  'Momento em que a pessoa declarou aceitar a Política de Privacidade durante o cadastro.';
comment on column public.profiles.privacy_version is
  'Versão da Política de Privacidade aceita no cadastro.';

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text;
  accepted_terms boolean;
  accepted_privacy boolean;
begin
  requested_name := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');
  accepted_terms := coalesce(new.raw_user_meta_data ->> 'terms_accepted', 'false') = 'true';
  accepted_privacy := coalesce(new.raw_user_meta_data ->> 'privacy_accepted', 'false') = 'true';

  insert into public.profiles (
    id,
    full_name,
    whatsapp,
    terms_accepted_at,
    terms_version,
    privacy_accepted_at,
    privacy_version
  )
  values (
    new.id,
    coalesce(requested_name, 'Profissional'),
    nullif(
      regexp_replace(coalesce(new.raw_user_meta_data ->> 'whatsapp', ''), '[^0-9+]', '', 'g'),
      ''
    ),
    case when accepted_terms then timezone('utc', now()) end,
    case
      when accepted_terms then coalesce(
        nullif(new.raw_user_meta_data ->> 'terms_version', ''),
        '2026-07-13'
      )
    end,
    case when accepted_privacy then timezone('utc', now()) end,
    case
      when accepted_privacy then coalesce(
        nullif(new.raw_user_meta_data ->> 'privacy_version', ''),
        '2026-07-13'
      )
    end
  );

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

commit;
