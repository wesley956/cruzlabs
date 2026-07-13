"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type AvailabilityServiceOption = {
  id: string;
  name: string;
  durationMinutes: number;
};

type AvailabilitySlot = {
  startsAt: string;
  endsAt: string;
};

type AvailabilityDay = {
  date: string;
  weekday: number;
  slots: AvailabilitySlot[];
};

type PublicAvailabilityResponse = {
  slug: string;
  serviceId: string;
  serviceName: string;
  serviceDurationMinutes: number;
  timezone: string;
  slotIntervalMinutes: number;
  bookingWindowEndsOn: string;
  unavailableReason: string | null;
  days: AvailabilityDay[];
};

type LoadState = "idle" | "loading" | "success" | "error";

function readString(record: Record<string, unknown>, key: string): string | null {
  return typeof record[key] === "string" ? record[key] : null;
}

function readInteger(record: Record<string, unknown>, key: string): number | null {
  const value = Number(record[key]);
  return Number.isInteger(value) ? value : null;
}

function parseAvailabilityResponse(value: unknown): PublicAvailabilityResponse | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const slug = readString(record, "slug");
  const serviceId = readString(record, "service_id");
  const serviceName = readString(record, "service_name");
  const serviceDurationMinutes = readInteger(record, "service_duration_minutes");
  const timezone = readString(record, "timezone");
  const slotIntervalMinutes = readInteger(record, "slot_interval_minutes");
  const bookingWindowEndsOn = readString(record, "booking_window_ends_on");
  const rawDays = record.days;

  if (
    !slug ||
    !serviceId ||
    !serviceName ||
    !serviceDurationMinutes ||
    !timezone ||
    !slotIntervalMinutes ||
    !bookingWindowEndsOn ||
    !Array.isArray(rawDays)
  ) {
    return null;
  }

  const days = rawDays.flatMap((rawDay) => {
    if (!rawDay || typeof rawDay !== "object" || Array.isArray(rawDay)) {
      return [];
    }

    const day = rawDay as Record<string, unknown>;
    const date = readString(day, "date");
    const weekday = readInteger(day, "weekday");
    const rawSlots = day.slots;

    if (!date || weekday === null || !Array.isArray(rawSlots)) {
      return [];
    }

    const slots = rawSlots.flatMap((rawSlot) => {
      if (!rawSlot || typeof rawSlot !== "object" || Array.isArray(rawSlot)) {
        return [];
      }

      const slot = rawSlot as Record<string, unknown>;
      const startsAt = readString(slot, "starts_at");
      const endsAt = readString(slot, "ends_at");

      if (!startsAt || !endsAt || Number.isNaN(Date.parse(startsAt)) || Number.isNaN(Date.parse(endsAt))) {
        return [];
      }

      return [{ startsAt, endsAt }];
    });

    return [{ date, weekday, slots }];
  });

  return {
    slug,
    serviceId,
    serviceName,
    serviceDurationMinutes,
    timezone,
    slotIntervalMinutes,
    bookingWindowEndsOn,
    unavailableReason: readString(record, "unavailable_reason"),
    days,
  };
}

function addDaysToIsoDate(value: string, days: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}

function formatTime(value: string, timezone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(new Date(value));
}

