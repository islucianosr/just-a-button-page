# Directive: Extração de Leads do Google Maps via Apify

**Plataforma:** Leadsx1B  
**Stack:** React + TypeScript + Supabase + Apify (Actor: `compass/google-maps-extractor`)  
**Objetivo:** Buscar leads do Google Maps e exibi-los na plataforma com priorização automática

---

## 1. Visão Geral da Arquitetura

```
[Usuário na UI]
      ↓ preenche: cidade, categoria, quantidade
[NewSearch.tsx]
      ↓ POST payload
[Supabase Edge Function: apify-execute-search]
      ↓ chama API da Apify
[Actor: compass/google-maps-extractor]
      ↓ retorna JSON com leads
[Edge Function]
      ↓ processa + calcula priority_score + insere
[Tabela: leads no Supabase]
      ↓ consulta
[Results.tsx → LeadsTable.tsx]
      ↓ exibe na plataforma
[Usuário vê os leads]
```

---

## 2. Entradas (Input)

O usuário preenche no formulário `NewSearch.tsx`:

| Campo | Tipo | Exemplo | Observações |
|-------|------|---------|-------------|
| `locationQuery` | string | `"São Paulo, Brasil"` | Cidade + país livre |
| `categoryFilterWords` | string | `"restaurante"` | Nicho/categoria do negócio |
| `maxCrawledPlacesPerSearch` | number | `100` | Limitado ao plano do usuário |

**Limites por plano:**
- Starter (R$97/mês): até 1.000 leads/mês
- Pro (R$197/mês): até 5.000 leads/mês
- Agency (R$497/mês): ilimitado

---

## 3. Payload enviado à Apify

```json
{
  "categoryFilterWords": ["restaurante"],
  "language": "pt-PT",
  "locationQuery": "São Paulo, Brasil",
  "maxCrawledPlacesPerSearch": 100,
  "searchMatching": "all",
  "skipClosedPlaces": false,
  "website": "allPlaces"
}
```

**Actor usado:** `compass/google-maps-extractor`  
**Endpoint:** `POST https://api.apify.com/v2/acts/compass~google-maps-extractor/run-sync-get-dataset-items?token={API_KEY}`  
**Timeout:** 180 segundos (3 minutos)  
**Custo estimado:** ~$0.004 por lead ($4/1000)

---

## 4. Dados Retornados pelo Actor (JSON → XML equivalente)

O Actor retorna um array JSON com os seguintes campos relevantes:

| Campo Apify | Campo no DB (`leads`) | Tipo | Observações |
|-------------|----------------------|------|-------------|
| `title` / `name` | `name` | string | Nome do estabelecimento |
| `phone` / `phoneNumber` | `phone` | string | Formato: `+55 11 99999-9999` |
| `email` | `email` | string | Pode ser nulo |
| `address` | `address` | string | Endereço completo |
| `city` | `city` | string | Cidade |
| `country` | `country` | string | País |
| `website` / `url` | `website` | string | Pode ser rede social |
| `rating` / `totalScore` | `rating` | float | Nota no Google (0-5) |
| `reviewsCount` | `reviews_count` | int | Qtd. de avaliações |
| `categories` / `categoryName` | `categories` | array | Categorias do Google |
| `url` / `link` | `google_url` | string | Link do Google Maps |

**⚠️ Atenção:** Alguns campos podem ter múltiplos valores no XML (ex: `emails`, `instagrams`, `facebooks`). O parser deve tratar isso como lista e concatenar ou pegar o primeiro valor.

---

## 5. Lógica de Priorização (`priority_score`)

Calculado na Edge Function antes de inserir no banco:

```typescript
function calculatePriorityScore(lead: any): number {
  const hasWebsite = lead.website && lead.website.trim() !== '';
  return hasWebsite ? 30 : 100;
}
```

**Regra atual (simplificada):**
- **SEM website** → `priority_score = 100` → prioridade `ALTA` → observação: `⭐ SEM WEBSITE - Alta Prioridade`
- **COM website** → `priority_score = 30` → prioridade `BAIXA`

**⚠️ Importante:** O campo `website` pode conter links de redes sociais (Instagram, Facebook, etc.). Nesses casos, o lead deve ser tratado como **SEM website próprio** (Alta Prioridade). A função `checkHasWebsite` no `xmlParser.ts` já implementa essa lógica — replicar na Edge Function:

```typescript
const socialMediaDomains = ['instagram.com', 'facebook.com', 'fb.com', 'twitter.com', 'linkedin.com'];

function hasRealWebsite(website: string): boolean {
  if (!website) return false;
  return !socialMediaDomains.some(domain => website.toLowerCase().includes(domain));
}
```

---

## 6. Schema do Banco de Dados (Supabase)

### Tabela: `leads`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK |
| `search_id` | uuid | FK → `apify_searches.id` |
| `user_id` | uuid | FK → `auth.users.id` |
| `name` | text | Nome do estabelecimento |
| `phone` | text | Telefone |
| `email` | text | E-mail |
| `address` | text | Endereço |
| `city` | text | Cidade |
| `country` | text | País |
| `website` | text | Site ou rede social |
| `rating` | float | Nota Google |
| `reviews_count` | int | Qtd. avaliações |
| `categories` | text[] | Array de categorias |
| `google_url` | text | Link Maps |
| `priority_score` | int | 0-100 (100 = mais prioritário) |
| `observations` | text | Observações automáticas |
| `is_contacted` | bool | Já foi contatado |
| `whatsapp_sent` | bool | WhatsApp enviado |
| `whatsapp_sent_at` | timestamp | Quando enviou |

