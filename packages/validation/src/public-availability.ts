export type PublicAvailabilityQueryInput = {
  serviceId: string;
  startDate?: string | null;
  days?: string | number | null;
};

export type PublicAvailabilityQuery = {
  serviceId: string;
  startDate: string | null;
  days: number;
};

type PublicAvailabilityValidationSuccess = {
  success: true;
  data: PublicAvailabilityQuery;
};

type PublicAvailabilityValidationFailure = {
  success: false;
  message: string;
};

export type PublicAvailabilityValidationResult =
  PublicAvailabilityValidationSuccess | PublicAvailabilityValidationFailure;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function validatePublicAvailabilityQuery(
  input: PublicAvailabilityQueryInput,
): PublicAvailabilityValidationResult {
  const serviceId = input.serviceId.trim();
  const startDate = input.startDate?.trim() || null;
  const days =
    input.days === null || input.days === undefined || input.days === "" ? 14 : Number(input.days);

  if (!UUID_PATTERN.test(serviceId)) {
    return { success: false, message: "O serviço informado é inválido." };
  }

  if (startDate && !isValidIsoDate(startDate)) {
    return { success: false, message: "A data inicial informada é inválida." };
  }

  if (!Number.isInteger(days) || days < 1 || days > 31) {
    return { success: false, message: "O período consultado deve ter entre 1 e 31 dias." };
  }

  return {
    success: true,
    data: {
      serviceId,
      startDate,
      days,
    },
  };
}