export function PublicAvailabilityPicker({
  slug,
  services,
}: {
  slug: string;
  services: AvailabilityServiceOption[];
}) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id ?? "");
  const [availability, setAvailability] = useState<PublicAvailabilityResponse | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [loadState, setLoadState] = useState<LoadState>(services.length > 0 ? "loading" : "idle");
  const [message, setMessage] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadAvailability = useCallback(
    async ({ startDate, append }: { startDate?: string; append?: boolean } = {}) => {
      if (!selectedServiceId) {
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else {
        setLoadState("loading");
        setAvailability(null);
        setSelectedSlot(null);
      }
      setMessage(null);

      const searchParams = new URLSearchParams({
        serviceId: selectedServiceId,
        days: "14",
      });

      if (startDate) {
        searchParams.set("startDate", startDate);
      }

      try {
        const response = await fetch(
          `/api/public/${encodeURIComponent(slug)}/availability?${searchParams.toString()}`,
          { cache: "no-store" },
        );
        const payload: unknown = await response.json();

        if (!response.ok) {
          const errorMessage =
            payload && typeof payload === "object" && !Array.isArray(payload)
              ? readString(payload as Record<string, unknown>, "message")
              : null;
          throw new Error(errorMessage ?? "Não foi possível consultar os horários.");
        }

        const parsed = parseAvailabilityResponse(payload);

        if (!parsed || parsed.serviceId !== selectedServiceId) {
          throw new Error("A resposta de disponibilidade é inválida.");
        }

        setAvailability((current) => {
          if (!append || !current) {
            return parsed;
          }

          const knownDates = new Set(current.days.map((day) => day.date));
          return {
            ...parsed,
            days: [...current.days, ...parsed.days.filter((day) => !knownDates.has(day.date))],
          };
        });
        setLoadState("success");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Não foi possível consultar os horários.");
        if (!append) {
          setLoadState("error");
        }
      } finally {
        setLoadingMore(false);
      }
    },
    [selectedServiceId, slug],
  );

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  const availableDays = useMemo(
    () => availability?.days.filter((day) => day.slots.length > 0) ?? [],
    [availability],
  );

  const lastLoadedDate = availability?.days.at(-1)?.date ?? null;
  const canLoadMore = Boolean(
    lastLoadedDate &&
      availability?.bookingWindowEndsOn &&
      lastLoadedDate < availability.bookingWindowEndsOn,
  );

  const selectedService = services.find((service) => service.id === selectedServiceId) ?? null;

  return (
    <section className="mt-8 rounded-[2rem] bg-[var(--foreground)] p-7 text-[var(--surface)] sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
        Agendamento online
      </p>
      <h2 className="mt-3 text-4xl font-semibold">Escolha um serviço e veja os horários</h2>
      <p className="mt-3 max-w-2xl leading-7 text-[#d8d0c4]">
        Os horários abaixo já consideram a duração do serviço, o expediente e os atendimentos
        existentes.
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {services.map((service) => {
          const selected = service.id === selectedServiceId;

          return (
            <button
              key={service.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedServiceId(service.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                selected
                  ? "border-[var(--gold)] bg-white/10"
                  : "border-white/15 bg-white/5 hover:border-white/35"
              }`}
            >
              <span className="block text-lg font-semibold">{service.name}</span>
              <span className="mt-1 block text-sm text-[#d8d0c4]">
                {service.durationMinutes} minutos
              </span>
            </button>
          );
        })}
      </div>

      {loadState === "loading" && (
        <div className="mt-7 rounded-2xl bg-white/5 p-6 text-[#d8d0c4]" role="status">
          Consultando os próximos horários disponíveis…
        </div>
      )}

      {loadState === "error" && (
        <div className="mt-7 rounded-2xl border border-[#dca79d] bg-[#4a2f2a] p-6">
          <p>{message}</p>
          <button
            type="button"
            onClick={() => void loadAvailability()}
            className="mt-4 min-h-11 rounded-xl bg-[var(--surface)] px-5 font-semibold text-[var(--foreground)]"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {loadState === "success" && availability?.unavailableReason === "paused" && (
        <div className="mt-7 rounded-2xl bg-white/5 p-6">
          <h3 className="text-2xl font-semibold">Novos agendamentos estão pausados</h3>
          <p className="mt-2 text-[#d8d0c4]">Os atendimentos já confirmados continuam válidos.</p>
        </div>
      )}

      {loadState === "success" && availability && !availability.unavailableReason && (
        <div className="mt-8">
          {availableDays.length === 0 ? (
            <div className="rounded-2xl bg-white/5 p-6">
              <h3 className="text-2xl font-semibold">Nenhum horário neste período</h3>
              <p className="mt-2 text-[#d8d0c4]">
                Consulte os próximos dias ou escolha outro serviço.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {availableDays.map((day) => (
                <article key={day.date} className="rounded-2xl bg-white/5 p-5">
                  <h3 className="text-xl font-semibold capitalize">{formatDayLabel(day.date)}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {day.slots.map((slot) => {
                      const selected = selectedSlot?.startsAt === slot.startsAt;
                      const label = formatTime(slot.startsAt, availability.timezone);

                      return (
                        <button
                          key={slot.startsAt}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setSelectedSlot(slot)}
                          className={`min-h-11 rounded-xl px-4 font-semibold transition ${
                            selected
                              ? "bg-[var(--gold)] text-[var(--foreground)]"
                              : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--gold-soft)]"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}

          {canLoadMore && lastLoadedDate && (
            <button
              type="button"
              disabled={loadingMore}
              onClick={() =>
                void loadAvailability({
                  startDate: addDaysToIsoDate(lastLoadedDate, 1),
                  append: true,
                })
              }
              className="mt-6 min-h-12 w-full rounded-xl border border-white/20 px-6 font-semibold hover:bg-white/5 disabled:cursor-wait disabled:opacity-60"
            >
              {loadingMore ? "Consultando próximos dias…" : "Ver mais 14 dias"}
            </button>
          )}
        </div>
      )}

      {selectedSlot && availability && selectedService && (
        <div className="mt-7 rounded-2xl border border-[var(--gold)] bg-white/10 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
            Horário selecionado
          </p>
          <h3 className="mt-2 text-2xl font-semibold">{selectedService.name}</h3>
          <p className="mt-2 text-[#d8d0c4]">
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "full",
              timeStyle: "short",
              timeZone: availability.timezone,
            }).format(new Date(selectedSlot.startsAt))}
          </p>
          <p className="mt-4 text-sm leading-6 text-[#d8d0c4]">
            A etapa de identificação da cliente e confirmação da reserva será conectada na próxima
            fase do desenvolvimento.
          </p>
        </div>
      )}
    </section>
  );
}
