# Arquitetura do Cruz Agenda

## Visão geral

O sistema é dividido em duas aplicações Next.js e um backend Supabase compartilhado.

```text
Cliente / Profissional / Cruz Labs
             ↓
       Next.js Web + Admin
             ↓
Supabase Auth + PostgreSQL + Storage
             ↓
Edge Functions + Mercado Pago + E-mail
```

## Limite dos dados

O `business_id` é a fronteira de segurança dos dados operacionais. No MVP, cada negócio possui uma proprietária em `businesses.owner_id`.

## Áreas

- Marketing e página de vendas;
- Autenticação e onboarding;
- Painel da profissional;
- Página pública e agendamento da cliente;
- Assinatura e Mercado Pago;
- Painel administrativo da Cruz Labs.

## Segurança

- RLS em todas as tabelas expostas;
- `service_role` somente no backend;
- funções transacionais para agendamentos;
- validação de Webhooks;
- auditoria das operações administrativas;
- ambientes separados para desenvolvimento, homologação e produção.
