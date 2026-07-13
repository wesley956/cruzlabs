import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import { Brand } from "@cruz-agenda/ui";

export const metadata = { title: "Boas-vindas" };
export const dynamic = "force-dynamic";

const STEP_PATHS: Record<string, string> = {
  welcome: "/configuracao/profissao",
  profession: "/configuracao/profissao",
  business: "/configuracao/negocio",
  services: "/configuracao/servicos",
  availability: "/configuracao/disponibilidade",
  rules: "/configuracao/regras",
  link: "/configuracao/link",
};

export default async function WelcomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/boas-vindas");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_step, onboarding_completed")
    .single();

  if (profile?.onboarding_completed) {
    redirect("/painel");
  }

  const nextPath = STEP_PATHS[profile?.onboarding_step ?? "welcome"] ?? STEP_PATHS.welcome;
  const hasStarted = !["welcome", "profession"].includes(profile?.onboarding_step ?? "welcome");

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <Brand />
        <section className="mt-16 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-xl shadow-[#ded8ce] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
            {hasStarted ? "Continue de onde parou" : "Bem-vinda"}
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">
            {profile?.full_name
              ? `${profile.full_name}, vamos preparar sua agenda?`
              : "Vamos preparar sua agenda com simplicidade?"}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--foreground-muted)]">
            Em poucos passos você cadastrará sua profissão, serviços, horários e o link que será
            compartilhado com as clientes.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Sua profissão e negócio",
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
            href={nextPath}
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-6 font-semibold text-[var(--surface)] hover:bg-[var(--brand-strong)] sm:w-auto"
          >
            {hasStarted ? "Continuar configuração" : "Começar minha configuração"}
          </Link>
        </section>
      </div>
    </main>
  );
}
