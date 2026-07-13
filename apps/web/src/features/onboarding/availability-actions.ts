"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import { validateAvailabilityPeriods } from "@cruz-agenda/validation";
import type { OnboardingActionState } from "./actions";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function mapAvailabilityError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("authentication_required")) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  if (normalized.includes("overlapping_availability_periods")) {
    return "Existem períodos sobrepostos no mesmo dia.";
  }

  if (normalized.includes("at_least_one_availability_period_required")) {
    return "Escolha pelo menos um período de atendimento.";
  }

  if (normalized.includes("onboarding_already_completed")) {
    return "O onboarding já foi concluído. Edite os horários pela área de Disponibilidade.";
  }

  return "Não foi possível salvar seus horários. Revise os períodos e tente novamente.";
}

export async function saveAvailabilityAction(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  let parsedPeriods: unknown;

  try {
    parsedPeriods = JSON.parse(getFormString(formData, "periods"));
  } catch {
    return {
      status: "error",
      message: "Não foi possível interpretar seus horários. Atualize a página e tente novamente.",
    };
  }

  const validation = validateAvailabilityPeriods(parsedPeriods);

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

  const payload = validation.data.map((period) => ({
    weekday: period.weekday,
    start_time: period.startTime,
    end_time: period.endTime,
  }));

  const { error } = await supabase.rpc("save_onboarding_availability", {
    selected_periods: payload,
  });

  if (error) {
    return { status: "error", message: mapAvailabilityError(error.message) };
  }

  redirect("/configuracao/regras");
}
