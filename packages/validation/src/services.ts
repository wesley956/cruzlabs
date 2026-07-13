export type OnboardingServiceInput = {
  templateId: string | null;
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number | null;
  showPrice: boolean;
  onlineBookingEnabled: boolean;
};

type ServiceValidationSuccess = {
  success: true;
  data: OnboardingServiceInput[];
};

type ServiceValidationFailure = {
  success: false;
  message: string;
};

export type ServiceValidationResult = ServiceValidationSuccess | ServiceValidationFailure;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalizeDescription(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateOnboardingServices(input: unknown): ServiceValidationResult {
  if (!Array.isArray(input)) {
    return { success: false, message: "A lista de serviços é inválida." };
  }

  if (input.length < 1) {
    return { success: false, message: "Adicione pelo menos um serviço." };
  }

  if (input.length > 30) {
    return { success: false, message: "Você pode cadastrar até 30 serviços nesta etapa." };
  }

  const normalizedServices: OnboardingServiceInput[] = [];
  const normalizedNames = new Set<string>();

  for (const [index, rawService] of input.entries()) {
    if (!rawService || typeof rawService !== "object") {
      return { success: false, message: `O serviço ${index + 1} é inválido.` };
    }

    const service = rawService as Record<string, unknown>;
    const name = normalizeText(service.name);
    const description = normalizeDescription(service.description);
    const durationMinutes = Number(service.durationMinutes);
    const rawPriceCents = service.priceCents;
    const priceCents =
      rawPriceCents === null || rawPriceCents === "" ? null : Number(rawPriceCents);
    const templateId = service.templateId === null ? null : normalizeText(service.templateId);
    const nameKey = name.toLocaleLowerCase("pt-BR");

    if (name.length < 2 || name.length > 100) {
      return {
        success: false,
        message: `Informe um nome válido para o serviço ${index + 1}.`,
      };
    }

    if (normalizedNames.has(nameKey)) {
      return { success: false, message: `O serviço “${name}” foi adicionado mais de uma vez.` };
    }
    normalizedNames.add(nameKey);

    if (description.length > 300) {
      return {
        success: false,
        message: `A descrição de “${name}” pode ter no máximo 300 caracteres.`,
      };
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 720) {
      return {
        success: false,
        message: `Escolha uma duração entre 5 minutos e 12 horas para “${name}”.`,
      };
    }

    if (
      priceCents !== null &&
      (!Number.isInteger(priceCents) || priceCents < 0 || priceCents > 100_000_000)
    ) {
      return { success: false, message: `Informe um preço válido para “${name}”.` };
    }

    if (templateId && !UUID_PATTERN.test(templateId)) {
      return { success: false, message: `A origem do serviço “${name}” é inválida.` };
    }

    if (typeof service.showPrice !== "boolean") {
      return { success: false, message: `A exibição de preço de “${name}” é inválida.` };
    }

    if (typeof service.onlineBookingEnabled !== "boolean") {
      return { success: false, message: `A disponibilidade online de “${name}” é inválida.` };
    }

    normalizedServices.push({
      templateId: templateId || null,
      name,
      description,
      durationMinutes,
      priceCents,
      showPrice: service.showPrice,
      onlineBookingEnabled: service.onlineBookingEnabled,
    });
  }

  return { success: true, data: normalizedServices };
}
