# Agente de Gestão de Despesas via WhatsApp — Especificação Completa

> Nota de contexto: este documento descreve um produto novo (SaaS de despesas
> via WhatsApp para o mercado angolano). O repositório atual (`bot-accounts-remastered`)
> contém o "AgendaCheia", uma agenda de encomendas para confeitarias — um produto
> diferente. Esta especificação fica isolada em `docs/` como referência de arquitetura,
> sem alterar o código existente.

## 1. Visão geral

- **Canal único**: WhatsApp (texto, áudio, imagem, PDF).
- **Multi-conta**: cada número de WhatsApp liga-se a uma conta; isolamento total de
  dados entre contas (nunca há cruzamento de categorias, centros de custo, histórico
  ou saldos entre contas diferentes).
- **Moeda base**: AOA (kwanza), com suporte a USD e EUR apenas quando a conta define
  esses valores explicitamente (sem conversão automática por defeito).
- **Escala**: milhares de contas simultâneas — o desenho tem de ser *stateless* por
  mensagem, com todo o estado de conversa persistido por conta (nunca em memória de
  processo).

---

## 2. Prompt de sistema

```
Tu és o agente de despesas da [PRODUTO] no WhatsApp. Falas português de Angola,
de forma directa e sem formalidades. A tua única função é registar e organizar
despesas da conta que está a falar contigo — nunca dás conselhos fiscais ou
contabilísticos, nunca reveals dados de outra conta, e nunca inventas valores,
datas, fornecedores ou categorias.

CONTA ACTUAL
- ID da conta: {account_id}
- Nome: {account_name}
- Tipo: {account_type}  (pessoal | empresa)
- Moeda base: {base_currency}
- Centros de custo: {cost_centers}
- Categorias activas: {categories}
- Plano: {plan_name}  — limites: {plan_limits}

O QUE FAZES
1. Recebes um gasto em texto, áudio, imagem ou PDF.
2. Extrais: data, valor, moeda, descrição, fornecedor, categoria, forma de
   pagamento, centro de custo, comprovativo (sim/não).
3. Se faltar informação que não podes adivinhar (valor, data, fornecedor),
   perguntas — nunca preenches com um palpite.
4. Se a categoria não encaixar claramente numa das categorias activas da conta,
   perguntas qual usar ou marcas "por classificar". Nunca forças uma categoria.
5. Mostras um resumo curto do que entendeste e esperas confirmação explícita
   antes de gravar. Só gravas depois de "sim"/"confirma"/equivalente.
6. Se detectares um possível duplicado (mesmo valor, mesmo dia, fornecedor
   igual ou comprovativo com o mesmo hash), avisas antes de gravar e perguntas
   se é para continuar.
7. Se o comprovativo estiver ilegível ou incompleto, dizes exactamente o que
   não conseguiste ler (ex: "não consigo ler o valor total, só o NIF") e pedes
   nova foto — nunca adivinhas o que falta.
8. Nunca converte valores entre moedas com uma taxa que a conta não configurou
   explicitamente. Se o utilizador mencionar um valor em moeda diferente da
   base sem taxa configurada, perguntas a taxa ou registas na moeda original
   sem converter.

FORMATOS ANGOLANOS
- "45.000" = quarenta e cinco mil kwanzas (ponto como separador de milhares).
- Datas dd/mm/aaaa. Aceitas datas relativas: "ontem", "hoje", "anteontem",
  "sexta passada", "dia 3".
- Se a data não for indicada, assume o dia da mensagem e diz isso no resumo.

LIMITES DE PLANO
- Nunca prometes uma funcionalidade fora do plano actual da conta.
- Se a conta atingir um limite (nº de registos, OCR de imagem, transcrição de
  áudio, exportação, centros de custo extra), dizes exactamente qual o limite
  atingido e o que é preciso para desbloquear — nunca bloqueias em silêncio.

TOM
- Respostas curtas. Sem "Caro cliente", sem assinatura, sem emojis em excesso
  (no máximo 1 por mensagem, só quando ajuda a confirmar ex: ✅).
- Cada confirmação de registo inclui: valor formatado, categoria, e total
  acumulado do mês nessa moeda.

NUNCA
- Nunca inventas dados que não estão na mensagem/áudio/imagem/PDF.
- Nunca misturas ou revelas dados de outra conta, mesmo que o utilizador peça.
- Nunca dás aconselhamento fiscal, jurídico ou contabilístico.
- Nunca grava sem confirmação explícita do utilizador.
- Nunca converte moeda com taxa não configurada.
```

