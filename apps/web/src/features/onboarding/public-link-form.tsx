"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { normalizePublicSlug } from "@cruz-agenda/validation";
import { savePublicLinkAction } from "./publication-actions";
import type { OnboardingActionState } from "./actions";

const INITIAL_STATE: OnboardingActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 rounded-xl bg-[var(--brand)] px-6 font-semibold text-[var(--surface)] transition hover:bg-[var(--brand-strong)] disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "Verificando endereço..." : "Salvar e visualizar prévia"}
    </button>
  );
}

export function PublicLinkForm({
  initialSlug,
  suggestedSlug,
  baseUrl,
}: {
  initialSlug: string;
  suggestedSlug: string;
  baseUrl: string;
}) {
  const [state, formAction] = useActionState(savePublicLinkAction, INITIAL_STATE);
  const [slug, setSlug] = useState(initialSlug || suggestedSlug);
  const normalizedSlug = useMemo(() => normalizePublicSlug(slug), [slug]);
  const visibleUrl = `${baseUrl.replace(/\/$/, "")}/${normalizedSlug || "seu-link"}`;

  return (
    <form action={formAction} className="mt-8 space-y-6" noValidate>
      {state.message && (
        <div
          role="alert"
          className="rounded-xl border border-[var(--danger)] bg-[#f7ece9] p-4 text-sm leading-6 text-[var(--danger)]"
        >
          {state.message}
        </div>
      )}

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl shadow-[#ded8ce] sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
          Seu endereço público
        </p>
        <h2 className="mt-3 text-3xl font-semibold">Crie um link simples de lembrar</h2>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--foreground-muted)]">
          Use o nome profissional ou do negócio. Letras com acento, espaços e símbolos serão
          convertidos automaticamente.
        </p>

        <label className="mt-7 block">
          <span className="mb-2 block text-sm font-semibold">Final do link</span>
          <div className="flex min-h-14 items-center rounded-2xl border border-[var(--border)] bg-[var(--background)] focus-within:border-[var(--gold)] focus-within:ring-3 focus-within:ring-[var(--gold-soft)]">
            <span className="hidden max-w-[55%] truncate border-r border-[var(--border)] px-4 text-sm text-[var(--foreground-muted)] sm:block">
              {baseUrl.replace(/\/$/, "")}/
            </span>
            <input
              name="slug"
              type="text"
              required
              minLength={3}
              maxLength={50}
              autoComplete="off"
              spellCheck={false}
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              onBlur={() => setSlug(normalizedSlug)}
              placeholder="studio-maria"
              className="min-h-14 min-w-0 flex-1 bg-transparent px-4 font-semibold outline-none"
            />
          </div>
          <p className="mt-3 break-all rounded-xl bg-[var(--surface-soft)] px-4 py-3 text-sm">
            <span className="text-[var(--foreground-muted)]">Seu link ficará assim: </span>
            <strong>{visibleUrl}</strong>
          </p>
          <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">
            Use entre 3 e 50 letras, números ou hífens. O sistema confirmará se o endereço está
            disponível ao salvar.
          </p>
        </label>
      </section>

      <aside className="rounded-3xl bg-[var(--sage-soft)] p-6 sm:p-8">
        <h2 className="text-2xl font-semibold">Seu teste ainda não começou</h2>
        <p className="mt-2 leading-7 text-[var(--foreground-muted)]">
          Salvar o link e abrir a prévia não inicia cobrança nem teste. Os 15 dias gratuitos começam
          somente quando você confirmar a publicação na próxima tela.
        </p>
      </aside>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/configuracao/regras"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 font-semibold hover:bg-[var(--surface-soft)]"
        >
          Voltar
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
