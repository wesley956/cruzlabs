import Link from "next/link";
import { ResetPasswordForm } from "@/features/auth/auth-forms";

export const metadata = {
  title: "Criar nova senha",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
        Proteja seu acesso
      </p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight">Crie uma nova senha</h1>
      <p className="mt-3 leading-7 text-[var(--foreground-muted)]">
        Escolha uma senha nova para sua conta. Depois da alteração, você entrará novamente com os
        dados atualizados.
      </p>

      <ResetPasswordForm />

      <p className="mt-7 text-center">
        <Link href="/entrar" className="text-sm font-semibold text-[var(--sage)]">
          Voltar para entrar
        </Link>
      </p>
    </div>
  );
}
