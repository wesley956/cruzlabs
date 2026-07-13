import Link from "next/link";

export const metadata = { title: "Recuperar senha" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Recupere sua senha</h1>
      <p className="mt-3 leading-7 text-[var(--foreground-muted)]">Informe o e-mail usado no cadastro. Enviaremos um link seguro para você criar uma nova senha.</p>
      <form className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">E-mail</span>
          <input type="email" autoComplete="email" placeholder="seuemail@exemplo.com" className="min-h-12 w-full rounded-xl border border-[var(--border)] px-4 outline-none focus:border-[var(--brand)] focus:ring-3 focus:ring-pink-100" />
        </label>
        <button type="submit" className="min-h-12 w-full rounded-xl bg-[var(--brand)] px-5 font-semibold text-white hover:bg-[var(--brand-strong)]">Enviar link de recuperação</button>
      </form>
      <p className="mt-7 text-center"><Link href="/entrar" className="text-sm font-semibold text-[var(--brand)]">Voltar para entrar</Link></p>
    </div>
  );
}
