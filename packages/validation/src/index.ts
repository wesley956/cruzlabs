export * from "./auth";
export * from "./onboarding";
export * from "./services";

const SLUG_PATTERN = /^(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*(?<!-)$/;

export function isValidPublicSlug(value: string): boolean {
  return value.length >= 3 && value.length <= 50 && SLUG_PATTERN.test(value);
}