---

## 3. Fluxo de onboarding

Disparado na primeira mensagem recebida de um número sem conta associada.

```
1. Apresentação (uma mensagem, duas linhas):
   "Olá! Sou o agente de despesas da [PRODUTO]. Regista os teus gastos aqui
   no WhatsApp — por texto, áudio, foto do talão ou PDF."

2. Pergunta 1 — nome da conta:
   "Como te chamas (ou qual o nome da empresa)?"
   → grava account.name

3. Pergunta 2 — tipo de conta:
   "É conta pessoal ou de empresa?"
   [Pessoal] [Empresa]
   → grava account.type
   → se "Empresa": segue fluxo empresa (passo 3b); se "Pessoal": salta para 4.

   3b. Pergunta opcional empresa — NIF (não bloqueante):
       "Qual o NIF da empresa? (podes saltar dizendo 'saltar')"
       → grava account.taxId (nullable)

4. Pergunta 3 — moeda base:
   "Em que moeda registas os gastos? AOA, USD ou EUR?"
   → grava account.baseCurrency (default sugerido: AOA)

5. Pergunta 4 — centros de custo:
   "Por defeito uso 'Pessoal' e 'Empresa' como centros de custo. Queres
   manter assim ou definir outros agora? (podes sempre mudar depois)"
   [Manter Pessoal/Empresa] [Definir agora]
   → se "Definir agora": pede lista separada por vírgulas
   → grava costCenters[]

6. Confirmação final + primeiro uso:
   "Pronto, {name}! Já podes mandar um gasto — texto, áudio, foto ou PDF.
   Exemplo: 'gasóleo 45.000 ontem'."
   → account.onboardingCompletedAt = now()
```

Regras do onboarding:
- Nunca pede mais do que estes 4 campos nesta fase (nome, tipo, moeda, centros
  de custo) — tudo o resto (categorias custom, forma de pagamento preferida,
  utilizadores adicionais) é configurável depois, sob pedido ou via comando
  `ajuda`/`configurar`.
- Se o utilizador mandar um gasto durante o onboarding antes de o terminar,
  o agente regista a resposta como resposta à pergunta pendente e só depois
  retoma o registo do gasto (nunca perde a mensagem original — fica em fila
  de "pendente de reprocessar").

---

## 4. Fluxo de tratamento por tipo de entrada

### 4.1 Texto
```
1. Parser de linguagem natural extrai: valor, moeda, data, descrição,
   possível categoria/fornecedor/forma de pagamento.
2. Campos obrigatórios em falta (valor, data) → pergunta pontual, um campo
   de cada vez, não um formulário.
3. Categoria inferida por palavras-chave + histórico da conta; se confiança
   baixa → pergunta com sugestões (lista das categorias activas).
4. Mostra resumo → aguarda confirmação → grava.
```

### 4.2 Áudio
```
1. Transcreve (pt-AO, incluindo expressões locais e números por extenso:
   "quarenta e cinco mil" = 45.000).
2. Se a transcrição tiver baixa confiança numa parte crítica (valor, data),
   NÃO adivinha: responde com a transcrição feita e pergunta especificamente
   pela parte incerta ("Percebi 'gasóleo... mil' mas não tenho a certeza do
   valor. Podes confirmar quanto foi?").
3. Segue o mesmo pipeline do texto a partir da transcrição validada.
```

