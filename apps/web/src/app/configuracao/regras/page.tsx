import Link from "next/link";

export const metadata = { title: "Configure as regras de agendamento" };

export default function BookingRulesOnboardingPage() {
  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
          Configuração da sua agenda
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--brand-soft)]">
          <div className="h-full w-5/6 rounded-full bg-[var(--sage)]" />
        </div>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">Etapa 5 de 6</p>

        <section className="mt-10 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-xl shadow-[#ded8ce] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
            Próxima construção
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">
            Defina as regras dos agendamentos
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--foreground-muted)]">
            Seus horários semanais já foram salvos. A próxima implementação adicionará antecedência,
            intervalo entre atendimentos, prazo de cancelamento e janela futura.
          </p>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Link
              href="/configuracao/disponibilidade"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 font-semibold hover:bg-[var(--surface-soft)]"
            >
              Voltar
            </Link>
            <span className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--sage-soft)] px-6 font-semibold text-[var(--sage)]">
              Horários salvos com segurança
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
