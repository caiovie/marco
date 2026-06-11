# marco

Sistema pessoal de organização de atividades e contextos — cada coisa feita vira um marco registrado.

Estética editorial minimalista (preto e branco + cor semântica), inspirada em Linear, Vercel e Notion. Ver [`DESIGN.md`](./DESIGN.md).

## Status

🚧 **Fase de base** — fundação do projeto montada, aguardando definição de escopo (`GOAL.MD`).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Tema | next-themes (claro/escuro), tokens em CSS variables |
| Animação | Framer Motion (só `opacity`/`transform`, 150–200ms) |
| Banco/Auth | Supabase |
| IA | API Anthropic (`claude-fable-5` / `claude-haiku-4-5`) |
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

1. Copiar `.env.example` para `.env` e preencher as chaves (Supabase, Anthropic).
2. Scaffold do Next.js será criado após a definição do GOAL.
