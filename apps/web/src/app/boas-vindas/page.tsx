import Link from "next/link";
import { Brand } from "@cruz-agenda/ui";

export const metadata = { title: "Boas-vindas" };

export default function WelcomePage() {
  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <Brand />
        <section className="mt-16 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-xl shadow-[#ded8ce] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
            Bem-vinda
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">
            Vamos preparar sua agenda com simplicidade?
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--foreground-muted)]">
            Em poucos passos você cadastrará sua profissão, serviços, horários e o link que será
            compartilhado com as clientes.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Sua profissão",
              "Seus serviços",
              "Dias e horários",
              "Seu link público",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 font-semibold"
              >
                <span className="mr-2 text-[var(--gold)]">{index + 1}.</span>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-[var(--sage-soft)] p-5 text-[var(--foreground)]">
            <strong>Seus 15 dias grátis ainda não começaram.</strong>
            <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
              O teste começa somente quando sua agenda estiver pronta e publicada.
            </p>
          </div>
          <Link
            href="/configuracao/profissao"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-6 font-semibold text-[var(--surface)] hover:bg-[var(--brand-strong)] sm:w-auto"
          >
            Começar minha configuração
          </Link>
        </section>
      </div>
    </main>
  );
}
