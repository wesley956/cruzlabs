begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

select has_table('public', 'availability_periods', 'availability_periods table exists');
select has_column('public', 'availability_periods', 'weekday', 'availability weekday exists');
select has_column('public', 'availability_periods', 'start_time', 'availability start time exists');
select has_column('public', 'availability_periods', 'end_time', 'availability end time exists');
select policies_are(
  'public',
  'availability_periods',
  array['availability_periods_select_own'],
  'availability periods expose only the owner select policy'
);
select function_returns(
  'public',
  'save_onboarding_availability',
  array['jsonb'],
  'integer',
  'availability onboarding function returns the saved count'
);
select table_privs_are(
  'public',
  'availability_periods',
  'authenticated',
  array['SELECT'],
  'authenticated can read owned availability but writes use secure functions'
);
select col_not_null(
  'public',
  'availability_periods',
  'business_id',
  'availability always belongs to a business'
);

select * from finish();
rollback;
