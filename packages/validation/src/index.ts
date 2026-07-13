export * from "./auth";
export * from "./availability";
export * from "./booking-rules";
export * from "./onboarding";
export * from "./public-link";
export * from "./services";

const SLUG_PATTERN = /^(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*(?<!-)$/;

export function isValidPublicSlug(value: string): boolean {
  return value.length >= 3 && value.length <= 50 && SLUG_PATTERN.test(value);
}
