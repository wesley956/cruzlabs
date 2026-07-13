import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import {
  ServicesForm,
  type ExistingService,
  type ServiceTemplateOption,
} from "@/features/onboarding/services-form";

export const metadata = { title: "Configure seus serviços" };
export const dynamic = "force-dynamic";

export default async function ServicesOnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/configuracao/servicos");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, profession_key")
    .maybeSingle();

  if (!business) {
    redirect("/configuracao/profissao");
  }

  const [{ data: templateRows, error: templatesError }, { data: serviceRows }] = await Promise.all([
    supabase
      .from("service_templates")
      .select("id, name, description, suggested_duration_minutes, suggested_price_cents")
      .eq("profession_key", business.profession_key)
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("services")
      .select(
        "id, template_id, name, description, duration_minutes, price_cents, show_price, online_booking_enabled",
      )
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("display_order"),
  ]);

  if (templatesError) {
    return (
      <main className="min-h-screen px-5 py-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--danger)] bg-[var(--surface)] p-8">
          <h1 className="text-4xl font-semibold">Não conseguimos carregar os serviços</h1>
          <p className="mt-4 leading-7 text-[var(--foreground-muted)]">
            Atualize a página. Caso o problema continue, volte para a profissão e tente novamente.
          </p>
        </div>
      </main>
    );
  }

  const templates: ServiceTemplateOption[] = (templateRows ?? []).map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    suggestedDurationMinutes: template.suggested_duration_minutes,
    suggestedPriceCents: template.suggested_price_cents,
  }));

  const existingServices: ExistingService[] = (serviceRows ?? []).map((service) => ({
    id: service.id,
    templateId: service.template_id,
    name: service.name,
    description: service.description,
    durationMinutes: service.duration_minutes,
    priceCents: service.price_cents,
    showPrice: service.show_price,
    onlineBookingEnabled: service.online_booking_enabled,
  }));

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
          Configuração da sua agenda
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--brand-soft)]">
          <div className="h-full w-3/6 rounded-full bg-[var(--sage)]" />
        </div>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">Etapa 3 de 6</p>
        <h1 className="mt-10 text-5xl font-semibold tracking-tight">Cadastre seus serviços</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--foreground-muted)]">
          Escolha sugestões ou crie seus próprios serviços. Duração e preço poderão ser alterados
          mais tarde sem modificar agendamentos já confirmados.
        </p>

        <ServicesForm templates={templates} existingServices={existingServices} />
      </div>
    </main>
  );
}
