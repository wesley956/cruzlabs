import Link from "next/link";
import { Brand } from "@cruz-agenda/ui";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <section className="hidden bg-[var(--brand)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Brand className="text-white" />
        <div className="max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pink-100">Cruz Agenda</p>
          <h1 className="mt-5 text-5xl font-bold leading-tight">Suas clientes escolhem o horário. Você cuida do atendimento.</h1>
          <p className="mt-5 text-lg leading-8 text-pink-100">Uma agenda simples, feita para funcionar muito bem no celular.</p>
        </div>
        <p className="text-sm text-pink-100">© 2026 Cruz Labs</p>
      </section>
      <section className="flex min-h-screen flex-col px-5 py-6 lg:px-14">
        <Link href="/" className="lg:hidden"><Brand /></Link>
        <div className="mx-auto my-auto w-full max-w-md py-12">{children}</div>
      </section>
    </main>
  );
}
