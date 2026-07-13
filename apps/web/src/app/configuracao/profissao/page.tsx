import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@cruz-agenda/supabase/server";
import { ProfessionForm } from "@/features/onboarding/onboarding-forms";

export const metadata = { title: "Escolha sua profissão" };
export const dynamic = "force-dynamic";

export default async function ProfessionPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/configuracao/profissao");
  }

  const [{ data: professions, error }, { data: business }] = await Promise.all([
    supabase
      .from("profession_templates")
      .select("key, name, description")
      .eq("is_active", true)
      .order("display_order"),
    supabase.from("businesses").select("profession_key, custom_profession").maybeSingle(),
  ]);

  if (error || !professions?.length) {
    return (
      <main className="min-h-screen px-5 py-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--danger)] bg-[var(--surface)] p-8">
          <h1 className="text-4xl font-semibold">Não conseguimos carregar esta etapa</h1>
          <p className="mt-4 leading-7 text-[var(--foreground-muted)]">
            Atualize a página. Caso o problema continue, tente entrar novamente.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
          Configuração da sua agenda
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--brand-soft)]">
          <div className="h-full w-1/6 rounded-full bg-[var(--sage)]" />
        </div>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">Etapa 1 de 6</p>
        <h1 className="mt-10 text-5xl font-semibold tracking-tight">
          Qual é a sua principal atividade?
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--foreground-muted)]">
          Usaremos essa escolha para sugerir serviços que você poderá editar livremente.
        </p>

        <ProfessionForm
          professions={professions}
          initialProfessionKey={business?.profession_key}
          initialCustomProfession={business?.custom_profession ?? undefined}
        />
      </div>
    </main>
  );
}
