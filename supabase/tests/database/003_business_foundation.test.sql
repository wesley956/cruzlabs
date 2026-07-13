begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

select has_table(
  'public',
  'profession_templates',
  'profession_templates table exists'
);
select has_table('public', 'businesses', 'businesses table exists');
select has_column('public', 'businesses', 'owner_id', 'business owner exists');
select has_column('public', 'businesses', 'profession_key', 'business profession exists');
select has_column('public', 'businesses', 'address_visibility', 'address privacy exists');
select col_is_unique('public', 'businesses', 'owner_id', 'one business per owner is enforced');
select policies_are(
  'public',
  'profession_templates',
  array['profession_templates_select_active'],
  'profession templates expose only the expected policy'
);
select policies_are(
  'public',
  'businesses',
  array['businesses_select_own'],
  'businesses expose only the owner select policy'
);
select function_returns(
  'public',
  'owns_business',
  array['uuid'],
  'boolean',
  'owns_business returns boolean'
);
select function_returns(
  'public',
  'get_current_business_id',
  array[]::text[],
  'uuid',
  'get_current_business_id returns uuid'
);
select function_returns(
  'public',
  'save_onboarding_profession',
  array['text', 'text'],
  'uuid',
  'profession onboarding function returns uuid'
);
select results_eq(
  'select count(*) from public.profession_templates where is_active = true',
  'values (8::bigint)',
  'eight active profession templates are seeded'
);

select * from finish();
rollback;
