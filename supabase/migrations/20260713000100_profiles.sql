begin;

create schema if not exists internal;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 80),
  whatsapp text,
  onboarding_step text not null default 'welcome',
  onboarding_completed boolean not null default false,
  onboarding_completed_at timestamptz,
  trial_started_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_completed_date_check check (
    (onboarding_completed = false and onboarding_completed_at is null)
    or
    (onboarding_completed = true and onboarding_completed_at is not null)
  )
);

comment on table public.profiles is 'Perfil privado da profissional autenticada.';
comment on column public.profiles.trial_started_at is 'Controlado exclusivamente por função segura no servidor.';

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text;
begin
  requested_name := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');

  insert into public.profiles (id, full_name, whatsapp)
  values (
    new.id,
    coalesce(requested_name, 'Profissional'),
    nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'whatsapp', ''), '[^0-9+]', '', 'g'), '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, whatsapp) on table public.profiles to authenticated;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

commit;
