# Spec — marco MVP

Data: 2026-06-11 · Status: aprovado (decisões delegadas ao agente)

## Resumo

App web pessoal (single-user) de captura, execução e registro de atividades. Ciclo: **Inbox → classificação → Tarefa/Marco → Feed**. Visual regido pelo `DESIGN.md`; escopo pelo `GOAL.MD`.

## Arquitetura

- **Next.js App Router (TS strict)** — Server Components para leitura, Server Actions para mutações. Sem API REST própria, exceto 1 route handler para classificação IA.
- **Supabase** — Postgres + Auth (email/senha) + RLS por `user_id` em todas as tabelas. Acesso via `@supabase/ssr` (client/server helpers).
- **IA** — route handler `POST /api/classify`: recebe texto do inbox, chama `claude-haiku-4-5-20251001` com tool-use (saída estruturada validada com Zod), retorna `{ project_slug, kind, title }`. Sem `ANTHROPIC_API_KEY` → 503 e a UI cai para classificação manual.
- **UI** — shadcn/ui + Tailwind com tokens do DESIGN.md em CSS variables; next-themes; Framer Motion (só opacity/transform); Lucide.

## Modelo de dados

```sql
projects:    id uuid pk, user_id, name text, slug text unique, color_key text
             (ae|kairos|esca7|busca-clt|neutral), archived bool, created_at
tasks:       id uuid pk, user_id, project_id fk null, title text, note text null,
             status text (backlog|doing|done), starred bool, created_at, done_at null
milestones:  id uuid pk, user_id, project_id fk null, title text, note text null,
             source text (manual|task|inbox), task_id fk null, occurred_at, created_at
inbox_items: id uuid pk, user_id, raw_text text,
             status text (pending|converted|discarded),
             suggestion jsonb null ({project_slug, kind, title}), created_at
```

- RLS: `user_id = auth.uid()` em select/insert/update/delete, todas as tabelas.
- Trigger não é usado para gerar marco; a Server Action de concluir tarefa cria o milestone na mesma transação (mais explícito e testável).
- Seed dos 4 projetos na primeira migração (associados ao primeiro usuário no primeiro login — função `ensure_seed_projects()` chamada pela app).

## Telas (rotas)

| Rota | Conteúdo |
|---|---|
| `/login` | Email+senha (Supabase), com modo "criar conta" para o primeiro acesso (app pessoal — uso único). |
| `/inbox` | Campo de captura no topo (autofocus, Enter envia). Lista de pendentes com chip de sugestão da IA e ações: aceitar / editar / virar marco / descartar. |
| `/tasks` | Lista agrupada por estado (backlog/doing/done), filtro por projeto na URL, ★ toggle, concluir gera marco. |
| `/feed` | Timeline reversa de marcos agrupada por dia ("hoje", "ontem", data). Botão "registrar marco" sempre visível. |
| `/projects` | Lista + criar/renomear/arquivar. |

Layout: sidebar fixa (200–220px) com wordmark `marco/caio`, navegação, toggle de tema. Conteúdo ao lado. Mobile: sidebar vira topbar.

## Fluxos principais

1. **Captura**: texto no inbox → insert `inbox_items` → fire-and-forget `/api/classify` → update `suggestion`.
2. **Conversão**: aceitar sugestão → cria task (ou milestone se kind=marco) → `inbox_items.status=converted`.
3. **Conclusão**: task → done → milestone criado com `source=task`, `occurred_at=now()`.
4. **Marco manual**: dialog rápido (título + projeto) de qualquer tela.

## Tratamento de erro

- Server Actions retornam `{ ok, error }`; UI mostra estado de erro discreto (texto `--negative`, sem toast espalhafatoso).
- Classificação IA: timeout 10s; falha silenciosa (item fica sem sugestão, classificável manualmente).
- Confirmação antes de ações destrutivas (descartar item, arquivar projeto) — regra do DESIGN.md.

## Testes / validação

- `npm run build` + `tsc --noEmit` verdes.
- Validação manual via app rodando: ciclo completo inbox→tarefa→done→feed.
- Zod valida toda entrada de Server Action e a resposta da IA.

## Deploy

- Vercel (conta `aiprojetcs`), env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY` (opcional).

## Fora de escopo

Ver GOAL.MD — fase 2 (n8n/WhatsApp, síntese fable-5, busca) e não-escopo (multi-user, mobile nativo, push, calendário, kanban drag-and-drop).
