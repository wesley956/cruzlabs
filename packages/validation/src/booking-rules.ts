export type BookingRulesInput = {
  minimumNoticeMinutes: number;
  bookingWindowDays: number;
  bufferAfterMinutes: number;
  cancellationCutoffMinutes: number;
  rescheduleCutoffMinutes: number;
  autoConfirm: boolean;
};

type BookingRulesValidationSuccess = {
  success: true;
  data: BookingRulesInput;
};

type BookingRulesValidationFailure = {
  success: false;
  message: string;
};

export type BookingRulesValidationResult =
  | BookingRulesValidationSuccess
  | BookingRulesValidationFailure;

function isIntegerInRange(value: unknown, minimum: number, maximum: number): value is number {
  return Number.isInteger(value) && Number(value) >= minimum && Number(value) <= maximum;
}

export function validateBookingRules(input: unknown): BookingRulesValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { success: false, message: "As regras de agendamento são inválidas." };
  }

  const rules = input as Record<string, unknown>;
  const minimumNoticeMinutes = Number(rules.minimumNoticeMinutes);
  const bookingWindowDays = Number(rules.bookingWindowDays);
  const bufferAfterMinutes = Number(rules.bufferAfterMinutes);
  const cancellationCutoffMinutes = Number(rules.cancellationCutoffMinutes);
  const rescheduleCutoffMinutes = Number(rules.rescheduleCutoffMinutes);
  const autoConfirm = rules.autoConfirm;

  if (!isIntegerInRange(minimumNoticeMinutes, 0, 10_080)) {
    return {
      success: false,
      message: "Escolha uma antecedência mínima entre agora e 7 dias.",
    };
  }

  if (!isIntegerInRange(bookingWindowDays, 1, 365)) {
    return {
      success: false,
      message: "Escolha uma janela futura entre 1 e 365 dias.",
    };
  }

  if (!isIntegerInRange(bufferAfterMinutes, 0, 240)) {
    return {
      success: false,
      message: "Escolha um intervalo entre atendimentos de até 4 horas.",
    };
  }

  if (!isIntegerInRange(cancellationCutoffMinutes, 0, 10_080)) {
    return {
      success: false,
      message: "Escolha um prazo de cancelamento entre agora e 7 dias.",
    };
  }

  if (!isIntegerInRange(rescheduleCutoffMinutes, 0, 10_080)) {
    return {
      success: false,
      message: "Escolha um prazo de reagendamento entre agora e 7 dias.",
    };
  }

  if (typeof autoConfirm !== "boolean") {
    return {
      success: false,
      message: "Escolha como os novos agendamentos serão confirmados.",
    };
  }

  return {
    success: true,
    data: {
      minimumNoticeMinutes,
      bookingWindowDays,
      bufferAfterMinutes,
      cancellationCutoffMinutes,
      rescheduleCutoffMinutes,
      autoConfirm,
    },
  };
}
