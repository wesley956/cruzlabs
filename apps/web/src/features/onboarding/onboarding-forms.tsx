"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveBusinessAction,
  saveProfessionAction,
  type OnboardingActionState,
} from "./actions";

const INITIAL_STATE: OnboardingActionState = { status: "idle" };
const INPUT_CLASS =
  "min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 outline-none transition focus:border-[var(--gold)] focus:ring-3 focus:ring-[var(--gold-soft)] aria-[invalid=true]:border-[var(--danger)]";

export type ProfessionOption = {
  key: string;
  name: string;
  description: string | null;
};

export type BusinessDefaults = {
  businessName: string;
  publicProfessionName: string;
  whatsapp: string;
  description: string;
  instagramUsername: string;
  city: string;
  state: string;
  serviceLocationType: string;
  addressVisibility: string;
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
};

type OnboardingFieldName = keyof NonNullable<OnboardingActionState["fieldErrors"]>;

const BRAZIL_STATES = [
  ["AC", "Acre"],
  ["AL", "Alagoas"],
  ["AP", "Amapá"],
  ["AM", "Amazonas"],
  ["BA", "Bahia"],
  ["CE", "Ceará"],
  ["DF", "Distrito Federal"],
  ["ES", "Espírito Santo"],
  ["GO", "Goiás"],
  ["MA", "Maranhão"],
  ["MT", "Mato Grosso"],
  ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"],
  ["PA", "Pará"],
  ["PB", "Paraíba"],
  ["PR", "Paraná"],
  ["PE", "Pernambuco"],
  ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"],
  ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"],
  ["RR", "Roraima"],
  ["SC", "Santa Catarina"],
  ["SP", "São Paulo"],
  ["SE", "Sergipe"],
  ["TO", "Tocantins"],
] as const;

function FieldError({ state, field }: { state: OnboardingActionState; field: OnboardingFieldName }) {
  const error = state.fieldErrors?.[field];

  if (!error) {
    return null;
  }

  return (
    <p id={`${field}-error`} className="mt-2 text-sm text-[var(--danger)]">
      {error}
    </p>
  );
}

function FormFeedback({ state }: { state: OnboardingActionState }) {
  if (!state.message || state.status === "idle") {
    return null;
  }

  return (
    <div
      role="alert"
      className="rounded-xl border border-[var(--danger)] bg-[#f7ece9] p-4 text-sm leading-6 text-[var(--danger)]"
    >
      {state.message}
    </div>
  );
}

function ContinueButton({ pendingLabel = "Salvando..." }: { pendingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 w-full rounded-xl bg-[var(--brand)] px-6 font-semibold text-[var(--surface)] transition hover:bg-[var(--brand-strong)] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
    >
      {pending ? pendingLabel : "Continuar"}
    </button>
  );
}

