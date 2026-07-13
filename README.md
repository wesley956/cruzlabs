# Cruz Agenda

SaaS self-service da **Cruz Labs** para profissionais autônomos da beleza organizarem seus horários e permitirem que clientes agendem sozinhas por um link público.

## Estado atual

A fundação técnica do projeto está iniciada:

- Monorepo com `pnpm` e Turborepo;
- Aplicação pública/profissional em `apps/web`;
- Painel da Cruz Labs em `apps/admin`;
- Pacotes compartilhados para UI, domínio, validação, Supabase, pagamentos e e-mails;
- Supabase versionado com migrations, funções e testes;
- Primeira migration de perfis com RLS;
- CI inicial no GitHub Actions;
- Página de vendas inicial e esqueleto do painel administrativo.

## Stack

- Next.js 16;
- React 19;
- TypeScript 6;
- Tailwind CSS 4;
- Supabase Auth, PostgreSQL, Storage, RLS e Edge Functions;
- Mercado Pago para assinaturas recorrentes;
- pnpm + Turborepo.

## Aplicações

| Aplicação | Diretório | Porta local |
|---|---|---:|
| Cruz Agenda | `apps/web` | 3000 |
| Cruz Agenda Admin | `apps/admin` | 3001 |

## Pré-requisitos

- Node.js 22 ou superior;
- pnpm 11.12 ou superior;
- Docker para o Supabase local;
- Supabase CLI.

## Instalação

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

O ambiente atual onde esta base foi gerada não possuía acesso ao registro npm, portanto o primeiro `pnpm install` também criará o `pnpm-lock.yaml`.

## Supabase local

```bash
supabase start
supabase db reset
```

## Comandos

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm test
pnpm format:check
```

## Princípios

1. Mobile-first;
2. RLS desde a primeira tabela;
3. Nenhuma regra crítica depende apenas do frontend;
4. Dados separados por `business_id`;
5. Pagamentos desacoplados por uma camada `PaymentProvider`;
6. Primeiro objetivo de ativação: `first_booking_received`.

Veja também:

- [Arquitetura](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [Decisões técnicas](docs/decisions/0001-foundation.md)
