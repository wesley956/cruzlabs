export type AvailabilityPeriodInput = {
  weekday: number;
  startTime: string;
  endTime: string;
};

type AvailabilityValidationSuccess = {
  success: true;
  data: AvailabilityPeriodInput[];
};

type AvailabilityValidationFailure = {
  success: false;
  message: string;
};

export type AvailabilityValidationResult =
  | AvailabilityValidationSuccess
  | AvailabilityValidationFailure;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function validateAvailabilityPeriods(input: unknown): AvailabilityValidationResult {
  if (!Array.isArray(input)) {
    return { success: false, message: "A disponibilidade informada é inválida." };
  }

  if (input.length < 1) {
    return { success: false, message: "Escolha pelo menos um período de atendimento." };
  }

  if (input.length > 50) {
    return { success: false, message: "Foram adicionados períodos demais." };
  }

  const normalizedPeriods: AvailabilityPeriodInput[] = [];

  for (const [index, rawPeriod] of input.entries()) {
    if (!rawPeriod || typeof rawPeriod !== "object") {
      return { success: false, message: `O período ${index + 1} é inválido.` };
    }

    const period = rawPeriod as Record<string, unknown>;
    const weekday = Number(period.weekday);
    const startTime = typeof period.startTime === "string" ? period.startTime.trim() : "";
    const endTime = typeof period.endTime === "string" ? period.endTime.trim() : "";

    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
      return { success: false, message: `O dia do período ${index + 1} é inválido.` };
    }

    if (!TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime)) {
      return { success: false, message: `Informe horários válidos no período ${index + 1}.` };
    }

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      return {
        success: false,
        message: `O horário final precisa ser depois do inicial no período ${index + 1}.`,
      };
    }

    normalizedPeriods.push({ weekday, startTime, endTime });
  }

  for (let weekday = 0; weekday <= 6; weekday += 1) {
    const dayPeriods = normalizedPeriods
      .filter((period) => period.weekday === weekday)
      .sort((first, second) => timeToMinutes(first.startTime) - timeToMinutes(second.startTime));

    for (let index = 1; index < dayPeriods.length; index += 1) {
      const previous = dayPeriods[index - 1];
      const current = dayPeriods[index];

      if (timeToMinutes(current.startTime) < timeToMinutes(previous.endTime)) {
        return {
          success: false,
          message: "Existem períodos sobrepostos no mesmo dia.",
        };
      }
    }
  }

  return {
    success: true,
    data: normalizedPeriods.sort(
      (first, second) =>
        first.weekday - second.weekday ||
        timeToMinutes(first.startTime) - timeToMinutes(second.startTime),
    ),
  };
}
