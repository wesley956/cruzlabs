import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import { Brand } from "@cruz-agenda/ui";
import { signOutAction } from "@/features/auth/actions";

export const metadata = { title: "Painel" };

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/painel");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed")
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/boas-vindas");
  }

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <Brand />
          <form action={signOutAction}>
            <button
              type="submit"
              className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold hover:bg-[var(--surface-soft)]"
            >
              Sair
            </button>
          </form>
        </header>

        <section className="mt-16 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl shadow-[#ded8ce] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
            Área protegida
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">
            Olá, {profile.full_name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--foreground-muted)]">
            Sua sessão está funcionando corretamente. Os próximos módulos transformarão esta tela
            no painel completo da sua agenda.
          </p>
        </section>
      </div>
    </main>
  );
}
