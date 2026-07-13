"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  forgotPasswordAction,
  loginAction,
  resendVerificationAction,
  resetPasswordAction,
  signUpAction,
  type AuthActionState,
} from "./actions";

const INITIAL_STATE: AuthActionState = { status: "idle" };
const INPUT_CLASS =
  "min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 outline-none transition focus:border-[var(--gold)] focus:ring-3 focus:ring-[var(--gold-soft)] aria-[invalid=true]:border-[var(--danger)]";

type FieldName = "fullName" | "email" | "whatsapp" | "password" | "passwordConfirmation" | "terms";

function FieldError({ state, field }: { state: AuthActionState; field: FieldName }) {
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

function AuthFeedback({ state }: { state: AuthActionState }) {
  if (!state.message || state.status === "idle") {
    return null;
  }

  const success = state.status === "success";

  return (
    <div
      role={success ? "status" : "alert"}
      className={`rounded-xl border p-4 text-sm leading-6 ${
        success
          ? "border-[var(--sage)] bg-[var(--sage-soft)] text-[var(--foreground)]"
          : "border-[var(--danger)] bg-[#f7ece9] text-[var(--danger)]"
      }`}
    >
      {state.message}
    </div>
  );
}

function SubmitButton({ idleLabel, pendingLabel }: { idleLabel: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 w-full rounded-xl bg-[var(--brand)] px-5 font-semibold text-[var(--surface)] transition hover:bg-[var(--brand-strong)] disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, INITIAL_STATE);

  return (
    <form action={formAction} className="mt-8 grid gap-5" noValidate>
      <AuthFeedback state={state} />

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Seu nome</span>
        <input
          name="fullName"
          type="text"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          placeholder="Como podemos chamar você?"
          aria-invalid={Boolean(state.fieldErrors?.fullName)}
          aria-describedby={state.fieldErrors?.fullName ? "fullName-error" : undefined}
          className={INPUT_CLASS}
        />
        <FieldError state={state} field="fullName" />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="seuemail@exemplo.com"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          className={INPUT_CLASS}
        />
        <FieldError state={state} field="email" />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">WhatsApp</span>
        <input
          name="whatsapp"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="(00) 00000-0000"
          aria-invalid={Boolean(state.fieldErrors?.whatsapp)}
          aria-describedby={state.fieldErrors?.whatsapp ? "whatsapp-error" : undefined}
          className={INPUT_CLASS}
        />
        <FieldError state={state} field="whatsapp" />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Crie uma senha</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          placeholder="Pelo menos 8 caracteres"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          className={INPUT_CLASS}
        />
        <FieldError state={state} field="password" />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Repita sua senha</span>
        <input
          name="passwordConfirmation"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          placeholder="Digite novamente"
          aria-invalid={Boolean(state.fieldErrors?.passwordConfirmation)}
          aria-describedby={
            state.fieldErrors?.passwordConfirmation ? "passwordConfirmation-error" : undefined
          }
          className={INPUT_CLASS}
        />
        <FieldError state={state} field="passwordConfirmation" />
      </label>

      <div>
        <label className="flex gap-3 text-sm leading-6 text-[var(--foreground-muted)]">
          <input name="terms" type="checkbox" className="mt-1 size-4 accent-[var(--sage)]" />
          <span>
            Li e aceito os{" "}
            <Link href="/termos" className="font-semibold text-[var(--sage)]">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" className="font-semibold text-[var(--sage)]">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        <FieldError state={state} field="terms" />
      </div>

      <SubmitButton idleLabel="Criar minha agenda" pendingLabel="Criando sua conta..." />
    </form>
  );
}

export function LoginForm({ nextPath, notice }: { nextPath?: string; notice?: string }) {
  const [state, formAction] = useActionState(loginAction, INITIAL_STATE);

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      {notice && (
        <div className="rounded-xl border border-[var(--sage)] bg-[var(--sage-soft)] p-4 text-sm leading-6">
          {notice}
        </div>
      )}
      <AuthFeedback state={state} />
      <input type="hidden" name="next" value={nextPath ?? ""} />

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="seuemail@exemplo.com"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          className={INPUT_CLASS}
        />
        <FieldError state={state} field="email" />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Senha</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Digite sua senha"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          className={INPUT_CLASS}
        />
        <FieldError state={state} field="password" />
      </label>

      <div className="text-right">
        <Link href="/esqueci-minha-senha" className="text-sm font-semibold text-[var(--sage)]">
          Esqueci minha senha
        </Link>
      </div>

      <SubmitButton idleLabel="Entrar" pendingLabel="Entrando..." />
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, INITIAL_STATE);

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      <AuthFeedback state={state} />
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="seuemail@exemplo.com"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          className={INPUT_CLASS}
        />
        <FieldError state={state} field="email" />
      </label>
      <SubmitButton idleLabel="Enviar link de recuperação" pendingLabel="Enviando..." />
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, INITIAL_STATE);

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      <AuthFeedback state={state} />
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Nova senha</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          placeholder="Pelo menos 8 caracteres"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          className={INPUT_CLASS}
        />
        <FieldError state={state} field="password" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Repita a nova senha</span>
        <input
          name="passwordConfirmation"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          placeholder="Digite novamente"
          aria-invalid={Boolean(state.fieldErrors?.passwordConfirmation)}
          aria-describedby={
            state.fieldErrors?.passwordConfirmation ? "passwordConfirmation-error" : undefined
          }
          className={INPUT_CLASS}
        />
        <FieldError state={state} field="passwordConfirmation" />
      </label>
      <SubmitButton idleLabel="Salvar nova senha" pendingLabel="Atualizando..." />
    </form>
  );
}

export function ResendVerificationForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, formAction] = useActionState(resendVerificationAction, INITIAL_STATE);

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      <AuthFeedback state={state} />
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">E-mail do cadastro</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          autoComplete="email"
          inputMode="email"
          placeholder="seuemail@exemplo.com"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          className={INPUT_CLASS}
        />
        <FieldError state={state} field="email" />
      </label>
      <SubmitButton idleLabel="Reenviar e-mail" pendingLabel="Reenviando..." />
    </form>
  );
}
