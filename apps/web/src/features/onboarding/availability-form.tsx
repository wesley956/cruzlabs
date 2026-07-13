"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveAvailabilityAction } from "./availability-actions";
import type { OnboardingActionState } from "./actions";

const INITIAL_STATE: OnboardingActionState = { status: "idle" };

export type ExistingAvailabilityPeriod = {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
};

type EditablePeriod = {
  clientId: string;
  startTime: string;
  endTime: string;
};

type DayConfiguration = {
  weekday: number;
  label: string;
  enabled: boolean;
  periods: EditablePeriod[];
};

const WEEKDAYS = [
  [1, "Segunda-feira"],
  [2, "Terça-feira"],
  [3, "Quarta-feira"],
  [4, "Quinta-feira"],
  [5, "Sexta-feira"],
  [6, "Sábado"],
  [0, "Domingo"],
] as const;

function newClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function defaultPeriodsForWeekday(weekday: number): EditablePeriod[] {
  if (weekday >= 1 && weekday <= 5) {
    return [
      { clientId: newClientId(), startTime: "09:00", endTime: "12:00" },
      { clientId: newClientId(), startTime: "13:00", endTime: "18:00" },
    ];
  }

  if (weekday === 6) {
    return [{ clientId: newClientId(), startTime: "09:00", endTime: "13:00" }];
  }

  return [];
}

function buildInitialDays(existingPeriods: ExistingAvailabilityPeriod[]): DayConfiguration[] {
  const hasSavedPeriods = existingPeriods.length > 0;

  return WEEKDAYS.map(([weekday, label]) => {
    const savedPeriods = existingPeriods
      .filter((period) => period.weekday === weekday)
      .map((period) => ({
        clientId: period.id,
        startTime: period.startTime.slice(0, 5),
        endTime: period.endTime.slice(0, 5),
      }));
    const periods = hasSavedPeriods ? savedPeriods : defaultPeriodsForWeekday(weekday);

    return {
      weekday,
      label,
      enabled: periods.length > 0,
      periods,
    };
  });
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 rounded-xl bg-[var(--brand)] px-6 font-semibold text-[var(--surface)] transition hover:bg-[var(--brand-strong)] disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "Salvando horários..." : "Salvar e continuar"}
    </button>
  );
}

export function AvailabilityForm({
  existingPeriods,
}: {
  existingPeriods: ExistingAvailabilityPeriod[];
}) {
  const [state, formAction] = useActionState(saveAvailabilityAction, INITIAL_STATE);
  const [days, setDays] = useState<DayConfiguration[]>(() => buildInitialDays(existingPeriods));

  const serializedPeriods = useMemo(
    () =>
      JSON.stringify(
        days.flatMap((day) =>
          day.enabled
            ? day.periods.map((period) => ({
                weekday: day.weekday,
                startTime: period.startTime,
                endTime: period.endTime,
              }))
            : [],
        ),
      ),
    [days],
  );

  function updateDay(weekday: number, updater: (day: DayConfiguration) => DayConfiguration) {
    setDays((current) =>
      current.map((day) => (day.weekday === weekday ? updater(day) : day)),
    );
  }

  function toggleDay(weekday: number, enabled: boolean) {
    updateDay(weekday, (day) => ({
      ...day,
      enabled,
      periods:
        enabled && day.periods.length === 0
          ? [{ clientId: newClientId(), startTime: "09:00", endTime: "18:00" }]
          : day.periods,
    }));
  }

  function addPeriod(weekday: number) {
    updateDay(weekday, (day) => ({
      ...day,
      periods: [
        ...day.periods,
        { clientId: newClientId(), startTime: "13:00", endTime: "18:00" },
      ],
    }));
  }

  function updatePeriod(
    weekday: number,
    clientId: string,
    changes: Partial<EditablePeriod>,
  ) {
    updateDay(weekday, (day) => ({
      ...day,
      periods: day.periods.map((period) =>
        period.clientId === clientId ? { ...period, ...changes } : period,
      ),
    }));
  }

  function removePeriod(weekday: number, clientId: string) {
    updateDay(weekday, (day) => {
      const periods = day.periods.filter((period) => period.clientId !== clientId);
      return { ...day, periods, enabled: periods.length > 0 };
    });
  }

  function copyMondayToWeekdays() {
    const monday = days.find((day) => day.weekday === 1);

    if (!monday) {
      return;
    }

    setDays((current) =>
      current.map((day) => {
        if (day.weekday < 1 || day.weekday > 5) {
          return day;
        }

        return {
          ...day,
          enabled: monday.enabled,
          periods: monday.periods.map((period) => ({
            ...period,
            clientId: newClientId(),
          })),
        };
      }),
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      <input type="hidden" name="periods" value={serializedPeriods} />

      {state.message && (
        <div
          role="alert"
          className="rounded-xl border border-[var(--danger)] bg-[#f7ece9] p-4 text-sm leading-6 text-[var(--danger)]"
        >
          {state.message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={copyMondayToWeekdays}
          className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold hover:bg-[var(--surface-soft)]"
        >
          Copiar segunda para dias úteis
        </button>
      </div>

      {days.map((day) => (
        <section
          key={day.weekday}
          className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">{day.label}</h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                {day.enabled
                  ? `${day.periods.length} período${day.periods.length === 1 ? "" : "s"} de atendimento`
                  : "Dia fechado"}
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={day.enabled}
                onChange={(event) => toggleDay(day.weekday, event.target.checked)}
                className="size-4 accent-[var(--sage)]"
              />
              {day.enabled ? "Aberto" : "Fechado"}
            </label>
          </div>

          {day.enabled && (
            <div className="mt-5 space-y-3">
              {day.periods.map((period, periodIndex) => (
                <div
                  key={period.clientId}
                  className="grid gap-3 rounded-2xl bg-[var(--surface-soft)] p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                >
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-muted)]">
                      Início {periodIndex + 1}
                    </span>
                    <input
                      type="time"
                      required
                      value={period.startTime}
                      onChange={(event) =>
                        updatePeriod(day.weekday, period.clientId, {
                          startTime: event.target.value,
                        })
                      }
                      className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--gold)] focus:ring-3 focus:ring-[var(--gold-soft)]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-muted)]">
                      Fim {periodIndex + 1}
                    </span>
                    <input
                      type="time"
                      required
                      value={period.endTime}
                      onChange={(event) =>
                        updatePeriod(day.weekday, period.clientId, {
                          endTime: event.target.value,
                        })
                      }
                      className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--gold)] focus:ring-3 focus:ring-[var(--gold-soft)]"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => removePeriod(day.weekday, period.clientId)}
                    className="min-h-11 rounded-xl px-4 text-sm font-semibold text-[var(--danger)] hover:bg-[#f7ece9]"
                  >
                    Remover
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addPeriod(day.weekday)}
                className="min-h-11 w-full rounded-xl border border-dashed border-[var(--border)] px-4 text-sm font-semibold hover:bg-[var(--surface-soft)]"
              >
                + Adicionar outro período
              </button>
            </div>
          )}
        </section>
      ))}

      <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/configuracao/servicos"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 font-semibold hover:bg-[var(--surface-soft)]"
        >
          Voltar
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
