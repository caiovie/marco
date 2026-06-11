# marco

Sistema pessoal de organização de atividades e contextos — cada coisa feita vira um marco registrado.

Estética editorial minimalista (preto e branco + cor semântica), inspirada em Linear, Vercel e Notion. Ver [`DESIGN.md`](./DESIGN.md).

## Status

✅ **MVP no ar** — ciclo completo Inbox → Tarefa/Marco → Feed funcionando.

- Produção: https://marco-caio-s-projects26.vercel.app
  (desativar *Vercel Authentication* em Settings → Deployment Protection para acesso público)
- Local: `npm run dev` → http://localhost:3000

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Tema | next-themes (claro/escuro), tokens em CSS variables |
| Animação | Framer Motion (só `opacity`/`transform`, 150–200ms) |
| Banco/Auth | Supabase |
| IA | API OpenAI — modelos via env (`OPENAI_MODEL`, `OPENAI_MODEL_LIGHT`, `OPENAI_EMBEDDING_MODEL`) |
| Automações | n8n self-hosted |
| Deploy | Vercel |

## Estrutura

```
marco.ai/
├── DESIGN.md            # fonte de verdade visual
├── GOAL.MD              # escopo do produto (a definir)
├── CLAUDE.md            # instruções para o agente
├── docs/
│   ├── architecture/    # diagramas e docs de arquitetura
│   └── adrs/            # Architecture Decision Records
├── n8n/
│   └── workflows/       # workflows exportados em JSON
├── .env.example         # template de variáveis de ambiente
└── (src/ — será criado no scaffold do Next.js)
```

## Setup

1. Copiar `.env.example` para `.env.local` e preencher as chaves (Supabase obrigatório; `ANTHROPIC_API_KEY` opcional — sem ela a classificação do inbox é manual).
2. `npm install && npm run dev`.
