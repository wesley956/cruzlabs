"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveServicesAction, type OnboardingActionState } from "./actions";

const INITIAL_STATE: OnboardingActionState = { status: "idle" };
const INPUT_CLASS =
  "min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 outline-none transition focus:border-[var(--gold)] focus:ring-3 focus:ring-[var(--gold-soft)]";

export type ServiceTemplateOption = {
  id: string;
  name: string;
  description: string | null;
  suggestedDurationMinutes: number;
  suggestedPriceCents: number | null;
};

export type ExistingService = {
  id: string;
  templateId: string | null;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number | null;
  showPrice: boolean;
  onlineBookingEnabled: boolean;
};

type EditableService = {
  clientId: string;
  templateId: string | null;
  name: string;
  description: string;
  durationMinutes: string;
  price: string;
  showPrice: boolean;
  onlineBookingEnabled: boolean;
};

function centsToBrazilianPrice(value: number | null): string {
  if (value === null) {
    return "";
  }

  return (value / 100).toFixed(2).replace(".", ",");
}

function priceToCents(value: string): number | string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return "invalid";
  }

  return Math.round(parsed * 100);
}

function newClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function fromTemplate(template: ServiceTemplateOption): EditableService {
  return {
    clientId: newClientId(),
    templateId: template.id,
    name: template.name,
    description: template.description ?? "",
    durationMinutes: String(template.suggestedDurationMinutes),
    price: centsToBrazilianPrice(template.suggestedPriceCents),
    showPrice: true,
    onlineBookingEnabled: true,
  };
}

function fromExisting(service: ExistingService): EditableService {
  return {
    clientId: service.id,
    templateId: service.templateId,
    name: service.name,
    description: service.description ?? "",
    durationMinutes: String(service.durationMinutes),
    price: centsToBrazilianPrice(service.priceCents),
    showPrice: service.showPrice,
    onlineBookingEnabled: service.onlineBookingEnabled,
  };
}

function createEmptyService(): EditableService {
  return {
    clientId: newClientId(),
    templateId: null,
    name: "",
    description: "",
    durationMinutes: "60",
    price: "",
    showPrice: true,
    onlineBookingEnabled: true,
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 rounded-xl bg-[var(--brand)] px-6 font-semibold text-[var(--surface)] transition hover:bg-[var(--brand-strong)] disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "Salvando serviços..." : "Salvar e continuar"}
    </button>
  );
}

