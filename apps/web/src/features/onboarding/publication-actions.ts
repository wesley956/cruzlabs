"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import { validatePublicLink } from "@cruz-agenda/validation";
import type { OnboardingActionState } from "./actions";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function mapPublicationError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("authentication_required")) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  if (normalized.includes("public_slug_unavailable")) {
    return "Este endereço já está sendo usado ou é reservado. Escolha outro.";
  }

  if (normalized.includes("invalid_public_slug")) {
    return "O endereço informado não é válido.";
  }

  if (normalized.includes("business_information_incomplete")) {
    return "As informações do negócio ainda estão incompletas.";
  }

  if (normalized.includes("online_service_required")) {
    return "Deixe pelo menos um serviço ativo para agendamento online.";
  }

  if (normalized.includes("availability_required")) {
    return "Configure pelo menos um período de atendimento antes de publicar.";
  }

  if (normalized.includes("booking_settings_required")) {
    return "Configure as regras de agendamento antes de publicar.";
  }

  if (normalized.includes("subscription_trial_not_initialized")) {
    return "Não foi possível iniciar o período gratuito com segurança.";
  }

  if (normalized.includes("onboarding_already_completed")) {
    return "Sua agenda já foi publicada.";
  }

  return "Não foi possível concluir esta etapa. Revise os dados e tente novamente.";
}

export async function savePublicLinkAction(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const validation = validatePublicLink(getFormString(formData, "slug"));

  if (!validation.success) {
    return { status: "error", message: validation.message };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Sua sessão expirou. Entre novamente para continuar.",
    };
  }

  const { error } = await supabase.rpc("save_onboarding_slug", {
    selected_slug: validation.data.slug,
  });

  if (error) {
    return { status: "error", message: mapPublicationError(error.message) };
  }

  redirect("/configuracao/previa");
}

export async function publishBusinessAction(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  if (formData.get("confirmPublication") !== "on") {
    return {
      status: "error",
      message: "Confirme que deseja publicar e iniciar os 15 dias gratuitos.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Sua sessão expirou. Entre novamente para continuar.",
    };
  }

  const { data, error } = await supabase.rpc("publish_onboarding_business");

  if (error) {
    return { status: "error", message: mapPublicationError(error.message) };
  }

  const publishedSlug =
    data && typeof data === "object" && "slug" in data && typeof data.slug === "string"
      ? data.slug
      : "";

  const target = publishedSlug
    ? `/painel?publicada=1&slug=${encodeURIComponent(publishedSlug)}`
    : "/painel?publicada=1";

  redirect(target);
}
