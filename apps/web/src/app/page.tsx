import Link from "next/link";
import { Brand, SectionHeading } from "@cruz-agenda/ui";

const benefits = [
  "Clientes agendando sozinhas pelo seu link",
  "Agenda diária organizada no celular",
  "Bloqueio de folgas e compromissos",
  "Cadastro automático das clientes",
  "Cancelamento e reagendamento simples",
  "Sem aplicativo para instalar",
];

const audiences = [
  "Manicure e pedicure",
  "Designer de sobrancelhas",
  "Lash designer",
  "Cabeleireira",
  "Barbeiro",
  "Esteticista",
];

export default function HomePage() {
  return (
    <main>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color:var(--background)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Brand />
          <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--foreground-muted)] md:flex">
            <a href="#como-funciona">Como funciona</a>
            <a href="#beneficios">Benefícios</a>
            <a href="#preco">Preço</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/entrar"
              className="hidden min-h-11 items-center rounded-xl px-4 text-sm font-semibold sm:inline-flex"
            >
              Entrar
            </Link>
            <Link
              href="/criar-conta"
              className="inline-flex min-h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)]"
            >
              Criar agenda grátis
            </Link>
          </div>
        </div>
      </header>

      <section className="overflow-hidden px-5 pb-20 pt-16 sm:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-5 inline-flex rounded-full bg-[var(--brand-soft)] px-4 py-2 text-sm font-semibold text-[var(--brand-strong)]">
              15 dias grátis · sem cartão
            </p>
            <h1 className="max-w-3xl text-balance text-5xl font-bold leading-[1.06] tracking-tight sm:text-6xl">
              Suas clientes agendam sozinhas. Você economiza tempo.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-[var(--foreground-muted)] sm:text-xl">
              Crie sua agenda online, compartilhe seu link pelo WhatsApp ou Instagram e pare
              de responder horário por horário.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/criar-conta"
                className="inline-flex min-h-13 items-center justify-center rounded-xl bg-[var(--brand)] px-7 text-base font-semibold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)]"
              >
                Criar minha agenda grátis
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex min-h-13 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-7 text-base font-semibold transition hover:bg-[var(--surface-soft)]"
              >
                Ver como funciona
              </a>
            </div>
            <p className="mt-4 text-sm text-[var(--foreground-muted)]">
              Funciona no celular e suas clientes não precisam criar conta.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-8 -z-10 rounded-full bg-[var(--brand-soft)] blur-3xl" />
            <div className="rounded-[2rem] border border-[var(--border)] bg-white p-4 shadow-2xl shadow-pink-100">
              <div className="rounded-[1.5rem] bg-[#fff8fb] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--foreground-muted)]">Bom dia, Maria!</p>
                    <h2 className="mt-1 text-xl font-bold">Sua agenda de hoje</h2>
                  </div>
                  <span className="grid size-11 place-items-center rounded-full bg-[var(--brand-soft)] font-bold text-[var(--brand)]">
                    M
                  </span>
                </div>
                <div className="mt-5 rounded-2xl bg-[var(--brand)] p-5 text-white">
                  <p className="text-sm text-pink-100">Próximo atendimento</p>
                  <p className="mt-2 text-2xl font-bold">14:00 — Ana Souza</p>
                  <p className="mt-1 text-pink-100">Manicure e pedicure · 2 horas</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
                    <p className="text-sm text-[var(--foreground-muted)]">Hoje</p>
                    <p className="mt-1 text-2xl font-bold">4</p>
                    <p className="text-sm">agendamentos</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
                    <p className="text-sm text-[var(--foreground-muted)]">Esta semana</p>
                    <p className="mt-1 text-2xl font-bold">8</p>
                    <p className="text-sm">feitos pelo link</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    ["09:00", "Carla", "Concluído"],
                    ["11:00", "Juliana", "Confirmado"],
                    ["14:00", "Ana", "Confirmado"],
                  ].map(([time, name, status]) => (
                    <div
                      key={`${time}-${name}`}
                      className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white p-4"
                    >
                      <span className="font-bold text-[var(--brand)]">{time}</span>
                      <span className="flex-1 font-semibold">{name}</span>
                      <span className="text-xs text-[var(--foreground-muted)]">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-white px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            align="center"
            eyebrow="Como funciona"
            title="Sua agenda online pronta em poucos passos"
            description="O Cruz Agenda guia toda a configuração. Você cadastra o básico, compartilha seu link e começa a receber horários."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              ["01", "Configure sua agenda", "Cadastre serviços, preços e seus horários de atendimento."],
              ["02", "Compartilhe seu link", "Envie pelo WhatsApp ou coloque na bio do Instagram."],
              ["03", "Receba agendamentos", "A cliente escolhe o melhor horário e ele aparece no seu painel."],
            ].map(([number, title, text]) => (
              <article key={number} className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-7">
                <span className="text-sm font-bold text-[var(--brand)]">{number}</span>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-[var(--foreground-muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="px-5 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Menos mensagens"
            title="Mais organização para você cuidar do que realmente importa"
            description="A cliente vê os horários livres e agenda sem esperar sua resposta. O sistema evita conflitos e mantém tudo organizado."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex gap-3 rounded-2xl border border-[var(--border)] bg-white p-4">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-[var(--success)]">
                  ✓
                </span>
                <span className="font-medium leading-6">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            align="center"
            eyebrow="Feito para autônomos"
            title="Para quem atende com horário marcado"
          />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {audiences.map((audience) => (
              <span key={audience} className="rounded-full border border-[var(--border)] bg-[var(--background)] px-5 py-3 font-semibold">
                {audience}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="preco" className="px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-[var(--border)] bg-white p-7 shadow-xl shadow-pink-100 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Plano simples</p>
          <h2 className="mt-4 text-3xl font-bold">Cruz Agenda Individual</h2>
          <div className="mt-6 flex items-end gap-2">
            <span className="text-5xl font-bold">R$ 29,90</span>
            <span className="pb-1 text-[var(--foreground-muted)]">por mês</span>
          </div>
          <ul className="mt-8 space-y-3 text-[var(--foreground-muted)]">
            {[
              "15 dias grátis sem cartão",
              "Página de agendamento própria",
              "Agendamentos e serviços ilimitados",
              "Agenda e cadastro de clientes",
              "Cancelamento e reagendamento",
              "Suporte e atualizações",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="font-bold text-[var(--success)]">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/criar-conta"
            className="mt-9 inline-flex min-h-13 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-6 text-base font-semibold text-white transition hover:bg-[var(--brand-strong)]"
          >
            Começar 15 dias grátis
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-white px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Brand />
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">Um produto Cruz Labs.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-[var(--foreground-muted)]">
            <Link href="/termos">Termos</Link>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/entrar">Entrar</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
