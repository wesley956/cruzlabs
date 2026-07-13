export type SignUpInput = {
  fullName: string;
  email: string;
  whatsapp: string;
  password: string;
  passwordConfirmation: string;
  acceptedTerms: boolean;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type PasswordResetInput = {
  password: string;
  passwordConfirmation: string;
};

export type AuthFieldErrors = Partial<
  Record<"fullName" | "email" | "whatsapp" | "password" | "passwordConfirmation" | "terms", string>
>;

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

type ValidationFailure = {
  success: false;
  fieldErrors: AuthFieldErrors;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BRAZIL_PHONE_PATTERN = /^55\d{10,11}$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const email = normalizeEmail(value);
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

export function normalizeBrazilPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  return `55${digits}`;
}

export function isValidBrazilPhone(value: string): boolean {
  return BRAZIL_PHONE_PATTERN.test(normalizeBrazilPhone(value));
}

function validatePassword(password: string): string | undefined {
  if (password.length < 8) {
    return "Use pelo menos 8 caracteres.";
  }

  if (password.length > 72) {
    return "A senha pode ter no máximo 72 caracteres.";
  }

  return undefined;
}

export function validateSignUpInput(input: SignUpInput): ValidationResult<SignUpInput> {
  const fieldErrors: AuthFieldErrors = {};
  const fullName = input.fullName.trim().replace(/\s+/g, " ");
  const email = normalizeEmail(input.email);
  const whatsapp = normalizeBrazilPhone(input.whatsapp);

  if (fullName.length < 2 || fullName.length > 80) {
    fieldErrors.fullName = "Informe um nome entre 2 e 80 caracteres.";
  }

  if (!isValidEmail(email)) {
    fieldErrors.email = "Informe um e-mail válido.";
  }

  if (!isValidBrazilPhone(whatsapp)) {
    fieldErrors.whatsapp = "Informe um WhatsApp brasileiro com DDD.";
  }

  const passwordError = validatePassword(input.password);
  if (passwordError) {
    fieldErrors.password = passwordError;
  }

  if (input.password !== input.passwordConfirmation) {
    fieldErrors.passwordConfirmation = "As senhas não são iguais.";
  }

  if (!input.acceptedTerms) {
    fieldErrors.terms = "Você precisa aceitar os Termos e a Política de Privacidade.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      ...input,
      fullName,
      email,
      whatsapp,
    },
  };
}

export function validateLoginInput(input: LoginInput): ValidationResult<LoginInput> {
  const fieldErrors: AuthFieldErrors = {};
  const email = normalizeEmail(input.email);

  if (!isValidEmail(email)) {
    fieldErrors.email = "Informe um e-mail válido.";
  }

  if (!input.password) {
    fieldErrors.password = "Informe sua senha.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return { success: true, data: { email, password: input.password } };
}

export function validatePasswordResetInput(
  input: PasswordResetInput,
): ValidationResult<PasswordResetInput> {
  const fieldErrors: AuthFieldErrors = {};
  const passwordError = validatePassword(input.password);

  if (passwordError) {
    fieldErrors.password = passwordError;
  }

  if (input.password !== input.passwordConfirmation) {
    fieldErrors.passwordConfirmation = "As senhas não são iguais.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return { success: true, data: input };
}
