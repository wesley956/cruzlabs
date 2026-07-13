import { isValidBrazilPhone, normalizeBrazilPhone } from "./auth";

export const SERVICE_LOCATION_TYPES = [
  "own_space",
  "home_service",
  "mixed",
  "arranged_location",
] as const;

export type ServiceLocationType = (typeof SERVICE_LOCATION_TYPES)[number];

export const ADDRESS_VISIBILITIES = [
  "full",
  "neighborhood_city",
  "city",
  "hidden",
] as const;

export type AddressVisibility = (typeof ADDRESS_VISIBILITIES)[number];

export type ProfessionInput = {
  professionKey: string;
  customProfession: string;
};

export type BusinessInput = {
  businessName: string;
  publicProfessionName: string;
  whatsapp: string;
  description: string;
  instagramUsername: string;
  city: string;
  state: string;
  serviceLocationType: string;
  addressVisibility: string;
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
};

export type OnboardingFieldErrors = Partial<
  Record<
    | "professionKey"
    | "customProfession"
    | "businessName"
    | "publicProfessionName"
    | "whatsapp"
    | "description"
    | "instagramUsername"
    | "city"
    | "state"
    | "serviceLocationType"
    | "addressVisibility"
    | "postalCode"
    | "street"
    | "number"
    | "complement"
    | "neighborhood",
    string
  >
>;

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

type ValidationFailure = {
  success: false;
  fieldErrors: OnboardingFieldErrors;
};

export type OnboardingValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeInstagramUsername(value: string): string {
  return value.trim().replace(/^@/, "");
}

export function normalizePostalCode(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateProfessionInput(
  input: ProfessionInput,
  allowedProfessionKeys: ReadonlySet<string>,
): OnboardingValidationResult<ProfessionInput> {
  const fieldErrors: OnboardingFieldErrors = {};
  const professionKey = input.professionKey.trim().toLowerCase();
  const customProfession = normalizeText(input.customProfession);

  if (!allowedProfessionKeys.has(professionKey)) {
    fieldErrors.professionKey = "Escolha uma profissão válida.";
  }

  if (professionKey === "other" && (customProfession.length < 2 || customProfession.length > 80)) {
    fieldErrors.customProfession = "Descreva sua atividade usando entre 2 e 80 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      professionKey,
      customProfession: professionKey === "other" ? customProfession : "",
    },
  };
}

export function validateBusinessInput(
  input: BusinessInput,
): OnboardingValidationResult<BusinessInput> {
  const fieldErrors: OnboardingFieldErrors = {};
  const businessName = normalizeText(input.businessName);
  const publicProfessionName = normalizeText(input.publicProfessionName);
  const whatsapp = normalizeBrazilPhone(input.whatsapp);
  const description = input.description.trim();
  const instagramUsername = normalizeInstagramUsername(input.instagramUsername);
  const city = normalizeText(input.city);
  const state = input.state.trim().toUpperCase();
  const postalCode = normalizePostalCode(input.postalCode);
  const street = normalizeText(input.street);
  const number = normalizeText(input.number);
  const complement = normalizeText(input.complement);
  const neighborhood = normalizeText(input.neighborhood);

  if (businessName.length < 2 || businessName.length > 80) {
    fieldErrors.businessName = "Informe um nome entre 2 e 80 caracteres.";
  }

  if (publicProfessionName.length < 2 || publicProfessionName.length > 80) {
    fieldErrors.publicProfessionName = "Informe uma apresentação entre 2 e 80 caracteres.";
  }

  if (!isValidBrazilPhone(whatsapp)) {
    fieldErrors.whatsapp = "Informe um WhatsApp brasileiro com DDD.";
  }

  if (description.length > 300) {
    fieldErrors.description = "A descrição pode ter no máximo 300 caracteres.";
  }

  if (instagramUsername.length > 100) {
    fieldErrors.instagramUsername = "O Instagram pode ter no máximo 100 caracteres.";
  }

  if (city.length < 2 || city.length > 80) {
    fieldErrors.city = "Informe sua cidade.";
  }

  if (!/^[A-Z]{2}$/.test(state)) {
    fieldErrors.state = "Informe a sigla do estado com duas letras.";
  }

  if (!SERVICE_LOCATION_TYPES.includes(input.serviceLocationType as ServiceLocationType)) {
    fieldErrors.serviceLocationType = "Escolha onde você realiza os atendimentos.";
  }

  if (!ADDRESS_VISIBILITIES.includes(input.addressVisibility as AddressVisibility)) {
    fieldErrors.addressVisibility = "Escolha como sua localização será apresentada.";
  }

  if (postalCode && !/^\d{8}$/.test(postalCode)) {
    fieldErrors.postalCode = "Informe um CEP com 8 números.";
  }

  if (input.addressVisibility === "full" && street.length < 2) {
    fieldErrors.street = "Informe a rua para mostrar o endereço completo.";
  }

  if (street.length > 120) {
    fieldErrors.street = "A rua pode ter no máximo 120 caracteres.";
  }

  if (number.length > 20) {
    fieldErrors.number = "O número pode ter no máximo 20 caracteres.";
  }

  if (complement.length > 80) {
    fieldErrors.complement = "O complemento pode ter no máximo 80 caracteres.";
  }

  if (neighborhood.length > 80) {
    fieldErrors.neighborhood = "O bairro pode ter no máximo 80 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      businessName,
      publicProfessionName,
      whatsapp,
      description,
      instagramUsername,
      city,
      state,
      serviceLocationType: input.serviceLocationType,
      addressVisibility: input.addressVisibility,
      postalCode,
      street,
      number,
      complement,
      neighborhood,
    },
  };
}
