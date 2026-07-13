import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/auth-forms";

export const metadata = { title: "Recuperar senha" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
        Acesso seguro
      </p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight">Recupere sua senha</h1>
      <p className="mt-3 leading-7 text-[var(--foreground-muted)]">
        Informe o e-mail usado no cadastro. Enviaremos um link seguro para você criar uma nova
        senha.
      </p>

      <ForgotPasswordForm />

      <p className="mt-7 text-center">
        <Link href="/entrar" className="text-sm font-semibold text-[var(--sage)]">
          Voltar para entrar
        </Link>
      </p>
    </div>
  );
}
