begin;

select plan(6);

select has_column(
  'public',
  'profiles',
  'terms_accepted_at',
  'profiles.terms_accepted_at exists'
);
select has_column(
  'public',
  'profiles',
  'terms_version',
  'profiles.terms_version exists'
);
select has_column(
  'public',
  'profiles',
  'privacy_accepted_at',
  'profiles.privacy_accepted_at exists'
);
select has_column(
  'public',
  'profiles',
  'privacy_version',
  'profiles.privacy_version exists'
);
select col_not_null(
  'public',
  'profiles',
  'id',
  'profile identity remains required'
);
select function_returns(
  'public',
  'handle_new_auth_user',
  array[]::text[],
  'trigger',
  'profile creation trigger function remains available'
);

select * from finish();
rollback;
