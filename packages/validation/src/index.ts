const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BRAZIL_PHONE_PATTERN = /^55\d{10,11}$/;
const SLUG_PATTERN = /^(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*(?<!-)$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(value));
}

export function normalizeBrazilPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function isValidBrazilPhone(value: string): boolean {
  return BRAZIL_PHONE_PATTERN.test(normalizeBrazilPhone(value));
}

export function isValidPublicSlug(value: string): boolean {
  return value.length >= 3 && value.length <= 50 && SLUG_PATTERN.test(value);
}
