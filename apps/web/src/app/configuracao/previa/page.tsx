import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import {
  PublicBusinessPage,
  type PublicBusinessView,
} from "@/features/public-page/public-business-page";
import { PublishConfirmation } from "@/features/onboarding/publish-confirmation";

export const metadata = {
  title: "Prévia da sua página",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

function buildLocationText(business: {
  address_visibility: string;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
}): string | null {
  const cityState = [business.city, business.state].filter(Boolean).join(" - ");

  if (business.address_visibility === "full") {
    return [business.street, business.number, business.complement, business.neighborhood, cityState]
      .filter(Boolean)
      .join(", ");
  }

  if (business.address_visibility === "neighborhood_city") {
    return [business.neighborhood, cityState].filter(Boolean).join(", ");
  }

  if (business.address_visibility === "city") {
    return cityState || null;
  }

  return null;
}

export default async function PublicPagePreview() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/configuracao/previa");
  }

  const [{ data: profile }, { data: business }, { data: services }] = await Promise.all([
    supabase.from("profiles").select("onboarding_completed").single(),
    supabase
      .from("businesses")
      .select(
        "id, slug, business_name, public_profession_name, description, instagram_username, theme_key, image_path, address_visibility, service_location_type, street, number, complement, neighborhood, city, state, online_booking_paused",
      )
      .maybeSingle(),
    supabase
      .from("services")
      .select(
        "id, name, description, duration_minutes, price_cents, show_price, online_booking_enabled, is_active",
      )
      .eq("is_active", true)
      .eq("online_booking_enabled", true)
      .order("display_order"),
  ]);

  if (profile?.onboarding_completed) {
    redirect("/painel");
  }

  if (!business) {
    redirect("/configuracao/profissao");
  }

  if (!business.slug) {
    redirect("/configuracao/link");
  }

  if (!business.business_name || !business.public_profession_name || !services?.length) {
    redirect("/configuracao/servicos");
  }

  const view: PublicBusinessView = {
    slug: business.slug,
    businessName: business.business_name,
    publicProfessionName: business.public_profession_name,
    description: business.description,
    instagramUsername: business.instagram_username,
    themeKey: business.theme_key,
    imagePath: business.image_path,
    locationText: buildLocationText(business),
    serviceLocationType: business.service_location_type,
    onlineBookingPaused: business.online_booking_paused,
    services: services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      durationMinutes: service.duration_minutes,
      priceCents: service.price_cents,
      showPrice: service.show_price,
    })),
  };

  return (
    <div>
      <PublicBusinessPage data={view} preview />
      <div className="bg-[var(--background)] px-5 pb-16">
        <div className="mx-auto max-w-4xl">
          <PublishConfirmation slug={business.slug} />
        </div>
      </div>
    </div>
  );
}
