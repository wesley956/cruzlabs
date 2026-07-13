import Link from "next/link";
import { SignUpForm } from "@/features/auth/auth-forms";

export const metadata = { title: "Criar conta" };

export default function SignUpPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
        Comece com calma
      </p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight">Crie sua agenda grátis</h1>
      <p className="mt-3 leading-7 text-[var(--foreground-muted)]">
        Configure seu espaço digital e deixe suas clientes escolherem os próprios horários.
      </p>

      <SignUpForm />

      <p className="mt-4 text-center text-xs leading-5 text-[var(--foreground-muted)]">
        Seus 15 dias grátis começam somente depois que sua agenda estiver configurada. Nenhum cartão
        será solicitado agora.
      </p>
      <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
        Já tem uma conta?{" "}
        <Link href="/entrar" className="font-semibold text-[var(--sage)]">
          Entrar
        </Link>
      </p>
    </div>
  );
}
