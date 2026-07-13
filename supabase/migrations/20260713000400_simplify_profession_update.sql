begin;

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
    public_profession_name = excluded.public_profession_name
  returning id into saved_business_id;

  update public.profiles
  set onboarding_step = 'business'
  where id = current_user_id
    and onboarding_completed = false;

  return saved_business_id;
end;
$$;

revoke all on function public.save_onboarding_profession(text, text) from public, anon;
grant execute on function public.save_onboarding_profession(text, text) to authenticated;

commit;
