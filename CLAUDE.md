# marco — instruções do projeto

> Sistema pessoal de organização de atividades e contextos. Cada coisa feita vira um marco registrado.

## Fontes de verdade

- **`DESIGN.md`** — fonte de verdade visual. Toda tela/componente segue os tokens e guardrails de lá. Nunca hardcodar hex; sempre CSS variables.
- **`GOAL.MD`** — escopo e objetivos do produto (a definir via /goal).
- Formato do DESIGN.md baseado em [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) — usar como referência ao evoluir o documento.

## Stack

- Next.js (App Router) + TypeScript strict + Tailwind CSS
- shadcn/ui (componentes base) + Lucide (ícones) + Framer Motion (animação)
- next-themes (claro/escuro via classe `.dark`)
- Inter + JetBrains Mono via next/font
- Supabase (banco/auth — conta nova via MCP)
- IA: API OpenAI — modelos SEMPRE via env, nunca hardcoded: `OPENAI_MODEL` (síntese/casos ambíguos), `OPENAI_MODEL_LIGHT` (classificação/extração em volume), `OPENAI_EMBEDDING_MODEL` (pgvector, 1536 dims)
- n8n self-hosted (https://workflowsmatriz.cassinweb.shop) para automações
- Deploy: Vercel

## Skills a usar por contexto

| Contexto | Skills |
|---|---|
| UI/Frontend | `frontend-design:frontend-design`, `design-md`, `shadcn`, `tailwind-design-system`, `nextjs-app-router-patterns`, `nextjs-best-practices` |
| Auth/Banco | `nextjs-supabase-auth`, `supabase-automation`, `postgres-best-practices` |
| IA | `claude-api`, `prompt-engineering-patterns`, `llm-structured-output`, `zod-validation-expert` |
| Automações | `n8n-workflow-patterns`, `n8n-mcp-tools-expert`, `n8n-expression-syntax`, `n8n-validation-expert` |
| Deploy | `vercel-deployment` |
| Processo | `superpowers:brainstorming` (antes de features), `superpowers:writing-plans`, `architecture-decision-records` |

## Regras do projeto

- Guardrails visuais do DESIGN.md são invioláveis (sem gradiente/glow/sombra pesada; peso máx 500; cor = estado ou projeto, nunca decoração).
- Workflows n8n exportados como JSON em `n8n/workflows/`.
- ADRs em `docs/adrs/` para decisões de arquitetura.
- Secrets só via `.env` (espelhar chaves em `.env.example`).
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
