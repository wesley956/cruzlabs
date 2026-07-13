import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import {
  BookingRulesForm,
  type BookingRulesDefaults,
} from "@/features/onboarding/booking-rules-form";

export const metadata = { title: "Configure as regras de agendamento" };
export const dynamic = "force-dynamic";

export default async function BookingRulesOnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/configuracao/regras");
  }

  const { data: business } = await supabase.from("businesses").select("id").maybeSingle();

  if (!business) {
    redirect("/configuracao/profissao");
  }

  const [{ data: firstAvailability }, { data: settings, error }] = await Promise.all([
    supabase
      .from("availability_periods")
      .select("id")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("booking_settings")
      .select(
        "minimum_notice_minutes, booking_window_days, buffer_after_minutes, cancellation_cutoff_minutes, reschedule_cutoff_minutes, auto_confirm",
      )
      .eq("business_id", business.id)
      .maybeSingle(),
  ]);

  if (!firstAvailability) {
    redirect("/configuracao/disponibilidade");
  }

  if (error) {
    return (
      <main className="min-h-screen px-5 py-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--danger)] bg-[var(--surface)] p-8">
          <h1 className="text-4xl font-semibold">Não conseguimos carregar as regras</h1>
          <p className="mt-4 leading-7 text-[var(--foreground-muted)]">
            Atualize a página. Caso o problema continue, volte para os horários e tente novamente.
          </p>
        </div>
      </main>
    );
  }

  const defaults: BookingRulesDefaults = {
    minimumNoticeMinutes: settings?.minimum_notice_minutes ?? 120,
    bookingWindowDays: settings?.booking_window_days ?? 60,
    bufferAfterMinutes: settings?.buffer_after_minutes ?? 0,
    cancellationCutoffMinutes: settings?.cancellation_cutoff_minutes ?? 1440,
    rescheduleCutoffMinutes: settings?.reschedule_cutoff_minutes ?? 1440,
    autoConfirm: settings?.auto_confirm ?? true,
  };

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
          Configuração da sua agenda
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--brand-soft)]">
          <div className="h-full w-5/6 rounded-full bg-[var(--sage)]" />
        </div>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">Etapa 5 de 6</p>
        <h1 className="mt-10 text-5xl font-semibold tracking-tight">
          Defina as regras dos agendamentos
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--foreground-muted)]">
          Escolha como os horários serão oferecidos e até quando suas clientes poderão cancelar ou
          reagendar sozinhas.
        </p>

        <BookingRulesForm defaults={defaults} />
      </div>
    </main>
  );
}