### 4.3 Imagem (talão / fatura / recibo fotografado)
```
1. OCR extrai: valor total, data, fornecedor/NIF, forma de pagamento (se
   impressa), itens (opcional).
2. Verifica duplicado: hash da imagem + (valor, data, fornecedor) contra
   histórico recente da conta (janela configurável, ex. 30 dias).
   → se bater: avisa "Este comprovativo parece igual ao que registaste em
     {data anterior}. Confirmas que é um gasto novo?" antes de continuar.
3. Campos ilegíveis → lista exactamente o que não deu para ler:
   "Não consegui ler o valor total nem a data — só o nome do fornecedor
   (Sonangol). Manda outra foto ou diz-me os valores."
4. Comprovativo fica marcado (comprovativo = sim) e anexado ao registo.
5. Resumo → confirmação → grava.
```

### 4.4 PDF (facturas e extractos bancários)
```
1. Extrai texto/tabelas do PDF.
2. Detecta se é documento de UMA despesa (factura simples) ou de VÁRIAS
   (extracto bancário, factura com múltiplas linhas).
3. Caso múltiplas linhas:
   a. Extrai cada linha como candidato a despesa separada.
   b. Mostra lista numerada resumida (não uma por uma) para revisão:
      "Encontrei 5 movimentos no extracto. Aqui vai o resumo — diz 'confirma
      tudo' ou o número dos que queres ajustar/remover antes de gravar."
   c. Grava cada linha como registo independente após confirmação (em lote
      ou individualmente, conforme resposta do utilizador).
4. Mesma verificação de duplicado do fluxo de imagem, aplicada por linha.
5. Linhas ilegíveis/ambíguas → marcadas "por classificar" e reportadas à
   parte, nunca silenciosamente ignoradas nem inventadas.
```

---

## 5. Modelo de dados multi-conta

Isolamento por `accountId` em todas as tabelas de domínio — nunca uma query
sem filtro de conta. Esboço (ilustrativo, adaptável ao ORM em uso):

```prisma
model Account {
  id                     String   @id @default(cuid())
  name                   String
  type                   AccountType   // PESSOAL | EMPRESA
  taxId                  String?
  baseCurrency           Currency      // AOA | USD | EUR
  planId                 String
  onboardingCompletedAt  DateTime?
  createdAt              DateTime @default(now())

  plan                   Plan          @relation(fields: [planId], references: [id])
  whatsappNumbers        WhatsappNumber[]
  categories             Category[]
  costCenters            CostCenter[]
  expenses               Expense[]
  exchangeRates          ExchangeRate[]
  usageCounters          UsageCounter[]
}

model WhatsappNumber {
  id         String   @id @default(cuid())
  accountId  String
  phone      String   @unique   // E.164
  account    Account  @relation(fields: [accountId], references: [id])
}

model Category {
  id         String   @id @default(cuid())
  accountId  String
  name       String
  isDefault  Boolean  @default(false)
  isActive   Boolean  @default(true)
  account    Account  @relation(fields: [accountId], references: [id])

  @@unique([accountId, name])
}

model CostCenter {
  id         String   @id @default(cuid())
  accountId  String
  name       String
  isDefault  Boolean  @default(false)
  account    Account  @relation(fields: [accountId], references: [id])

  @@unique([accountId, name])
}

model Expense {
  id              String    @id @default(cuid())
  accountId       String
  date            DateTime
  amount          Decimal
  currency        Currency
  description     String
  supplier        String?
  categoryId      String?
  costCenterId    String?
  paymentMethod   PaymentMethod?
  hasReceipt      Boolean   @default(false)
  receiptAssetId  String?
  status          ExpenseStatus  // CONFIRMED | UNCLASSIFIED | PENDING_REVIEW
  sourceType      SourceType     // TEXT | AUDIO | IMAGE | PDF
  duplicateOfId   String?
  createdAt       DateTime  @default(now())

  account     Account     @relation(fields: [accountId], references: [id])
  category    Category?   @relation(fields: [categoryId], references: [id])
  costCenter  CostCenter? @relation(fields: [costCenterId], references: [id])

  @@index([accountId, date])
}

model ReceiptAsset {
  id           String   @id @default(cuid())
  accountId    String
  contentHash  String   // para detecção de duplicados
  storageUrl   String
  createdAt    DateTime @default(now())

  @@index([accountId, contentHash])
}

model ExchangeRate {
  id          String   @id @default(cuid())
  accountId   String
  fromCurrency Currency
  toCurrency   Currency
  rate         Decimal
  setAt        DateTime @default(now())
  setBy        String   // "user" | "system"

  @@unique([accountId, fromCurrency, toCurrency])
}

model Plan {
  id                String   @id @default(cuid())
  name              String   // Free | Pro | Business
  monthlyExpenseLimit    Int?
  imageOcrLimit          Int?
  audioTranscriptionLimit Int?
  pdfLimit               Int?
  costCenterLimit        Int?
  exportEnabled          Boolean @default(false)
}

model UsageCounter {
  id            String   @id @default(cuid())
  accountId     String
  periodStart   DateTime  // início do mês de referência
  expensesCount Int       @default(0)
  imageOcrCount Int       @default(0)
  audioCount    Int       @default(0)
  pdfCount      Int       @default(0)

  @@unique([accountId, periodStart])
}

model ConversationState {
  id             String   @id @default(cuid())
  accountId      String   @unique
  pendingIntent  Json?     // pergunta em aberto, campos já capturados, etc.
  updatedAt      DateTime @updatedAt
}

enum AccountType { PESSOAL EMPRESA }
enum Currency { AOA USD EUR }
enum PaymentMethod { NUMERARIO MULTICAIXA_EXPRESS TPA TRANSFERENCIA KWIK DEBITO_DIRETO }
enum ExpenseStatus { CONFIRMED UNCLASSIFIED PENDING_REVIEW }
enum SourceType { TEXT AUDIO IMAGE PDF }
```

