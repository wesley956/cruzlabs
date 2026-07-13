import Link from "next/link";
import { ResendVerificationForm } from "@/features/auth/auth-forms";

export const metadata = {
  title: "Confirme seu e-mail",
  robots: { index: false, follow: false },
};

type VerifyEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { email } = await searchParams;

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
        Falta pouco
      </p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight">Confirme seu e-mail</h1>
      <p className="mt-3 leading-7 text-[var(--foreground-muted)]">
        Enviamos um link de confirmação para o endereço informado. Abra a mensagem para continuar a
        configuração da sua agenda.
      </p>

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--gold-soft)] p-4 text-sm leading-6">
        Verifique também as pastas de spam, lixo eletrônico e promoções. O link possui validade por
        segurança.
      </div>

      <ResendVerificationForm defaultEmail={email} />

      <p className="mt-7 text-center text-sm text-[var(--foreground-muted)]">
        Já confirmou?{" "}
        <Link href="/entrar" className="font-semibold text-[var(--sage)]">
          Entrar na conta
        </Link>
      </p>
    </div>
  );
}
