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
      <aside className="hidden border-r border-[var(--border)] bg-white p-6 lg:block">
        <Brand />
        <nav className="mt-10 space-y-1 text-sm font-medium text-[var(--foreground-muted)]">
          {['Visão geral', 'Profissionais', 'Assinaturas', 'Pagamentos', 'Suporte', 'Métricas', 'Webhooks', 'Auditoria'].map((item, index) => (
            <a key={item} href="#" className={`block rounded-xl px-4 py-3 ${index === 0 ? 'bg-[var(--brand-soft)] text-[var(--brand)]' : 'hover:bg-[var(--surface-soft)]'}`}>{item}</a>
          ))}
        </nav>
      </aside>
      <section className="p-5 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--brand)]">Cruz Labs</p>
              <h1 className="mt-1 text-3xl font-bold">Visão geral</h1>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">AMBIENTE LOCAL</span>
          </header>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(([label, value, helper]) => (
              <article key={label} className="rounded-2xl border border-[var(--border)] bg-white p-5">
                <p className="text-sm text-[var(--foreground-muted)]">{label}</p>
                <p className="mt-2 text-3xl font-bold">{value}</p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">{helper}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <article className="min-h-80 rounded-2xl border border-[var(--border)] bg-white p-6">
              <h2 className="text-lg font-bold">Funil de ativação</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-4">
                {['Cadastros', 'Onboarding', 'Primeiro agendamento', 'Assinaturas'].map((label, index) => (
                  <div key={label} className="relative rounded-xl bg-[var(--surface-soft)] p-4">
                    <p className="text-2xl font-bold">0</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">{label}</p>
                    {index < 3 && <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-[var(--foreground-muted)] sm:block">→</span>}
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <h2 className="text-lg font-bold">Atenção</h2>
              <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">Nenhuma pendência operacional. Os alertas de pagamento, Webhooks e suporte aparecerão aqui.</div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
