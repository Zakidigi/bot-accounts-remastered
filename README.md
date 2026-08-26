# AgendaCheia 🧁

Uma agenda simples para quem vende bolos e doces por encomenda em Angola. A
confeiteira diz quanto trabalho aguenta por dia; o calendário fica **verde**
(livre), **amarelo** (quase cheio) ou **vermelho** (lotado) sozinho. Um link
público mostra os dias livres às clientes antes de elas mandarem mensagem no
WhatsApp — e o pedido cai directamente no WhatsApp da loja.

Sem e-mail, sem cartão, sem mensalidade para começar: entrada por PIN de 4
números e uso 100% gratuito nesta primeira versão.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions)
- [Prisma](https://www.prisma.io) + SQLite em desenvolvimento
- [Tailwind CSS v4](https://tailwindcss.com)
- Autenticação própria por PIN (bcrypt + cookie de sessão assinado com `jose`)
- Sem dependências pagas — pensado para correr nos planos gratuitos da Vercel

## Como correr localmente

```bash
npm install
npx prisma migrate dev   # cria prisma/dev.db e aplica o schema
npm run db:seed          # opcional: cria a loja de teste "doces-da-ana" (PIN 1234)
npm run dev
```

Abra `http://localhost:3000`. A loja de exemplo (se rodou o seed) entra em
`/entrar` com **doces-da-ana** / PIN **1234**, e a página pública fica em
`/doces-da-ana`.

## Estrutura

```
app/
  page.tsx                    Landing
  criar-loja/                 Cadastro (nome + WhatsApp + PIN)
  entrar/                     Login por PIN
  painel/                     Área da confeiteira (protegida)
    page.tsx                  Calendário do mês
    configuracoes/            Capacidade, dados da loja, link público
  [slug]/                     Página pública de disponibilidade (sem login)
lib/                          Regras de negócio (capacidade, WhatsApp, datas, sessão)
prisma/schema.prisma          Modelos Loja e Pedido
```

A regra central do produto vive em `lib/capacidade.ts`: cada pedido tem um
peso (Pequeno=1, Médio=2, Grande=3) e cada dia soma os pesos dos pedidos
confirmados/pendentes contra a capacidade da loja para decidir a cor do dia.

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

| Variável         | Para quê                                                            |
| ---------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`   | Ligação à base de dados (SQLite local; Postgres em produção)          |
| `SESSION_SECRET` | Chave para assinar o cookie de sessão. Gere com `openssl rand -hex 32` |

## Publicar de graça (Vercel + Postgres gratuito)

O projecto já vem preparado para isto: `prisma/schema.production.prisma` é
uma cópia do schema apontando para Postgres, e o script `vercel-build`
(em `package.json`) gera o client e aplica as migrações contra essa base
automaticamente a cada deploy — não precisa mexer em nada manualmente.

1. **Base de dados**: crie um projecto gratuito no [Neon](https://neon.tech)
   ou no [Supabase](https://supabase.com) e copie a connection string
   (Postgres).
2. **Deploy**: em [vercel.com/new](https://vercel.com/new), importe este
   repositório do GitHub.
3. Nas variáveis de ambiente do projecto, adicione:
   - `DATABASE_URL` → a connection string do passo 1
   - `SESSION_SECRET` → uma string aleatória longa (`openssl rand -hex 32`)
4. Clique em Deploy. O `vercel-build` cuida de criar as tabelas na primeira
   vez e de aplicar novas migrações nas próximas.

Nada nisto exige cartão de crédito: Neon/Supabase e Vercel têm planos
gratuitos permanentes (com limites generosos), não apenas trials.

## O que fica para depois (v2)

Pagamento/sinal online, várias utilizadoras por loja, lembretes automáticos
por WhatsApp Business API, relatório mensal de ocupação, integração com uma
calculadora de precificação.
