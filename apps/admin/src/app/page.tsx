import { Brand } from "@cruz-agenda/ui";

const metrics = [
  ["Profissionais", "0", "Total cadastradas"],
  ["Em teste", "0", "Período gratuito"],
  ["Assinaturas", "0", "Contas ativas"],
  ["MRR", "R$ 0", "Receita recorrente"],
];

export default function AdminHomePage() {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden border-r border-[var(--border)] bg-[var(--surface)] p-6 lg:block">
        <Brand />
        <nav className="mt-10 space-y-1 text-sm font-medium text-[var(--foreground-muted)]">
          {[
            "Visão geral",
            "Profissionais",
            "Assinaturas",
            "Pagamentos",
            "Suporte",
            "Métricas",
            "Webhooks",
            "Auditoria",
          ].map((item, index) => (
            <a
              key={item}
              href="#"
              className={`block rounded-xl px-4 py-3 ${
                index === 0
                  ? "border border-[var(--border)] bg-[var(--gold-soft)] text-[var(--foreground)]"
                  : "hover:bg-[var(--surface-soft)]"
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>
      <section className="p-5 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
                Cruz Labs
              </p>
              <h1 className="mt-1 text-4xl font-semibold">Visão geral</h1>
            </div>
            <span className="rounded-full border border-[var(--border)] bg-[var(--gold-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]">
              AMBIENTE LOCAL
            </span>
          </header>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(([label, value, helper]) => (
              <article
                key={label}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <p className="text-sm text-[var(--foreground-muted)]">{label}</p>
                <p className="mt-2 font-display text-4xl font-semibold">{value}</p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">{helper}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <article className="min-h-80 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-2xl font-semibold">Funil de ativação</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-4">
                {["Cadastros", "Onboarding", "Primeiro agendamento", "Assinaturas"].map(
                  (label, index) => (
                    <div
                      key={label}
                      className="relative rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
                    >
                      <p className="font-display text-3xl font-semibold">0</p>
                      <p className="mt-1 text-sm text-[var(--foreground-muted)]">{label}</p>
                      {index < 3 && (
                        <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-[var(--gold)] sm:block">
                          →
                        </span>
                      )}
                    </div>
                  ),
                )}
              </div>
            </article>
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-2xl font-semibold">Atenção</h2>
              <div className="mt-5 rounded-xl bg-[var(--sage-soft)] p-4 text-sm leading-6 text-[var(--foreground)]">
                Nenhuma pendência operacional. Os alertas de pagamento, Webhooks e suporte
                aparecerão aqui.
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
