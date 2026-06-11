# GOAL.md — marco

> Sistema pessoal de organização de atividades e contextos. Cada coisa feita vira um marco registrado.

## Problema

Trabalho distribuído em vários projetos (AE, Kairós, Esca7, Busca CLT) gera três dores:

1. **Captura dispersa** — ideias e demandas chegam a qualquer hora e se perdem.
2. **Execução sem registro** — coisas são feitas mas não ficam registradas; no fim da semana não há resposta clara para "o que eu fiz?".
3. **Contexto fragmentado** — cada projeto vive em um lugar diferente, sem visão única.

## Visão

Um único lugar, calmo e denso em informação, onde tudo que chega é capturado, tudo que está em andamento é visível, e tudo que foi feito vira um **marco** permanente na linha do tempo.

## Usuário

Single-user: Caio. Sem times, sem colaboração, sem compartilhamento.

## MVP (fase 1)

### O ciclo central

```
Inbox (captura) → classificação (IA) → Tarefa ou Marco → Feed (registro)
```

### Features

| # | Feature | Descrição |
|---|---|---|
| 1 | **Inbox** | Campo único de captura rápida. Cada item recebe sugestão da IA (projeto + tipo: tarefa/marco/nota) via `claude-haiku-4-5`; confirmação com 1 clique. Sem `ANTHROPIC_API_KEY`, classificação manual. |
| 2 | **Tarefas** | Lista por estado (backlog → doing → done), filtro por projeto, estrela de prioridade (★ âmbar). Concluir tarefa gera marco automaticamente. |
| 3 | **Feed de marcos** | Timeline reversa agrupada por dia. Cada marco: título, projeto (chip), horário, origem (manual/tarefa/inbox). |
| 4 | **Projetos** | Seed: AE, Kairós, Esca7, Busca CLT (cores do DESIGN.md). CRUD simples (criar/renomear/arquivar). |
| 5 | **Auth** | Supabase Auth (email+senha), single-user, RLS em todas as tabelas. |
| 6 | **Tema** | Claro/escuro via next-themes, default = sistema, toggle na sidebar. |

### Critérios de sucesso

- Capturar um pensamento no Inbox em **menos de 5 segundos** (atalho + campo + enter).
- O Feed responde "o que fiz essa semana?" **em uma única tela**.
- Zero fricção para registrar marco manual (botão sempre acessível).
- Uso diário real por 2 semanas seguidas.

## Fase 2 (fora do MVP — não construir agora)

- Captura externa: WhatsApp/Telegram → n8n → webhook → Inbox.
- Síntese semanal dos marcos com `claude-fable-5` (retrospectiva gerada).
- Busca global (texto + filtros).
- Métricas: marcos por projeto/semana, streak de registro.

## Não-escopo (decidido)

- Multi-usuário, times, permissões.
- App mobile nativo (web responsivo basta).
- Notificações push.
- Integração com calendário.
- Subtarefas, dependências, kanban drag-and-drop complexo.

## Decisões registradas

- Banco: Supabase project `qdyuyoaokeaqsghdpuqx` (conectado via MCP).
- Deploy: Vercel (conta `aiprojetcs`).
- Visual: 100% regido pelo `DESIGN.md` — guardrails invioláveis.
- IA é progressiva: o app funciona completo sem a chave da Anthropic; a IA só acelera a classificação.
