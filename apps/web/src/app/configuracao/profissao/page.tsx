const professions = [
  "Manicure e pedicure",
  "Designer de sobrancelhas",
  "Lash designer",
  "Cabeleireira",
  "Barbeiro",
  "Esteticista",
  "Maquiadora",
  "Outra atividade",
];

export const metadata = { title: "Escolha sua profissão" };

export default function ProfessionPage() {
  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
          Configuração da sua agenda
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--brand-soft)]">
          <div className="h-full w-1/6 rounded-full bg-[var(--sage)]" />
        </div>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">Etapa 1 de 6</p>
        <h1 className="mt-10 text-5xl font-semibold tracking-tight">
          Qual é a sua principal atividade?
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--foreground-muted)]">
          Usaremos essa escolha para sugerir serviços que você poderá editar livremente.
        </p>
        <form className="mt-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {professions.map((profession) => (
              <label
                key={profession}
                className="flex min-h-20 cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 font-semibold transition hover:border-[var(--gold)] hover:bg-[var(--surface-soft)]"
              >
                <input
                  type="radio"
                  name="profession"
                  value={profession}
                  className="size-4 accent-[var(--sage)]"
                />
                {profession}
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="mt-8 min-h-12 w-full rounded-xl bg-[var(--brand)] px-6 font-semibold text-[var(--surface)] hover:bg-[var(--brand-strong)] sm:w-auto"
          >
            Continuar
          </button>
        </form>
      </div>
    </main>
  );
}
