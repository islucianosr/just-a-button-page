
## Objetivo
Fazer com que a aplicação Leadsx1B mostre o **Dashboard** quando alguém abre a rota **`/`**, e quando não houver sessão autenticada, redirecionar para **`/auth`** (sem ficar “em branco” durante o carregamento).

## O que está a acontecer agora (causa do “não aparece nada”)
- Em `src/App.tsx`, a rota **`/`** está a renderizar `HomeBlank` (a tal página do botão).
- O dashboard real está em **`/dashboard`** (`Index.tsx`).
- Além disso, o `Index.tsx` faz auth-gating e, enquanto não tem sessão, ele faz `return null;` — o que pode parecer “tela branca” por alguns instantes (ou se o redirect falhar por qualquer motivo).

## Mudanças propostas (alto nível)
1. **Trocar a rota inicial** para que `path="/"` renderize o **dashboard (`Index`)**.
2. **Manter /dashboard** também apontando para o mesmo dashboard (opcional, mas útil para compatibilidade).
3. **Evitar tela branca** no dashboard enquanto verifica sessão:
   - Introduzir estado de “carregando sessão” e mostrar um loader/skeleton.
   - Só redirecionar para `/auth` depois da verificação concluir e confirmar que não há sessão.

## Plano de implementação (passo a passo)
### 1) Atualizar roteamento (`src/App.tsx`)
- Alterar:
  - `Route path="/" element={<HomeBlank />}`  → `Route path="/" element={<Index />}`
- Decidir sobre `/dashboard`:
  - Opção recomendada: manter `Route path="/dashboard" element={<Index />}` também (fica redundante mas não quebra links antigos).
- (Opcional) Se `HomeBlank` não for mais necessário:
  - Remover import do `HomeBlank` do `App.tsx`.
  - Podemos manter o ficheiro `HomeBlank.tsx` no repo (sem uso) ou apagar depois (mas apagar só se você quiser).

### 2) Corrigir UX do auth-gating no Dashboard (`src/pages/Index.tsx`)
Hoje:
- `session` começa `null`
- componente retorna `null` até `getSession()` resolver
- isso causa “página vazia” mesmo quando está a funcionar corretamente

Proposta:
- Trocar o estado para algo como:
  - `const [session, setSession] = useState<Session | null>(null)`
  - `const [checkingSession, setCheckingSession] = useState(true)`
- Fluxo:
  1. Registrar `onAuthStateChange` (como já faz)
  2. Chamar `getSession()`
  3. Definir `checkingSession=false` no final
  4. Se `!session` e `!checkingSession` → `navigate('/auth')`
- Render:
  - Se `checkingSession` → renderizar layout simples de loading (ex.: `<Skeleton />` ou spinner central)
  - Se `!session` (após checking) → pode renderizar também um “Redirecionando…” (por 1 frame) em vez de `null`

### 3) Testes end-to-end (critério de pronto)
- Abrir **`/`**:
  - Se estiver logado: deve mostrar o dashboard (cards “Nova Busca”, “Pipeline CRM”, etc.).
  - Se NÃO estiver logado: deve ir para `/auth` (sem tela branca prolongada).
- Fazer login em `/auth`:
  - Após login: deve redirecionar para `/dashboard` (já faz) e como `Index` estará em `/` também, ambos devem funcionar.
- Fazer logout no dashboard:
  - Deve voltar para `/auth`.

## Detalhes técnicos (para manter consistente com o projeto)
- O projeto já usa Supabase (`supabase.auth.getSession`, `onAuthStateChange`) e React Router (`useNavigate`).
- Para o loading UI, reutilizar componentes existentes:
  - `Skeleton` já existe e é usado em `DashboardStats`.
- Não vou mexer em lógica de dados (leads, apify_searches, pipeline) — apenas roteamento e UX de sessão.

## Arquivos envolvidos
- `src/App.tsx` (troca da rota `/` para o dashboard)
- `src/pages/Index.tsx` (ajuste do estado de sessão para evitar “return null” durante loading)
- (Opcional) `src/pages/HomeBlank.tsx` (ficar sem uso ou ser removido depois, conforme você preferir)

