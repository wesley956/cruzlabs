import { PublicAvailabilityPicker } from "./public-availability-picker";

export type PublicServiceView = {
  id?: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number | null;
  showPrice: boolean;
};

export type PublicBusinessView = {
  slug: string;
  businessName: string;
  publicProfessionName: string;
  description: string | null;
  instagramUsername: string | null;
  themeKey: string;
  imagePath: string | null;
  locationText: string | null;
  serviceLocationType: string | null;
  onlineBookingPaused: boolean;
  services: PublicServiceView[];
};

function formatPrice(priceCents: number | null, showPrice: boolean): string {
  if (priceCents === null || !showPrice) {
    return "Consulte o valor";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
}

function describeLocation(data: PublicBusinessView): string {
  if (data.locationText) {
    return data.locationText;
  }

  switch (data.serviceLocationType) {
    case "home_service":
      return "Atendimento a domicílio";
    case "mixed":
      return "Espaço próprio e atendimento a domicílio";
    case "arranged_location":
      return "Local combinado após o agendamento";
    default:
      return "Local informado após a confirmação";
  }
}

function businessInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function PublicBusinessPage({
  data,
  preview = false,
}: {
  data: PublicBusinessView;
  preview?: boolean;
}) {
  const instagramUrl = data.instagramUsername
    ? `https://www.instagram.com/${encodeURIComponent(data.instagramUsername.replace(/^@/, ""))}`
    : null;
  const availabilityServices = data.services.flatMap((service) =>
    service.id
      ? [
          {
            id: service.id,
            name: service.name,
            durationMinutes: service.durationMinutes,
          },
        ]
      : [],
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {preview && (
        <div className="border-b border-[var(--gold)] bg-[var(--gold-soft)] px-5 py-3 text-center text-sm font-semibold text-[var(--foreground)]">
          Prévia privada — somente você pode ver esta versão antes da publicação.
        </div>
      )}

      <main className="px-5 py-10 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <header className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-xl shadow-[#ded8ce] sm:p-12">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
              <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-3xl font-semibold text-[var(--surface)] shadow-lg shadow-[#d8d0c4]">
                {businessInitials(data.businessName)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
                  {data.publicProfessionName}
                </p>
                <h1 className="mt-2 break-words text-5xl font-semibold tracking-tight">
                  {data.businessName}
                </h1>
                <p className="mt-3 text-base font-medium text-[var(--foreground-muted)]">
                  {describeLocation(data)}
                </p>
              </div>
            </div>

            {data.description && (
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--foreground-muted)]">
                {data.description}
              </p>
            )}

            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-5 text-sm font-semibold hover:border-[var(--gold)]"
              >
                Instagram @{data.instagramUsername?.replace(/^@/, "")}
              </a>
            )}
          </header>

          <section className="mt-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
                Serviços
              </p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight">
                Escolha seu atendimento
              </h2>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {data.services.map((service) => (
                <article
                  key={service.id ?? service.name}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <h3 className="text-2xl font-semibold">{service.name}</h3>
                  {service.description && (
                    <p className="mt-2 leading-7 text-[var(--foreground-muted)]">
                      {service.description}
                    </p>
                  )}
                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-4 text-sm">
                    <span className="font-semibold text-[var(--sage)]">
                      {service.durationMinutes} minutos
                    </span>
                    <span className="font-semibold">
                      {formatPrice(service.priceCents, service.showPrice)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {preview ? (
            <section className="mt-8 rounded-[2rem] bg-[var(--foreground)] p-7 text-[var(--surface)] sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
                Agendamento online
              </p>
              <h2 className="mt-3 text-4xl font-semibold">
                Os horários aparecerão após a publicação
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#d8d0c4]">
                A página publicada calculará as vagas reais usando seus serviços, expediente, regras
                e atendimentos existentes.
              </p>
            </section>
          ) : data.onlineBookingPaused ? (
            <section className="mt-8 rounded-[2rem] bg-[var(--foreground)] p-7 text-[var(--surface)] sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
                Agendamento online
              </p>
              <h2 className="mt-3 text-4xl font-semibold">Novos agendamentos estão pausados</h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#d8d0c4]">
                Os atendimentos já confirmados continuam válidos.
              </p>
            </section>
          ) : availabilityServices.length > 0 ? (
            <PublicAvailabilityPicker slug={data.slug} services={availabilityServices} />
          ) : null}

          <footer className="py-10 text-center text-sm text-[var(--foreground-muted)]">
            Agendamento online com <strong>Cruz Agenda</strong>
          </footer>
        </div>
      </main>
    </div>
  );
}
