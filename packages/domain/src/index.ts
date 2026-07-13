export const APPOINTMENT_STATUSES = ["confirmed", "completed", "canceled", "no_show"] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "suspended",
  "expired",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const DEFAULT_TIMEZONE = "America/Sao_Paulo";
export const TRIAL_DAYS = 15;
export const INDIVIDUAL_PLAN_PRICE_CENTS = 2990;
