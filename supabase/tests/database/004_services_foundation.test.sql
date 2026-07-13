begin;

create extension if not exists pgtap with schema extensions;

select plan(11);

select has_table('public', 'service_templates', 'service_templates table exists');
select has_table('public', 'services', 'services table exists');
select has_column('public', 'services', 'business_id', 'service belongs to a business');
select has_column('public', 'services', 'duration_minutes', 'service duration exists');
select has_column('public', 'services', 'price_cents', 'service price exists');
select has_column(
  'public',
  'services',
  'online_booking_enabled',
  'online booking visibility exists'
);
select policies_are(
  'public',
  'service_templates',
  array['service_templates_select_active'],
  'service templates expose only the expected policy'
);
select policies_are(
  'public',
  'services',
  array['services_select_own'],
  'services expose only the owner select policy'
);
select function_returns(
  'public',
  'save_onboarding_services',
  array['jsonb'],
  'integer',
  'service onboarding function returns the saved count'
);
select results_eq(
  'select count(*) from public.service_templates where is_active = true',
  'values (23::bigint)',
  'twenty-three active service templates are seeded'
);
select table_privs_are(
  'public',
  'services',
  'authenticated',
  array['SELECT'],
  'authenticated can read owned services but writes use secure functions'
);

select * from finish();
rollback;
