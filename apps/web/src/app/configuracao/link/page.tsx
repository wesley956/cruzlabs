import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import { normalizePublicSlug } from "@cruz-agenda/validation";
import { PublicLinkForm } from "@/features/onboarding/public-link-form";

export const metadata = { title: "Crie o link da sua agenda" };
export const dynamic = "force-dynamic";

export default async function PublicLinkOnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/configuracao/link");
  }

  const [{ data: profile }, { data: business }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("onboarding_completed").single(),
    supabase.from("businesses").select("id, business_name, slug").maybeSingle(),
    supabase.from("booking_settings").select("id").maybeSingle(),
  ]);

  if (profile?.onboarding_completed) {
    redirect("/painel");
  }

  if (!business) {
    redirect("/configuracao/profissao");
  }

  if (!settings) {
    redirect("/configuracao/regras");
  }

  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const baseUrl = configuredBaseUrl ?? (host ? `${protocol}://${host}` : "");
  const suggestedSlug = normalizePublicSlug(business.business_name ?? "minha-agenda");

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
          Configuração da sua agenda
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--brand-soft)]">
          <div className="h-full w-full rounded-full bg-[var(--sage)]" />
        </div>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">Etapa 6 de 6</p>
        <h1 className="mt-10 text-5xl font-semibold tracking-tight">
          Escolha o link da sua agenda
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--foreground-muted)]">
          Este será o endereço compartilhado no WhatsApp, Instagram e cartão digital para suas
          clientes acessarem sua página.
        </p>

        <PublicLinkForm
          initialSlug={business.slug ?? ""}
          suggestedSlug={suggestedSlug}
          baseUrl={baseUrl}
        />
      </div>
    </main>
  );
}
