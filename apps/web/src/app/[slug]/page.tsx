import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import {
  PublicBusinessPage,
  type PublicBusinessView,
} from "@/features/public-page/public-business-page";

export const metadata = {
  title: "Agendamento online",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

function readString(record: Record<string, unknown>, key: string): string | null {
  return typeof record[key] === "string" ? record[key] : null;
}

function readBoolean(record: Record<string, unknown>, key: string): boolean {
  return record[key] === true;
}

function parsePublicBusinessPage(value: unknown): PublicBusinessView | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const slug = readString(record, "slug");
  const businessName = readString(record, "business_name");
  const publicProfessionName = readString(record, "public_profession_name");
  const rawServices = record.services;

  if (!slug || !businessName || !publicProfessionName || !Array.isArray(rawServices)) {
    return null;
  }

  const services = rawServices.flatMap((rawService) => {
    if (!rawService || typeof rawService !== "object" || Array.isArray(rawService)) {
      return [];
    }

    const service = rawService as Record<string, unknown>;
    const name = readString(service, "name");
    const durationMinutes = Number(service.duration_minutes);
    const rawPriceCents = service.price_cents;
    const priceCents = rawPriceCents === null ? null : Number(rawPriceCents);

    if (!name || !Number.isInteger(durationMinutes) || durationMinutes < 1) {
      return [];
    }

    return [
      {
        id: readString(service, "id") ?? undefined,
        name,
        description: readString(service, "description"),
        durationMinutes,
        priceCents: priceCents !== null && Number.isInteger(priceCents) ? priceCents : null,
        showPrice: readBoolean(service, "show_price"),
      },
    ];
  });

  if (services.length === 0) {
    return null;
  }

  return {
    slug,
    businessName,
    publicProfessionName,
    description: readString(record, "description"),
    instagramUsername: readString(record, "instagram_username"),
    themeKey: readString(record, "theme_key") ?? "essencia_nobre",
    imagePath: readString(record, "image_path"),
    locationText: readString(record, "location_text"),
    serviceLocationType: readString(record, "service_location_type"),
    onlineBookingPaused: readBoolean(record, "online_booking_paused"),
    services,
  };
}

export default async function PublicSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_public_business_page", {
    selected_slug: slug,
  });

  if (error) {
    console.error("Failed to load public business page", error.message);
    notFound();
  }

  const publicPage = parsePublicBusinessPage(data);

  if (!publicPage) {
    notFound();
  }

  return <PublicBusinessPage data={publicPage} />;
}