### Tabela: `apify_searches`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `auth.users.id` |
| `name` | text | Nome da pesquisa |
| `search_type` | text | `'local'` ou `'urls'` |
| `search_params` | jsonb | Input enviado à Apify |
| `status` | text | `'running'`, `'succeeded'`, `'failed'` |
| `total_results` | int | Qtd. leads encontrados |
| `estimated_cost` | float | Custo estimado em USD |
| `error_message` | text | Mensagem de erro se falhar |
| `created_at` | timestamp | Data da busca |

### Tabela: `apify_config`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `user_id` | uuid | FK → `auth.users.id` |
| `api_key` | text | Token da API Apify |
| `is_valid` | bool | Token foi validado |

---

## 7. Fluxo Completo da Edge Function (`apify-execute-search`)

```
1. Receber request com SearchParams
2. Validar auth (JWT do usuário)
3. Buscar api_key em apify_config WHERE user_id = user.id
4. Verificar is_valid = true
5. Limitar maxResults = Math.min(params.maxResults, 100)
6. Criar registro em apify_searches com status = 'running'
7. Chamar Apify Actor via POST com token na URL
8. Se erro → atualizar search status = 'failed' + error_message
9. Se sucesso → processar items:
   a. Mapear campos JSON → formato do DB
   b. Calcular priority_score para cada lead
   c. Adicionar observações automáticas
   d. Ordenar por priority_score DESC
   e. Inserir em lote na tabela leads
10. Atualizar search status = 'succeeded' + total_results
11. Retornar { success, searchId, totalResults, highPriorityCount }
```

---

## 8. Exibição na Plataforma (`Results.tsx`)

Os leads são carregados do Supabase e exibidos com as seguintes abas:

| Aba | Filtro |
|-----|--------|
| **Todos** | Todos os leads do usuário |
| **Última Busca** | `search_id === mostRecentSearchId` |
| **Enviados** | `whatsapp_sent === true` |
| **Pendentes** | `whatsapp_sent === false` |

**Transformação DB → Frontend (`Lead` type):**
```typescript
{
  id: item.id,
  name: item.name,
  phone: item.phone || '',
  email: item.email || '',
  address: item.address || '',
  city: item.city || '',
  category: item.categories?.[0] || '',
  website: item.website || '',
  reviewsCount: item.reviews_count || 0,
  rating: item.rating || 0,
  googleMapsUrl: item.google_url || '',
  priority: item.priority_score >= 70 ? 'ALTA' : 'BAIXA',
  hasWebsite: !!item.website,
  observations: item.observations || '',
  whatsappSent: item.whatsapp_sent || false,
  whatsappSentAt: item.whatsapp_sent_at,
  searchId: item.search_id
}
```

---

## 9. Upload via XML (Alternativa ao Apify)

A plataforma também suporta upload manual de XML (`UploadXML.tsx`) usando o parser `xmlParser.ts`.

**Campos lidos do XML:**
- `<title>` → `name`
- `<phone>` → `phone` *(obrigatório — leads sem telefone são descartados)*
- `<street>` → `address`
- `<city>` → `city`
- `<categoryName>` → `category`
- `<website>` → `website`
- `<reviewsCount>` → `reviewsCount`
- `<totalScore>` → `rating`
- `<url>` → `googleMapsUrl`

**Campos ignorados no parser atual (mas presentes no XML):**
- `<emails>` → considerar adicionar ao tipo `Lead`
- `<instagrams>` → considerar adicionar
- `<facebooks>` → considerar adicionar
- `<imageUrl>` → considerar adicionar para exibição na tabela

---

## 10. Edge Cases e Atenções

| Situação | Tratamento |
|----------|-----------|
| Lead sem telefone | Descartar no parser XML; no Apify, armazenar mesmo assim |
| `reviewsCount` vazio/null | Defaultar para `0` |
| `website` = link de Instagram/Facebook | Tratar como SEM website (prioridade ALTA) |
| Múltiplos emails no XML | Pegar o primeiro ou concatenar com `,` |
| Timeout da Apify (>3min) | Retornar erro e marcar search como `failed` |
| Token Apify inválido | HTTP 401/403 → mensagem clara para o usuário |
| Saldo insuficiente na Apify | HTTP 402 → alertar usuário |
| Actor não encontrado | HTTP 404 → verificar acesso ao `compass/google-maps-extractor` |
| Rate limit | HTTP 429 → aguardar e tentar novamente |

---

## 11. Melhorias Recomendadas (Backlog)

1. **Adicionar campo `emails` ao tipo `Lead`** — o XML retorna e-mails mas o tipo atual não os armazena
2. **Replicar `checkHasWebsite` na Edge Function** — hoje a lógica de detecção de redes sociais só existe no parser XML, não na Edge Function
3. **Webhook assíncrono** — para buscas grandes (>100 leads), trocar de `run-sync` para `run` + webhook de conclusão, evitando timeout
4. **Paginação na tabela** — para usuários com muitos leads, implementar paginação no `Results.tsx`
5. **Exportação CSV** — adicionar botão para exportar leads filtrados
6. **Score mais rico** — incluir `reviewsCount`, `rating`, e presença de e-mail no cálculo do `priority_score`

---

## 12. Arquivos Relevantes da Plataforma

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/pages/NewSearch.tsx` | Formulário de busca |
| `src/pages/Results.tsx` | Exibição dos leads |
| `src/components/LeadsTable.tsx` | Tabela de leads |
| `src/utils/xmlParser.ts` | Parser do XML do Apify |
| `src/types/lead.ts` | Tipos TypeScript |
| `supabase/functions/apify-execute-search/index.ts` | Edge Function principal |
| `supabase/functions/apify-run-extractor/index.ts` | Edge Function alternativa |
| `supabase/functions/apify-validate-key/index.ts` | Validação do token |
| `src/integrations/supabase/types.ts` | Tipos gerados do DB |