"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveBookingRulesAction } from "./booking-rules-actions";
import type { OnboardingActionState } from "./actions";

const INITIAL_STATE: OnboardingActionState = { status: "idle" };
const SELECT_CLASS =
  "min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 outline-none transition focus:border-[var(--gold)] focus:ring-3 focus:ring-[var(--gold-soft)]";

export type BookingRulesDefaults = {
  minimumNoticeMinutes: number;
  bookingWindowDays: number;
  bufferAfterMinutes: number;
  cancellationCutoffMinutes: number;
  rescheduleCutoffMinutes: number;
  autoConfirm: boolean;
};

const NOTICE_OPTIONS = [
  [0, "Sem antecedência mínima"],
  [30, "30 minutos antes"],
  [60, "1 hora antes"],
  [120, "2 horas antes"],
  [240, "4 horas antes"],
  [720, "12 horas antes"],
  [1440, "1 dia antes"],
  [2880, "2 dias antes"],
  [10080, "7 dias antes"],
] as const;

const WINDOW_OPTIONS = [
  [7, "Próximos 7 dias"],
  [15, "Próximos 15 dias"],
  [30, "Próximos 30 dias"],
  [45, "Próximos 45 dias"],
  [60, "Próximos 60 dias"],
  [90, "Próximos 90 dias"],
  [120, "Próximos 120 dias"],
  [180, "Próximos 180 dias"],
  [365, "Próximo ano"],
] as const;

const BUFFER_OPTIONS = [
  [0, "Sem intervalo adicional"],
  [5, "5 minutos"],
  [10, "10 minutos"],
  [15, "15 minutos"],
  [20, "20 minutos"],
  [30, "30 minutos"],
  [45, "45 minutos"],
  [60, "1 hora"],
  [90, "1 hora e 30 minutos"],
  [120, "2 horas"],
] as const;

const CUTOFF_OPTIONS = [
  [0, "Até o horário do atendimento"],
  [120, "Até 2 horas antes"],
  [240, "Até 4 horas antes"],
  [360, "Até 6 horas antes"],
  [720, "Até 12 horas antes"],
  [1440, "Até 1 dia antes"],
  [2880, "Até 2 dias antes"],
  [4320, "Até 3 dias antes"],
  [10080, "Até 7 dias antes"],
] as const;

function optionLabel(options: ReadonlyArray<readonly [number, string]>, value: number): string {
  return options.find(([optionValue]) => optionValue === value)?.[1] ?? String(value);
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 rounded-xl bg-[var(--brand)] px-6 font-semibold text-[var(--surface)] transition hover:bg-[var(--brand-strong)] disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "Salvando regras..." : "Salvar e continuar"}
    </button>
  );
}

