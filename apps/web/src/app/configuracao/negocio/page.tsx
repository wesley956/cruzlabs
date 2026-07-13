import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import {
  BusinessForm,
  type BusinessDefaults,
} from "@/features/onboarding/onboarding-forms";

export const metadata = { title: "Informações do negócio" };
export const dynamic = "force-dynamic";

export default async function BusinessOnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/configuracao/negocio");
  }

  const [{ data: business }, { data: profile }] = await Promise.all([
    supabase
      .from("businesses")
      .select(
        "business_name, public_profession_name, whatsapp, description, instagram_username, city, state, service_location_type, address_visibility, postal_code, street, number, complement, neighborhood",
      )
      .maybeSingle(),
    supabase.from("profiles").select("whatsapp").single(),
  ]);

  if (!business) {
    redirect("/configuracao/profissao");
  }

  const defaults: BusinessDefaults = {
    businessName: business.business_name ?? "",
    publicProfessionName: business.public_profession_name ?? "",
    whatsapp: business.whatsapp ?? profile?.whatsapp ?? "",
    description: business.description ?? "",
    instagramUsername: business.instagram_username ?? "",
    city: business.city ?? "",
    state: business.state ?? "",
    serviceLocationType: business.service_location_type ?? "own_space",
    addressVisibility: business.address_visibility ?? "city",
    postalCode: business.postal_code ?? "",
    street: business.street ?? "",
    number: business.number ?? "",
    complement: business.complement ?? "",
    neighborhood: business.neighborhood ?? "",
  };

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
          Configuração da sua agenda
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--brand-soft)]">
          <div className="h-full w-2/6 rounded-full bg-[var(--sage)]" />
        </div>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">Etapa 2 de 6</p>
        <h1 className="mt-10 text-5xl font-semibold tracking-tight">Apresente seu trabalho</h1>
        <p className="mt-4 text-lg leading-8 text-[var(--foreground-muted)]">
          Informe os dados que identificam seu negócio e escolha com cuidado o que será mostrado às
          clientes.
        </p>

        <BusinessForm defaults={defaults} />
      </div>
    </main>
  );
}
