"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { publishBusinessAction } from "./publication-actions";
import type { OnboardingActionState } from "./actions";

const INITIAL_STATE: OnboardingActionState = { status: "idle" };

function PublishButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={!enabled || pending}
      className="min-h-12 rounded-xl bg-[var(--brand)] px-6 font-semibold text-[var(--surface)] transition hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Publicando sua agenda..." : "Publicar e iniciar 15 dias grátis"}
    </button>
  );
}

export function PublishConfirmation({ slug }: { slug: string }) {
  const [state, formAction] = useActionState(publishBusinessAction, INITIAL_STATE);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <form
      action={formAction}
      className="rounded-[2rem] border border-[var(--gold)] bg-[var(--gold-soft)] p-6 sm:p-8"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold-strong)]">
        Publicação final
      </p>
      <h2 className="mt-3 text-3xl font-semibold">Sua agenda está pronta para ser publicada</h2>
      <p className="mt-3 max-w-3xl leading-7 text-[var(--foreground-muted)]">
        Ao confirmar, a página <strong>/{slug}</strong> ficará pública e o período gratuito de 15
        dias começará imediatamente. Nenhum cartão será solicitado nesta etapa.
      </p>

      {state.message && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-[var(--danger)] bg-[#f7ece9] p-4 text-sm leading-6 text-[var(--danger)]"
        >
          {state.message}
        </div>
      )}

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-[var(--surface)] p-5">
        <input
          name="confirmPublication"
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-1 size-5 accent-[var(--sage)]"
        />
        <span>
          <strong className="block">Confirmo que revisei a página e desejo publicar agora.</strong>
          <span className="mt-1 block text-sm leading-6 text-[var(--foreground-muted)]">
            O teste não poderá ser reiniciado criando outro link para o mesmo negócio.
          </span>
        </span>
      </label>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/configuracao/link"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 font-semibold hover:bg-[var(--surface-soft)]"
        >
          Alterar link
        </Link>
        <PublishButton enabled={confirmed} />
      </div>
    </form>
  );
}
