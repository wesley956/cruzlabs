begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

select has_table('public', 'reserved_slugs', 'reserved_slugs table exists');
select has_table('public', 'business_slug_history', 'business_slug_history table exists');
select has_table('public', 'subscriptions', 'subscriptions table exists');
select has_column('public', 'profiles', 'onboarding_completed_at', 'onboarding completion date exists');
select has_column('public', 'profiles', 'trial_started_at', 'profile trial start exists');
select has_column('public', 'subscriptions', 'provider', 'subscription provider exists');
select has_column('public', 'subscriptions', 'trial_ends_at', 'subscription trial end exists');
select has_column(
  'public',
  'subscriptions',
  'provider_subscription_id',
  'Mercado Pago subscription identifier exists'
);
select col_is_unique(
  'public',
  'subscriptions',
  'business_id',
  'one subscription per business is enforced'
);
select policies_are(
  'public',
  'subscriptions',
  array['subscriptions_select_own'],
  'subscriptions expose only the owner select policy'
);
select policies_are(
  'public',
  'business_slug_history',
  array['business_slug_history_select_own'],
  'slug history exposes only the owner select policy'
);
select function_returns(
  'public',
  'is_public_slug_available',
  array['text'],
  'boolean',
  'slug availability function returns boolean'
);
select function_returns(
  'public',
  'save_onboarding_slug',
  array['text'],
  'text',
  'onboarding slug function returns text'
);
select function_returns(
  'public',
  'publish_onboarding_business',
  array[]::text[],
  'jsonb',
  'publication function returns jsonb'
);
select function_returns(
  'public',
  'get_public_business_page',
  array['text'],
  'jsonb',
  'public business page function returns jsonb'
);
select table_privs_are(
  'public',
  'subscriptions',
  'authenticated',
  array['SELECT'],
  'authenticated can read owned subscription but writes use secure functions'
);
select results_eq(
  'select count(*) from public.reserved_slugs',
  'values (28::bigint)',
  'twenty-eight protected routes and brand slugs are reserved'
);
select results_eq(
  $$select public.get_public_business_page('slug-that-does-not-exist') is null$$,
  'values (true)',
  'unknown public slugs do not expose business data'
);

select * from finish();
rollback;
