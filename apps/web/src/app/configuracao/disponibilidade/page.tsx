import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import {
  AvailabilityForm,
  type ExistingAvailabilityPeriod,
} from "@/features/onboarding/availability-form";

export const metadata = { title: "Configure sua disponibilidade" };
export const dynamic = "force-dynamic";

export default async function AvailabilityOnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/configuracao/disponibilidade");
  }

  const { data: business } = await supabase.from("businesses").select("id").maybeSingle();

  if (!business) {
    redirect("/configuracao/profissao");
  }

  const { data: rows, error } = await supabase
    .from("availability_periods")
    .select("id, weekday, start_time, end_time")
    .eq("business_id", business.id)
    .eq("is_active", true)
    .order("weekday")
    .order("start_time");

  if (error) {
    return (
      <main className="min-h-screen px-5 py-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--danger)] bg-[var(--surface)] p-8">
          <h1 className="text-4xl font-semibold">Não conseguimos carregar seus horários</h1>
          <p className="mt-4 leading-7 text-[var(--foreground-muted)]">
            Atualize a página. Caso o problema continue, volte para os serviços e tente novamente.
          </p>
        </div>
      </main>
    );
  }

  const existingPeriods: ExistingAvailabilityPeriod[] = (rows ?? []).map((period) => ({
    id: period.id,
    weekday: period.weekday,
    startTime: period.start_time,
    endTime: period.end_time,
  }));

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
          Configuração da sua agenda
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--brand-soft)]">
          <div className="h-full w-4/6 rounded-full bg-[var(--sage)]" />
        </div>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">Etapa 4 de 6</p>
        <h1 className="mt-10 text-5xl font-semibold tracking-tight">
          Defina seus dias e horários
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--foreground-muted)]">
          Informe quando você normalmente atende. Folgas, férias e horários especiais poderão ser
          adicionados depois sem alterar esta rotina semanal.
        </p>

        <AvailabilityForm existingPeriods={existingPeriods} />
      </div>
    </main>
  );
}
