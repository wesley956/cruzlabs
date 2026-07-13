import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@cruz-agenda/supabase/proxy";

const PROTECTED_PREFIXES = [
  "/boas-vindas",
  "/configuracao",
  "/redefinir-senha",
  "/painel",
  "/agenda",
  "/clientes",
  "/servicos",
  "/disponibilidade",
  "/minha-pagina",
  "/notificacoes",
  "/assinatura",
  "/configuracoes",
  "/ajuda",
];

const GUEST_ONLY_PATHS = ["/entrar", "/criar-conta", "/esqueci-minha-senha"];

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request, {
    protectedPrefixes: PROTECTED_PREFIXES,
    guestOnlyPaths: GUEST_ONLY_PATHS,
    authenticatedRedirectTo: "/boas-vindas",
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
