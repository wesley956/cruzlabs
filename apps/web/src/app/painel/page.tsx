import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import { Brand } from "@cruz-agenda/ui";
import { signOutAction } from "@/features/auth/actions";

export const metadata = { title: "Painel" };
export const dynamic = "force-dynamic";

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function calculateTrialDays(trialEndsAt: string | null): number {
  if (!trialEndsAt) {
    return 0;
  }

  const remainingMilliseconds = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(remainingMilliseconds / 86_400_000));
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/painel");
  }

  const [{ data: profile }, { data: business }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("full_name, onboarding_completed").single(),
    supabase
      .from("businesses")
      .select("id, slug, business_name, public_status, published_at")
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("status, trial_started_at, trial_ends_at, amount_cents, currency, provider")
      .maybeSingle(),
  ]);

  if (!profile?.onboarding_completed) {
    redirect("/boas-vindas");
  }

  const resolvedSearchParams = await searchParams;
  const wasPublished = resolvedSearchParams.publicada === "1";
  const trialDays = calculateTrialDays(subscription?.trial_ends_at ?? null);

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <Brand />
          <form action={signOutAction}>
            <button
              type="submit"
              className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold hover:bg-[var(--surface-soft)]"
            >
              Sair
            </button>
          </form>
        </header>

        {wasPublished && (
          <section className="mt-8 rounded-3xl border border-[var(--sage)] bg-[var(--sage-soft)] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
              Agenda publicada
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Sua página já está no ar</h1>
            <p className="mt-2 leading-7 text-[var(--foreground-muted)]">
              O período gratuito foi iniciado com sucesso e seu link já pode ser aberto e revisado.
            </p>
          </section>
        )}

        <section className="mt-10 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl shadow-[#ded8ce] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
            Área protegida
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">Olá, {profile.full_name}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--foreground-muted)]">
            Sua conta, negócio, serviços, horários e regras já estão configurados. Os próximos módulos
            transformarão esta tela no painel operacional completo da sua agenda.
          </p>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
              Página pública
            </p>
            <h2 className="mt-2 text-3xl font-semibold">{business?.business_name ?? "Sua agenda"}</h2>
            {business?.slug ? (
              <>
                <p className="mt-3 break-all rounded-xl bg-[var(--surface-soft)] px-4 py-3 font-semibold">
                  /{business.slug}
                </p>
                <Link
                  href={`/${business.slug}`}
                  target="_blank"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] px-5 text-sm font-semibold hover:bg-[var(--surface-soft)]"
                >
                  Abrir página pública
                </Link>
              </>
            ) : (
              <p className="mt-3 text-[var(--foreground-muted)]">Link ainda não definido.</p>
            )}
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--foreground)] p-6 text-[var(--surface)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
              Assinatura
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              {subscription?.status === "trialing"
                ? `${trialDays} dia${trialDays === 1 ? "" : "s"} grátis restante${trialDays === 1 ? "" : "s"}`
                : "Status da assinatura"}
            </h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-[#d8d0c4]">Situação</dt>
                <dd className="font-semibold">{subscription?.status ?? "Não disponível"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-[#d8d0c4]">Teste termina</dt>
                <dd className="text-right font-semibold">
                  {formatDate(subscription?.trial_ends_at ?? null)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#d8d0c4]">Pagamento preparado</dt>
                <dd className="font-semibold">Mercado Pago</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </main>
  );
}