export function ServicesForm({
  templates,
  existingServices,
}: {
  templates: ServiceTemplateOption[];
  existingServices: ExistingService[];
}) {
  const [state, formAction] = useActionState(saveServicesAction, INITIAL_STATE);
  const [services, setServices] = useState<EditableService[]>(
    existingServices.map(fromExisting),
  );

  const selectedTemplateIds = useMemo(
    () => new Set(services.flatMap((service) => (service.templateId ? [service.templateId] : []))),
    [services],
  );

  const serializedServices = JSON.stringify(
    services.map((service) => ({
      templateId: service.templateId,
      name: service.name,
      description: service.description,
      durationMinutes: Number(service.durationMinutes),
      priceCents: priceToCents(service.price),
      showPrice: service.showPrice,
      onlineBookingEnabled: service.onlineBookingEnabled,
    })),
  );

  function updateService(clientId: string, changes: Partial<EditableService>) {
    setServices((current) =>
      current.map((service) =>
        service.clientId === clientId ? { ...service, ...changes } : service,
      ),
    );
  }

  function removeService(clientId: string) {
    setServices((current) => current.filter((service) => service.clientId !== clientId));
  }

  return (
    <form action={formAction} className="mt-8 space-y-8" noValidate>
      <input type="hidden" name="services" value={serializedServices} />

      {state.message && (
        <div
          role="alert"
          className="rounded-xl border border-[var(--danger)] bg-[#f7ece9] p-4 text-sm leading-6 text-[var(--danger)]"
        >
          {state.message}
        </div>
      )}

      {templates.length > 0 && (
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
              Sugestões para sua profissão
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Adicione e personalize</h2>
            <p className="mt-2 leading-7 text-[var(--foreground-muted)]">
              Os valores são apenas sugestões. Você poderá alterar tudo antes de salvar.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {templates.map((template) => {
              const selected = selectedTemplateIds.has(template.id);

              return (
                <article
                  key={template.id}
                  className={`rounded-2xl border p-4 ${
                    selected
                      ? "border-[var(--sage)] bg-[var(--sage-soft)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <h3 className="text-xl font-semibold">{template.name}</h3>
                  {template.description && (
                    <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                      {template.description}
                    </p>
                  )}
                  <p className="mt-3 text-sm font-semibold text-[var(--sage)]">
                    {template.suggestedDurationMinutes} min
                    {template.suggestedPriceCents !== null
                      ? ` · R$ ${centsToBrazilianPrice(template.suggestedPriceCents)}`
                      : " · valor a definir"}
                  </p>
                  <button
                    type="button"
                    disabled={selected}
                    onClick={() => setServices((current) => [...current, fromTemplate(template)])}
                    className="mt-4 min-h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold transition hover:bg-[var(--surface-soft)] disabled:cursor-default disabled:border-[var(--sage)] disabled:bg-transparent disabled:text-[var(--sage)]"
                  >
                    {selected ? "Adicionado" : "Adicionar serviço"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
              Seus serviços
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              {services.length === 0 ? "Adicione o primeiro serviço" : `${services.length} serviço${services.length === 1 ? "" : "s"}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setServices((current) => [...current, createEmptyService()])}
            className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold hover:bg-[var(--surface-soft)]"
          >
            + Criar serviço personalizado
          </button>
        </div>

        {services.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
            <h3 className="text-2xl font-semibold">Nenhum serviço adicionado</h3>
            <p className="mx-auto mt-2 max-w-lg leading-7 text-[var(--foreground-muted)]">
              Escolha uma sugestão acima ou crie um serviço personalizado. É necessário pelo menos
              um para continuar.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {services.map((service, index) => (
              <article
                key={service.clientId}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold)]">
                      Serviço {index + 1}
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold">
                      {service.name.trim() || "Novo serviço"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeService(service.clientId)}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--danger)] hover:bg-[#f7ece9]"
                    aria-label={`Remover ${service.name || `serviço ${index + 1}`}`}
                  >
                    Remover
                  </button>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold">Nome</span>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={service.name}
                      onChange={(event) =>
                        updateService(service.clientId, { name: event.target.value })
                      }
                      placeholder="Ex.: Manicure"
                      className={INPUT_CLASS}
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold">Descrição, opcional</span>
                    <textarea
                      rows={3}
                      maxLength={300}
                      value={service.description}
                      onChange={(event) =>
                        updateService(service.clientId, { description: event.target.value })
                      }
                      placeholder="Explique brevemente o que está incluído."
                      className={`${INPUT_CLASS} py-3`}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">Duração em minutos</span>
                    <input
                      type="number"
                      min={5}
                      max={720}
                      step={5}
                      required
                      value={service.durationMinutes}
                      onChange={(event) =>
                        updateService(service.clientId, { durationMinutes: event.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">Preço, opcional</span>
                    <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] focus-within:border-[var(--gold)] focus-within:ring-3 focus-within:ring-[var(--gold-soft)]">
                      <span className="pl-3 text-sm font-semibold text-[var(--foreground-muted)]">
                        R$
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={service.price}
                        onChange={(event) =>
                          updateService(service.clientId, { price: event.target.value })
                        }
                        placeholder="0,00"
                        className="min-h-11 w-full bg-transparent px-3 outline-none"
                      />
                    </div>
                  </label>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[var(--surface-soft)] p-4">
                    <input
                      type="checkbox"
                      checked={service.onlineBookingEnabled}
                      onChange={(event) =>
                        updateService(service.clientId, {
                          onlineBookingEnabled: event.target.checked,
                        })
                      }
                      className="mt-1 size-4 accent-[var(--sage)]"
                    />
                    <span>
                      <span className="block text-sm font-semibold">Permitir agendamento online</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--foreground-muted)]">
                        Desative para usar este serviço apenas em agendamentos manuais.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[var(--surface-soft)] p-4">
                    <input
                      type="checkbox"
                      checked={service.showPrice}
                      disabled={!service.price.trim()}
                      onChange={(event) =>
                        updateService(service.clientId, { showPrice: event.target.checked })
                      }
                      className="mt-1 size-4 accent-[var(--sage)] disabled:opacity-40"
                    />
                    <span>
                      <span className="block text-sm font-semibold">Mostrar preço na página</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--foreground-muted)]">
                        Sem preço informado, a página exibirá “Consulte o valor”.
                      </span>
                    </span>
                  </label>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/configuracao/negocio"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 font-semibold hover:bg-[var(--surface-soft)]"
        >
          Voltar
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
