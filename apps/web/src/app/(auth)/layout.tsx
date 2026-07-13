import Link from "next/link";
import { Brand } from "@cruz-agenda/ui";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-[var(--surface)] lg:grid lg:grid-cols-2">
      <section className="hidden bg-[var(--foreground)] p-12 text-[var(--surface)] lg:flex lg:flex-col lg:justify-between">
        <Brand className="text-[var(--surface)]" />
        <div className="max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
            Cruz Agenda
          </p>
          <h1 className="mt-5 text-6xl font-semibold leading-tight">
            Organize seu tempo. Cuide da sua essência.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--border)]">
            Uma agenda serena, simples e elegante para profissionais que valorizam presença e
            organização.
          </p>
        </div>
        <p className="text-sm text-[var(--border)]">© 2026 Cruz Labs</p>
      </section>
      <section className="flex min-h-screen flex-col px-5 py-6 lg:px-14">
        <Link href="/" className="lg:hidden">
          <Brand />
        </Link>
        <div className="mx-auto my-auto w-full max-w-md py-12">{children}</div>
      </section>
    </main>
  );
}
