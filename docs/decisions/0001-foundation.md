# ADR 0001 — Fundação técnica

**Status:** aceita
**Data:** 13 de julho de 2026

## Contexto

O Cruz Agenda precisa atender profissionais autônomos com uma experiência simples no celular, mas sua base deve suportar segurança, pagamentos recorrentes e crescimento.

## Decisão

- Monorepo com pnpm e Turborepo;
- duas aplicações Next.js: `web` e `admin`;
- Supabase como backend central;
- PostgreSQL como fonte de verdade;
- RLS desde a primeira migration;
- Mercado Pago atrás da interface `PaymentProvider`;
- Tailwind CSS e componentes próprios compatíveis com Shadcn/UI;
- ambientes separados para desenvolvimento, homologação e produção.

## Consequências

### Positivas

- Código compartilhado sem misturar permissões administrativas;
- evolução segura do banco por migrations;
- possibilidade de trocar o provedor de pagamento;
- proteção por negócio desde o início.

### Negativas

- Estrutura inicial maior que um projeto Next.js único;
- exige disciplina com migrations, RLS e pacotes compartilhados.
