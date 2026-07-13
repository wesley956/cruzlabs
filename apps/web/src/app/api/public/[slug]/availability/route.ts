import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import { isValidPublicSlug, validatePublicAvailabilityQuery } from "@cruz-agenda/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const normalizedSlug = slug.trim().toLowerCase();

  if (!isValidPublicSlug(normalizedSlug)) {
    return NextResponse.json({ message: "Página não encontrada." }, { status: 404 });
  }

  const validation = validatePublicAvailabilityQuery({
    serviceId: request.nextUrl.searchParams.get("serviceId") ?? "",
    startDate: request.nextUrl.searchParams.get("startDate"),
    days: request.nextUrl.searchParams.get("days"),
  });

  if (!validation.success) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_public_availability", {
    selected_slug: normalizedSlug,
    selected_service_id: validation.data.serviceId,
    selected_start_date: validation.data.startDate,
    selected_days: validation.data.days,
  });

  if (error) {
    console.error("Failed to load public availability", error.message);
    return NextResponse.json(
      { message: "Não foi possível consultar os horários agora." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ message: "Disponibilidade não encontrada." }, { status: 404 });
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
