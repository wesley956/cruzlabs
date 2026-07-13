function requirePublicEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return value;
}

export function getSupabasePublicEnv() {
  return {
    url: requirePublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: requirePublicEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}
