import Link from "next/link";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Entre na sua conta</h1>
      <p className="mt-3 leading-7 text-[var(--foreground-muted)]">Acesse sua agenda e acompanhe seus próximos atendimentos.</p>
      <form className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">E-mail</span>
          <input type="email" autoComplete="email" placeholder="seuemail@exemplo.com" className="min-h-12 w-full rounded-xl border border-[var(--border)] px-4 outline-none focus:border-[var(--brand)] focus:ring-3 focus:ring-pink-100" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Senha</span>
          <input type="password" autoComplete="current-password" placeholder="Digite sua senha" className="min-h-12 w-full rounded-xl border border-[var(--border)] px-4 outline-none focus:border-[var(--brand)] focus:ring-3 focus:ring-pink-100" />
        </label>
        <div className="text-right"><Link href="/esqueci-minha-senha" className="text-sm font-semibold text-[var(--brand)]">Esqueci minha senha</Link></div>
        <button type="submit" className="min-h-12 w-full rounded-xl bg-[var(--brand)] px-5 font-semibold text-white hover:bg-[var(--brand-strong)]">Entrar</button>
      </form>
      <p className="mt-7 text-center text-sm text-[var(--foreground-muted)]">Ainda não tem uma conta? <Link href="/criar-conta" className="font-semibold text-[var(--brand)]">Criar agenda grátis</Link></p>
    </div>
  );
}
