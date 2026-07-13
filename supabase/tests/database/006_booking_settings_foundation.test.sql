begin;

create extension if not exists pgtap with schema extensions;

select plan(11);

select has_table('public', 'booking_settings', 'booking_settings table exists');
select has_column(
  'public',
  'booking_settings',
  'minimum_notice_minutes',
  'minimum notice exists'
);
select has_column(
  'public',
  'booking_settings',
  'booking_window_days',
  'booking window exists'
);
select has_column(
  'public',
  'booking_settings',
  'buffer_after_minutes',
  'buffer after service exists'
);
select has_column(
  'public',
  'booking_settings',
  'cancellation_cutoff_minutes',
  'cancellation cutoff exists'
);
select has_column(
  'public',
  'booking_settings',
  'reschedule_cutoff_minutes',
  'reschedule cutoff exists'
);
select has_column(
  'public',
  'booking_settings',
  'auto_confirm',
  'automatic confirmation setting exists'
);
select col_is_unique(
  'public',
  'booking_settings',
  'business_id',
  'one booking settings row per business is enforced'
);
select policies_are(
  'public',
  'booking_settings',
  array['booking_settings_select_own'],
  'booking settings expose only the owner select policy'
);
select function_returns(
  'public',
  'save_onboarding_booking_settings',
  array['jsonb'],
  'uuid',
  'booking settings onboarding function returns uuid'
);
select table_privs_are(
  'public',
  'booking_settings',
  'authenticated',
  array['SELECT'],
  'authenticated can read owned settings but writes use secure functions'
);

select * from finish();
rollback;
