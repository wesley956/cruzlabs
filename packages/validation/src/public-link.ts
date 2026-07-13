export type PublicLinkValidationSuccess = {
  success: true;
  data: { slug: string };
};

export type PublicLinkValidationFailure = {
  success: false;
  message: string;
};

export type PublicLinkValidationResult =
  | PublicLinkValidationSuccess
  | PublicLinkValidationFailure;

const PUBLIC_SLUG_PATTERN = /^(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*(?<!-)$/;

const LOCALLY_RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "agendamento",
  "agenda",
  "boas-vindas",
  "configuracao",
  "criar-conta",
  "cruz",
  "cruz-agenda",
  "cruz-labs",
  "cruzagenda",
  "cruzlabs",
  "entrar",
  "esqueci-minha-senha",
  "exemplo",
  "login",
  "logout",
  "minha-pagina",
  "painel",
  "privacidade",
  "redefinir-senha",
  "servicos",
  "suporte",
  "termos",
  "verificar-email",
  "www",
]);

export function normalizePublicSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50)
    .replace(/-$/g, "");
}

export function validatePublicLink(value: unknown): PublicLinkValidationResult {
  if (typeof value !== "string") {
    return { success: false, message: "Informe um link válido para sua agenda." };
  }

  const slug = normalizePublicSlug(value);

  if (slug.length < 3 || slug.length > 50 || !PUBLIC_SLUG_PATTERN.test(slug)) {
    return {
      success: false,
      message: "Use entre 3 e 50 letras, números ou hífens.",
    };
  }

  if (LOCALLY_RESERVED_SLUGS.has(slug)) {
    return {
      success: false,
      message: "Este endereço é reservado pelo Cruz Agenda. Escolha outro.",
    };
  }

  return { success: true, data: { slug } };
}