Notas de isolamento:
- Toda a query de leitura/escrita passa por uma camada que injecta
  `WHERE accountId = :current` — nunca construída manualmente por rota.
- `ConversationState` guarda o estado da pergunta pendente por conta, para
  suportar múltiplas mensagens em sequência sem depender de memória de
  processo (necessário à escala de milhares de contas simultâneas).

---

## 6. Mensagens padrão

### Confirmação de registo
```
✅ {valor formatado} — {categoria}
{centro_de_custo} · {forma_pagamento}
Total do mês em {categoria}: {total_categoria}
Total do mês (tudo): {total_mes}
```

### Pedido de confirmação antes de gravar
```
Confirma?
📅 {data}  💰 {valor} {moeda}
{descrição} — {fornecedor}
Categoria: {categoria}   Centro de custo: {centro_custo}
Pagamento: {forma_pagamento}   Comprovativo: {sim/não}

Responde "sim" para gravar, ou diz o que corrigir.
```

### Campo em falta
```
Falta só o valor. Quanto foi?
```

### Categoria não reconhecida
```
Não sei bem em que categoria encaixa "{descrição}". Escolhe uma:
1. {categoria_1}
2. {categoria_2}
...
Ou diz "por classificar" para deixar em aberto.
```

### Possível duplicado
```
⚠️ Isto parece igual a um gasto que já registaste em {data_anterior}
({valor_anterior}, {fornecedor_anterior}). Continuar mesmo assim?
```

### Comprovativo ilegível
```
Não consegui ler {campos_em_falta} nesta foto. Consigo ler: {campos_lidos}.
Manda outra foto mais nítida ou diz-me os valores em falta.
```

### Limite de plano atingido
```
Chegaste ao limite do teu plano {plano_actual}: {descrição_do_limite}.
Para continuar este mês, muda para o plano {plano_sugerido} em {link/comando}.
```

### Erro genérico de extração
```
Não consegui perceber este gasto. Podes escrever assim: "gasóleo 45.000 ontem"?
```

---

## 7. Comandos de consulta

| Comando (linguagem natural) | Acção |
| --- | --- |
| "gastos deste mês" | Soma total do mês corrente, por categoria |
| "quanto gastei em [categoria]" | Total da categoria no período corrente (ou indicado) |
| "gastos de [centro de custo]" | Total e lista resumida do centro de custo |
| "apagar o último" | Remove o último registo confirmado da conta (pede confirmação) |
| "corrigir o valor para X" | Edita o valor do último registo referenciado na conversa |
| "mudar categoria para Y" | Edita a categoria do último registo referenciado |
| "exportar" | Gera CSV/Excel do período (respeita limite do plano) e envia link/arquivo |
| "resumo por centro de custo" | Quebra o total do mês por cada centro de custo |
| "ajuda" | Lista comandos disponíveis e como registar um gasto |

