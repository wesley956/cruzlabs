"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import {
  isValidEmail,
  normalizeEmail,
  validateLoginInput,
  validatePasswordResetInput,
  validateSignUpInput,
  type AuthFieldErrors,
} from "@cruz-agenda/validation";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: AuthFieldErrors;
};

const TERMS_VERSION = "2026-07-13";
const PRIVACY_VERSION = "2026-07-13";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function getSafeInternalPath(value: string | null, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function mapSignUpError(message: string): string {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("rate limit")) {
    return "Muitas tentativas foram realizadas. Aguarde um pouco e tente novamente.";
  }

  if (normalizedMessage.includes("password")) {
    return "A senha informada não atende aos requisitos de segurança.";
  }

  return "Não foi possível criar sua conta. Revise os dados ou tente entrar com seu e-mail.";
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateSignUpInput({
    fullName: getFormString(formData, "fullName"),
    email: getFormString(formData, "email"),
    whatsapp: getFormString(formData, "whatsapp"),
    password: getFormString(formData, "password"),
    passwordConfirmation: getFormString(formData, "passwordConfirmation"),
    acceptedTerms: formData.get("terms") === "on",
  });

  if (!validation.success) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const acceptedAt = new Date().toISOString();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=/boas-vindas`,
      data: {
        full_name: validation.data.fullName,
        whatsapp: validation.data.whatsapp,
        terms_accepted: true,
        terms_accepted_at: acceptedAt,
        terms_version: TERMS_VERSION,
        privacy_accepted: true,
        privacy_accepted_at: acceptedAt,
        privacy_version: PRIVACY_VERSION,
      },
    },
  });

  if (error) {
    return {
      status: "error",
      message: mapSignUpError(error.message),
    };
  }

  if (data.session) {
    redirect("/boas-vindas");
  }

  redirect(`/verificar-email?email=${encodeURIComponent(validation.data.email)}`);
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateLoginInput({
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password"),
  });

  if (!validation.success) {
    return {
      status: "error",
      message: "Revise os dados de acesso.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(validation.data);

  if (error) {
    return {
      status: "error",
      message: "E-mail ou senha incorretos. Verifique os dados e tente novamente.",
    };
  }

  const { data: profile } = await supabase.from("profiles").select("onboarding_completed").single();

  if (!profile?.onboarding_completed) {
    redirect("/boas-vindas");
  }

  const nextPath = getSafeInternalPath(getFormString(formData, "next"), "/painel");
  redirect(nextPath);
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = normalizeEmail(getFormString(formData, "email"));

  if (!isValidEmail(email)) {
    return {
      status: "error",
      message: "Revise o campo destacado.",
      fieldErrors: { email: "Informe um e-mail válido." },
    };
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/auth/callback?next=/redefinir-senha`,
  });

  return {
    status: "success",
    message:
      "Se existir uma conta com esse e-mail, enviaremos um link seguro para redefinir a senha.",
  };
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validatePasswordResetInput({
    password: getFormString(formData, "password"),
    passwordConfirmation: getFormString(formData, "passwordConfirmation"),
  });

  if (!validation.success) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: validation.data.password });

  if (error) {
    return {
      status: "error",
      message: "O link pode ter expirado. Solicite uma nova recuperação de senha.",
    };
  }

  await supabase.auth.signOut();
  redirect("/entrar?senha=alterada");
}

export async function resendVerificationAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = normalizeEmail(getFormString(formData, "email"));

  if (!isValidEmail(email)) {
    return {
      status: "error",
      message: "Informe o e-mail usado no cadastro.",
      fieldErrors: { email: "Informe um e-mail válido." },
    };
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=/boas-vindas`,
    },
  });

  return {
    status: "success",
    message: "Se o cadastro estiver aguardando confirmação, um novo e-mail será enviado.",
  };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}
