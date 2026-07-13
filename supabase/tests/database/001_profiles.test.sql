begin;

select plan(6);

select has_table('public', 'profiles', 'profiles table exists');
select has_column('public', 'profiles', 'id', 'profiles.id exists');
select has_column('public', 'profiles', 'onboarding_completed', 'onboarding flag exists');
select col_is_pk('public', 'profiles', 'id', 'profiles.id is the primary key');
select policies_are(
  'public',
  'profiles',
  array['profiles_select_own', 'profiles_update_own'],
  'profiles has the expected RLS policies'
);
select table_privs_are(
  'authenticated',
  'public',
  'profiles',
  array['SELECT'],
  'authenticated has table-level select only; profile edits use column grants'
);

select * from finish();
rollback;