Regras:
- Comandos de edição ("corrigir", "mudar categoria", "apagar o último") só
  actuam sobre o último registo da própria conta dentro de uma janela
  temporal curta (ex. mesma sessão/últimas 24h) — fora disso, pedem o
  identificador do registo (data + valor) para evitar editar o item errado.
- "exportar" sem período implícito assume o mês corrente.

---

## 8. Tratamento de limites de plano

Modelo de planos ilustrativo (valores a confirmar pelo utilizador — ver
secção 9):

| Limite | Free | Pro | Business |
| --- | --- | --- | --- |
| Registos/mês | 30 | 500 | Ilimitado |
| OCR de imagem/mês | 10 | 200 | Ilimitado |
| Transcrição de áudio/mês | 10 | 200 | Ilimitado |
| Leitura de PDF/mês | 0 | 50 | Ilimitado |
| Centros de custo | 2 (fixos) | 10 | Ilimitado |
| Exportação (CSV/Excel) | Não | Sim | Sim |

Fluxo:
1. Antes de processar qualquer entrada, verifica `UsageCounter` do mês
   corrente da conta contra os limites do `Plan` associado.
2. Se dentro do limite: processa e incrementa o contador correspondente
   (por tipo: registo, OCR, áudio, PDF) apenas após sucesso na extracção.
3. Se no limite: responde com a mensagem de "Limite de plano atingido"
   (secção 6), identificando exactamente qual limite (não um genérico
   "limite atingido").
4. Nunca promete ou activa uma funcionalidade fora do plano contratado —
   mesmo que o utilizador peça directamente ("ativa exportação para mim").
5. Upgrade de plano é sempre uma acção explícita fora da conversa de
   registo (link de pagamento/comando dedicado), nunca assumida
   automaticamente.

---

## 9. O que falta que só tu podes fornecer

Infraestrutura e integrações:
- **Acesso oficial ao WhatsApp Business API** (Meta/Cloud API ou BSP como
  Twilio/360dialog) — conta verificada, número dedicado, aprovação de
  templates de mensagem.
- **Fornecedor de transcrição de áudio** com suporte adequado a português
  de Angola/expressões locais (decisão de custo/qualidade: Whisper próprio
  vs. API paga).
- **Fornecedor de OCR** para talões/facturas angolanas (qualidade de leitura
  de NIF, formatos de talão locais) e de parsing de PDF/extractos bancários
  (formatos variam por banco).
- **Fonte de taxas de câmbio**, se decidires oferecer conversão automática
  no futuro (hoje o produto nunca converte sem taxa fornecida pelo
  utilizador) — precisa de decisão de fonte oficial (BNA?) e frequência de
  actualização.
- **Armazenamento de comprovativos** (bucket, política de retenção,
  compliance de dados pessoais/fiscais em Angola).

Decisões de negócio:
- **Planos e preços reais** (os limites da secção 8 são placeholders) —
  quantos registos/OCR/áudio por plano, preço em AOA, moeda de cobrança.
- **Meio de cobrança** das assinaturas SaaS (Multicaixa Express, cartão
  internacional, transferência manual?).
- **Política de dados**: quanto tempo guardar comprovativos e histórico,
  o que acontece a dados de uma conta cancelada.
- **Nome definitivo do produto** (usei `[PRODUTO]` como placeholder no
  prompt de sistema).
- **Lista definitiva de categorias/formas de pagamento** — as da tua
  mensagem original foram usadas como defaults, mas categorias sectoriais
  extra (ex. agro, construção) podem fazer sentido consoante o público-alvo.
- **Janela de detecção de duplicados** (proponho 30 dias — confirma se faz
  sentido para o teu caso de uso).
- **Regra de correcção/edição fora da janela recente** — hoje proponho
  exigir data+valor para localizar o registo; confirma se preferes outro
  mecanismo (ex. listar últimos N e escolher por número).
