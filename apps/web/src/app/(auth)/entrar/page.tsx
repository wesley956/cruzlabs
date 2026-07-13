import Link from "next/link";
import { LoginForm } from "@/features/auth/auth-forms";

export const metadata = { title: "Entrar" };

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    senha?: string;
    erro?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const notice =
    params.senha === "alterada"
      ? "Sua senha foi atualizada. Entre novamente para acessar sua agenda."
      : params.erro === "callback"
        ? "Não foi possível validar o link. Tente entrar ou solicite um novo e-mail."
        : undefined;

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
        Bem-vinda de volta
      </p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight">Entre na sua conta</h1>
      <p className="mt-3 leading-7 text-[var(--foreground-muted)]">
        Acesse sua agenda e acompanhe seus próximos atendimentos.
      </p>

      <LoginForm nextPath={params.next} notice={notice} />

      <p className="mt-7 text-center text-sm text-[var(--foreground-muted)]">
        Ainda não tem uma conta?{" "}
        <Link href="/criar-conta" className="font-semibold text-[var(--sage)]">
          Criar agenda grátis
        </Link>
      </p>
    </div>
  );
}
