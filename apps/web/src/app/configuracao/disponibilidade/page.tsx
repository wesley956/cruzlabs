import Link from "next/link";

export const metadata = { title: "Configure sua disponibilidade" };

export default function AvailabilityOnboardingPage() {
  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
          Configuração da sua agenda
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--brand-soft)]">
          <div className="h-full w-4/6 rounded-full bg-[var(--sage)]" />
        </div>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">Etapa 4 de 6</p>

        <section className="mt-10 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-xl shadow-[#ded8ce] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
            Próxima construção
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">
            Defina seus dias e horários
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--foreground-muted)]">
            Seus serviços já foram salvos. A próxima implementação permitirá configurar vários
            períodos por dia, intervalos, folgas e datas especiais.
          </p>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Link
              href="/configuracao/servicos"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 font-semibold hover:bg-[var(--surface-soft)]"
            >
              Voltar
            </Link>
            <span className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--sage-soft)] px-6 font-semibold text-[var(--sage)]">
              Serviços salvos com segurança
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