export function ProfessionForm({
  professions,
  initialProfessionKey,
  initialCustomProfession,
}: {
  professions: ProfessionOption[];
  initialProfessionKey?: string;
  initialCustomProfession?: string;
}) {
  const [state, formAction] = useActionState(saveProfessionAction, INITIAL_STATE);
  const [selectedProfession, setSelectedProfession] = useState(initialProfessionKey ?? "");

  return (
    <form action={formAction} className="mt-8" noValidate>
      <FormFeedback state={state} />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {professions.map((profession) => (
          <label
            key={profession.key}
            className={`flex min-h-24 cursor-pointer items-start gap-3 rounded-2xl border bg-[var(--surface)] p-5 transition ${
              selectedProfession === profession.key
                ? "border-[var(--gold)] bg-[var(--gold-soft)]"
                : "border-[var(--border)] hover:border-[var(--gold)] hover:bg-[var(--surface-soft)]"
            }`}
          >
            <input
              type="radio"
              name="professionKey"
              value={profession.key}
              checked={selectedProfession === profession.key}
              onChange={() => setSelectedProfession(profession.key)}
              className="mt-1 size-4 accent-[var(--sage)]"
            />
            <span>
              <span className="block font-semibold">{profession.name}</span>
              {profession.description && (
                <span className="mt-1 block text-sm leading-6 text-[var(--foreground-muted)]">
                  {profession.description}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
      <FieldError state={state} field="professionKey" />

      {selectedProfession === "other" && (
        <label className="mt-5 block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <span className="mb-2 block text-sm font-semibold">Qual é a sua atividade?</span>
          <input
            name="customProfession"
            type="text"
            required
            minLength={2}
            maxLength={80}
            defaultValue={initialCustomProfession}
            placeholder="Ex.: Massoterapeuta"
            aria-invalid={Boolean(state.fieldErrors?.customProfession)}
            aria-describedby={state.fieldErrors?.customProfession ? "customProfession-error" : undefined}
            className={INPUT_CLASS}
          />
          <FieldError state={state} field="customProfession" />
        </label>
      )}

      <div className="mt-8">
        <ContinueButton pendingLabel="Salvando profissão..." />
      </div>
    </form>
  );
}

export function BusinessForm({ defaults }: { defaults: BusinessDefaults }) {
  const [state, formAction] = useActionState(saveBusinessAction, INITIAL_STATE);
  const [addressVisibility, setAddressVisibility] = useState(defaults.addressVisibility || "city");

  return (
    <form action={formAction} className="mt-8 space-y-8" noValidate>
      <FormFeedback state={state} />

      <section className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
        <div>
          <h2 className="text-2xl font-semibold">Identidade profissional</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
            Essas informações ajudarão suas clientes a reconhecer seu trabalho.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Nome do negócio ou nome profissional</span>
          <input
            name="businessName"
            type="text"
            required
            minLength={2}
            maxLength={80}
            defaultValue={defaults.businessName}
            placeholder="Ex.: Studio Maria Nails"
            aria-invalid={Boolean(state.fieldErrors?.businessName)}
            aria-describedby={state.fieldErrors?.businessName ? "businessName-error" : undefined}
            className={INPUT_CLASS}
          />
          <FieldError state={state} field="businessName" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Como sua profissão será exibida</span>
          <input
            name="publicProfessionName"
            type="text"
            required
            minLength={2}
            maxLength={80}
            defaultValue={defaults.publicProfessionName}
            placeholder="Ex.: Nail designer"
            aria-invalid={Boolean(state.fieldErrors?.publicProfessionName)}
            aria-describedby={
              state.fieldErrors?.publicProfessionName ? "publicProfessionName-error" : undefined
            }
            className={INPUT_CLASS}
          />
          <FieldError state={state} field="publicProfessionName" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Descrição</span>
          <textarea
            name="description"
            maxLength={300}
            rows={4}
            defaultValue={defaults.description}
            placeholder="Conte de forma simples como é seu atendimento."
            aria-invalid={Boolean(state.fieldErrors?.description)}
            aria-describedby={state.fieldErrors?.description ? "description-error" : undefined}
            className={`${INPUT_CLASS} py-3`}
          />
          <p className="mt-2 text-xs text-[var(--foreground-muted)]">Máximo de 300 caracteres.</p>
          <FieldError state={state} field="description" />
        </label>
      </section>

      <section className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
        <div>
          <h2 className="text-2xl font-semibold">Contato</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
            O WhatsApp será usado para contato relacionado aos atendimentos.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">WhatsApp profissional</span>
          <input
            name="whatsapp"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            defaultValue={defaults.whatsapp}
            placeholder="(00) 00000-0000"
            aria-invalid={Boolean(state.fieldErrors?.whatsapp)}
            aria-describedby={state.fieldErrors?.whatsapp ? "whatsapp-error" : undefined}
            className={INPUT_CLASS}
          />
          <FieldError state={state} field="whatsapp" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Instagram, opcional</span>
          <input
            name="instagramUsername"
            type="text"
            maxLength={100}
            autoComplete="off"
            defaultValue={defaults.instagramUsername}
            placeholder="@seu_perfil"
            aria-invalid={Boolean(state.fieldErrors?.instagramUsername)}
            aria-describedby={
              state.fieldErrors?.instagramUsername ? "instagramUsername-error" : undefined
            }
            className={INPUT_CLASS}
          />
          <FieldError state={state} field="instagramUsername" />
        </label>
      </section>

      <section className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
        <div>
          <h2 className="text-2xl font-semibold">Local de atendimento</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
            Você decide quanto da localização será mostrado publicamente.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Como você atende?</span>
          <select
            name="serviceLocationType"
            required
            defaultValue={defaults.serviceLocationType || "own_space"}
            aria-invalid={Boolean(state.fieldErrors?.serviceLocationType)}
            aria-describedby={
              state.fieldErrors?.serviceLocationType ? "serviceLocationType-error" : undefined
            }
            className={INPUT_CLASS}
          >
            <option value="own_space">Em espaço próprio</option>
            <option value="home_service">Na casa da cliente</option>
            <option value="mixed">Em espaço próprio e a domicílio</option>
            <option value="arranged_location">Local combinado diretamente</option>
          </select>
          <FieldError state={state} field="serviceLocationType" />
        </label>

        <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Cidade</span>
            <input
              name="city"
              type="text"
              required
              maxLength={80}
              autoComplete="address-level2"
              defaultValue={defaults.city}
              placeholder="Sua cidade"
              aria-invalid={Boolean(state.fieldErrors?.city)}
              aria-describedby={state.fieldErrors?.city ? "city-error" : undefined}
              className={INPUT_CLASS}
            />
            <FieldError state={state} field="city" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Estado</span>
            <select
              name="state"
              required
              autoComplete="address-level1"
              defaultValue={defaults.state}
              aria-invalid={Boolean(state.fieldErrors?.state)}
              aria-describedby={state.fieldErrors?.state ? "state-error" : undefined}
              className={INPUT_CLASS}
            >
              <option value="">UF</option>
              {BRAZIL_STATES.map(([code, name]) => (
                <option key={code} value={code}>
                  {code} — {name}
                </option>
              ))}
            </select>
            <FieldError state={state} field="state" />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">O que suas clientes poderão ver?</span>
          <select
            name="addressVisibility"
            value={addressVisibility}
            onChange={(event) => setAddressVisibility(event.target.value)}
            className={INPUT_CLASS}
          >
            <option value="city">Apenas cidade e estado</option>
            <option value="neighborhood_city">Bairro, cidade e estado</option>
            <option value="full">Endereço completo</option>
            <option value="hidden">Local combinado depois</option>
          </select>
          <FieldError state={state} field="addressVisibility" />
        </label>

        {(addressVisibility === "full" || addressVisibility === "neighborhood_city") && (
          <div className="grid gap-5 rounded-2xl bg-[var(--surface-soft)] p-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">CEP, opcional</span>
              <input
                name="postalCode"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                defaultValue={defaults.postalCode}
                placeholder="00000-000"
                aria-invalid={Boolean(state.fieldErrors?.postalCode)}
                aria-describedby={state.fieldErrors?.postalCode ? "postalCode-error" : undefined}
                className={INPUT_CLASS}
              />
              <FieldError state={state} field="postalCode" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Bairro</span>
              <input
                name="neighborhood"
                type="text"
                maxLength={80}
                autoComplete="address-level3"
                defaultValue={defaults.neighborhood}
                placeholder="Seu bairro"
                aria-invalid={Boolean(state.fieldErrors?.neighborhood)}
                aria-describedby={
                  state.fieldErrors?.neighborhood ? "neighborhood-error" : undefined
                }
                className={INPUT_CLASS}
              />
              <FieldError state={state} field="neighborhood" />
            </label>

            {addressVisibility === "full" && (
              <>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold">Rua</span>
                  <input
                    name="street"
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="street-address"
                    defaultValue={defaults.street}
                    placeholder="Nome da rua"
                    aria-invalid={Boolean(state.fieldErrors?.street)}
                    aria-describedby={state.fieldErrors?.street ? "street-error" : undefined}
                    className={INPUT_CLASS}
                  />
                  <FieldError state={state} field="street" />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Número</span>
                  <input
                    name="number"
                    type="text"
                    maxLength={20}
                    defaultValue={defaults.number}
                    placeholder="120"
                    aria-invalid={Boolean(state.fieldErrors?.number)}
                    aria-describedby={state.fieldErrors?.number ? "number-error" : undefined}
                    className={INPUT_CLASS}
                  />
                  <FieldError state={state} field="number" />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Complemento</span>
                  <input
                    name="complement"
                    type="text"
                    maxLength={80}
                    defaultValue={defaults.complement}
                    placeholder="Sala, bloco ou referência"
                    aria-invalid={Boolean(state.fieldErrors?.complement)}
                    aria-describedby={
                      state.fieldErrors?.complement ? "complement-error" : undefined
                    }
                    className={INPUT_CLASS}
                  />
                  <FieldError state={state} field="complement" />
                </label>
              </>
            )}
          </div>
        )}

        {addressVisibility !== "full" && (
          <input type="hidden" name="street" value="" />
        )}
        {addressVisibility !== "full" && <input type="hidden" name="number" value="" />}
        {addressVisibility !== "full" && <input type="hidden" name="complement" value="" />}
        {addressVisibility !== "full" && addressVisibility !== "neighborhood_city" && (
          <>
            <input type="hidden" name="postalCode" value="" />
            <input type="hidden" name="neighborhood" value="" />
          </>
        )}
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href="/configuracao/profissao"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 font-semibold hover:bg-[var(--surface-soft)]"
        >
          Voltar
        </a>
        <ContinueButton pendingLabel="Salvando negócio..." />
      </div>
    </form>
  );
}
