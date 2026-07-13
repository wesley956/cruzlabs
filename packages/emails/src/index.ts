export const EMAIL_TEMPLATE_KEYS = [
  "booking_confirmation",
  "booking_reminder",
  "booking_canceled",
  "booking_rescheduled",
  "daily_summary",
  "trial_ending",
] as const;

export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];
