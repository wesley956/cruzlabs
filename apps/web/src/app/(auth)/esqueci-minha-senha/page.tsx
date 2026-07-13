import Link from "next/link";

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
      <form className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">E-mail</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="seuemail@exemplo.com"
            className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 outline-none focus:border-[var(--gold)] focus:ring-3 focus:ring-[var(--gold-soft)]"
          />
        </label>
        <button
          type="submit"
          className="min-h-12 w-full rounded-xl bg-[var(--brand)] px-5 font-semibold text-[var(--surface)] hover:bg-[var(--brand-strong)]"
        >
          Enviar link de recuperação
        </button>
      </form>
      <p className="mt-7 text-center">
        <Link href="/entrar" className="text-sm font-semibold text-[var(--sage)]">
          Voltar para entrar
        </Link>
      </p>
    </div>
  );
}
