"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import {
  validateBusinessInput,
  validateProfessionInput,
  type OnboardingFieldErrors,
} from "@cruz-agenda/validation";

export type OnboardingActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: OnboardingFieldErrors;
};

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function mapOnboardingError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("authentication_required")) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  if (normalized.includes("invalid_profession")) {
    return "A profissão selecionada não está disponível.";
  }

  if (normalized.includes("business_not_initialized")) {
    return "Escolha sua profissão antes de informar os dados do negócio.";
  }

  return "Não foi possível salvar esta etapa. Revise os dados e tente novamente.";
}

export async function saveProfessionAction(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
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

  const { data: professions, error: professionsError } = await supabase
    .from("profession_templates")
    .select("key")
    .eq("is_active", true);

  if (professionsError) {
    return {
      status: "error",
      message: "Não foi possível carregar as profissões disponíveis.",
    };
  }

  const allowedKeys = new Set((professions ?? []).map((profession) => profession.key));
  const validation = validateProfessionInput(
    {
      professionKey: getFormString(formData, "professionKey"),
      customProfession: getFormString(formData, "customProfession"),
    },
    allowedKeys,
  );

  if (!validation.success) {
    return {
      status: "error",
      message: "Revise a escolha antes de continuar.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const { error } = await supabase.rpc("save_onboarding_profession", {
    selected_profession_key: validation.data.professionKey,
    selected_custom_profession: validation.data.customProfession || null,
  });

  if (error) {
    return { status: "error", message: mapOnboardingError(error.message) };
  }

  redirect("/configuracao/negocio");
}

export async function saveBusinessAction(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const validation = validateBusinessInput({
    businessName: getFormString(formData, "businessName"),
    publicProfessionName: getFormString(formData, "publicProfessionName"),
    whatsapp: getFormString(formData, "whatsapp"),
    description: getFormString(formData, "description"),
    instagramUsername: getFormString(formData, "instagramUsername"),
    city: getFormString(formData, "city"),
    state: getFormString(formData, "state"),
    serviceLocationType: getFormString(formData, "serviceLocationType"),
    addressVisibility: getFormString(formData, "addressVisibility"),
    postalCode: getFormString(formData, "postalCode"),
    street: getFormString(formData, "street"),
    number: getFormString(formData, "number"),
    complement: getFormString(formData, "complement"),
    neighborhood: getFormString(formData, "neighborhood"),
  });

  if (!validation.success) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: validation.fieldErrors,
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

  const { error } = await supabase.rpc("save_onboarding_business", {
    selected_business_name: validation.data.businessName,
    selected_public_profession_name: validation.data.publicProfessionName,
    selected_whatsapp: validation.data.whatsapp,
    selected_description: validation.data.description || null,
    selected_instagram_username: validation.data.instagramUsername || null,
    selected_city: validation.data.city,
    selected_state: validation.data.state,
    selected_service_location_type: validation.data.serviceLocationType,
    selected_address_visibility: validation.data.addressVisibility,
    selected_postal_code: validation.data.postalCode || null,
    selected_street: validation.data.street || null,
    selected_number: validation.data.number || null,
    selected_complement: validation.data.complement || null,
    selected_neighborhood: validation.data.neighborhood || null,
  });

  if (error) {
    return { status: "error", message: mapOnboardingError(error.message) };
  }

  redirect("/configuracao/servicos");
}
