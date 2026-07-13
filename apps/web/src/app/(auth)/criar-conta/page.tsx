import Link from "next/link";

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
      <form className="mt-8 grid gap-5">
        {[
          ["Seu nome", "text", "Como podemos chamar você?", "name"],
          ["E-mail", "email", "seuemail@exemplo.com", "email"],
          ["WhatsApp", "tel", "(00) 00000-0000", "tel"],
          ["Crie uma senha", "password", "Pelo menos 8 caracteres", "new-password"],
          ["Repita sua senha", "password", "Digite novamente", "new-password"],
        ].map(([label, type, placeholder, autoComplete]) => (
          <label key={label} className="block">
            <span className="mb-2 block text-sm font-semibold">{label}</span>
            <input
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 outline-none focus:border-[var(--gold)] focus:ring-3 focus:ring-[var(--gold-soft)]"
            />
          </label>
        ))}
        <label className="flex gap-3 text-sm leading-6 text-[var(--foreground-muted)]">
          <input type="checkbox" className="mt-1 size-4 accent-[var(--sage)]" />
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
        <button
          type="submit"
          className="min-h-12 w-full rounded-xl bg-[var(--brand)] px-5 font-semibold text-[var(--surface)] hover:bg-[var(--brand-strong)]"
        >
          Criar minha agenda
        </button>
      </form>
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