export function BookingRulesForm({ defaults }: { defaults: BookingRulesDefaults }) {
  const [state, formAction] = useActionState(saveBookingRulesAction, INITIAL_STATE);
  const [minimumNoticeMinutes, setMinimumNoticeMinutes] = useState(defaults.minimumNoticeMinutes);
  const [bookingWindowDays, setBookingWindowDays] = useState(defaults.bookingWindowDays);
  const [bufferAfterMinutes, setBufferAfterMinutes] = useState(defaults.bufferAfterMinutes);
  const [cancellationCutoffMinutes, setCancellationCutoffMinutes] = useState(
    defaults.cancellationCutoffMinutes,
  );
  const [rescheduleCutoffMinutes, setRescheduleCutoffMinutes] = useState(
    defaults.rescheduleCutoffMinutes,
  );
  const [autoConfirm, setAutoConfirm] = useState(defaults.autoConfirm);

  return (
    <form action={formAction} className="mt-8 space-y-6" noValidate>
      {state.message && (
        <div
          role="alert"
          className="rounded-xl border border-[var(--danger)] bg-[#f7ece9] p-4 text-sm leading-6 text-[var(--danger)]"
        >
          {state.message}
        </div>
      )}

      <section className="grid gap-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:grid-cols-2 sm:p-7">
        <div className="sm:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
            Novos agendamentos
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Quando a cliente poderá escolher</h2>
          <p className="mt-2 leading-7 text-[var(--foreground-muted)]">
            Essas regras controlam os horários que aparecem na sua página pública.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Antecedência mínima</span>
          <select
            name="minimumNoticeMinutes"
            value={minimumNoticeMinutes}
            onChange={(event) => setMinimumNoticeMinutes(Number(event.target.value))}
            className={SELECT_CLASS}
          >
            {NOTICE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">
            Evita que alguém marque um horário em cima da hora.
          </p>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Janela futura</span>
          <select
            name="bookingWindowDays"
            value={bookingWindowDays}
            onChange={(event) => setBookingWindowDays(Number(event.target.value))}
            className={SELECT_CLASS}
          >
            {WINDOW_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">
            Define até qual data as clientes poderão visualizar horários.
          </p>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">Intervalo após cada atendimento</span>
          <select
            name="bufferAfterMinutes"
            value={bufferAfterMinutes}
            onChange={(event) => setBufferAfterMinutes(Number(event.target.value))}
            className={SELECT_CLASS}
          >
            {BUFFER_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">
            Reserve tempo para limpeza, preparação, deslocamento ou descanso.
          </p>
        </label>
      </section>

      <section className="grid gap-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:grid-cols-2 sm:p-7">
        <div className="sm:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
            Alterações pela cliente
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Cancelamento e reagendamento</h2>
          <p className="mt-2 leading-7 text-[var(--foreground-muted)]">
            Depois do prazo escolhido, a cliente será orientada a falar diretamente com você.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Prazo para cancelar</span>
          <select
            name="cancellationCutoffMinutes"
            value={cancellationCutoffMinutes}
            onChange={(event) => setCancellationCutoffMinutes(Number(event.target.value))}
            className={SELECT_CLASS}
          >
            {CUTOFF_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Prazo para reagendar</span>
          <select
            name="rescheduleCutoffMinutes"
            value={rescheduleCutoffMinutes}
            onChange={(event) => setRescheduleCutoffMinutes(Number(event.target.value))}
            className={SELECT_CLASS}
          >
            {CUTOFF_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
              Confirmação
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Confirmar automaticamente</h2>
            <p className="mt-2 leading-7 text-[var(--foreground-muted)]">
              Quando ativado, o horário entra confirmado assim que a cliente conclui o agendamento.
              Desative para revisar cada solicitação manualmente.
            </p>
          </div>

          <label className="flex min-w-40 cursor-pointer items-center justify-center gap-3 rounded-full bg-[var(--surface-soft)] px-5 py-3 font-semibold">
            <input
              name="autoConfirm"
              type="checkbox"
              checked={autoConfirm}
              onChange={(event) => setAutoConfirm(event.target.checked)}
              className="size-5 accent-[var(--sage)]"
            />
            {autoConfirm ? "Ativada" : "Desativada"}
          </label>
        </div>
      </section>

      <aside className="rounded-3xl bg-[var(--foreground)] p-6 text-[var(--surface)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
          Resumo das regras
        </p>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <p className="rounded-2xl bg-white/5 p-4">
            <span className="block text-[var(--border)]">Antecedência</span>
            <strong className="mt-1 block text-base">
              {optionLabel(NOTICE_OPTIONS, minimumNoticeMinutes)}
            </strong>
          </p>
          <p className="rounded-2xl bg-white/5 p-4">
            <span className="block text-[var(--border)]">Agenda aberta</span>
            <strong className="mt-1 block text-base">
              {optionLabel(WINDOW_OPTIONS, bookingWindowDays)}
            </strong>
          </p>
          <p className="rounded-2xl bg-white/5 p-4">
            <span className="block text-[var(--border)]">Intervalo</span>
            <strong className="mt-1 block text-base">
              {optionLabel(BUFFER_OPTIONS, bufferAfterMinutes)}
            </strong>
          </p>
          <p className="rounded-2xl bg-white/5 p-4">
            <span className="block text-[var(--border)]">Confirmação</span>
            <strong className="mt-1 block text-base">
              {autoConfirm ? "Automática" : "Após sua revisão"}
            </strong>
          </p>
        </div>
      </aside>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/configuracao/disponibilidade"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 font-semibold hover:bg-[var(--surface-soft)]"
        >
          Voltar
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
