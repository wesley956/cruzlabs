"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import { validateBookingRules } from "@cruz-agenda/validation";
import type { OnboardingActionState } from "./actions";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function mapBookingRulesError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("authentication_required")) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  if (normalized.includes("business_not_initialized")) {
    return "Complete as etapas anteriores antes de configurar as regras.";
  }

  if (normalized.includes("onboarding_already_completed")) {
    return "O onboarding já foi concluído. Edite estas regras pelas configurações da agenda.";
  }

  if (
    normalized.includes("invalid_minimum_notice") ||
    normalized.includes("invalid_booking_window") ||
    normalized.includes("invalid_buffer_after") ||
    normalized.includes("invalid_cancellation_cutoff") ||
    normalized.includes("invalid_reschedule_cutoff") ||
    normalized.includes("invalid_auto_confirm")
  ) {
    return "Uma das regras informadas não está dentro dos limites permitidos.";
  }

  return "Não foi possível salvar as regras. Revise as escolhas e tente novamente.";
}

export async function saveBookingRulesAction(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const validation = validateBookingRules({
    minimumNoticeMinutes: Number(getFormString(formData, "minimumNoticeMinutes")),
    bookingWindowDays: Number(getFormString(formData, "bookingWindowDays")),
    bufferAfterMinutes: Number(getFormString(formData, "bufferAfterMinutes")),
    cancellationCutoffMinutes: Number(
      getFormString(formData, "cancellationCutoffMinutes"),
    ),
    rescheduleCutoffMinutes: Number(getFormString(formData, "rescheduleCutoffMinutes")),
    autoConfirm: formData.get("autoConfirm") === "on",
  });

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

  const { error } = await supabase.rpc("save_onboarding_booking_settings", {
    selected_rules: {
      minimum_notice_minutes: validation.data.minimumNoticeMinutes,
      booking_window_days: validation.data.bookingWindowDays,
      buffer_after_minutes: validation.data.bufferAfterMinutes,
      cancellation_cutoff_minutes: validation.data.cancellationCutoffMinutes,
      reschedule_cutoff_minutes: validation.data.rescheduleCutoffMinutes,
      auto_confirm: validation.data.autoConfirm,
    },
  });

  if (error) {
    return { status: "error", message: mapBookingRulesError(error.message) };
  }

  redirect("/configuracao/link");
}
