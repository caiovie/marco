# /goal — Fase 2: Marco

> **Estado atual (junho/2026):** MVP no ar na Vercel, login funcionando, UI das seções principais pronta, classificação de inbox implementada, Supabase com pgvector habilitado. `TELEGRAM_BOT_TOKEN` e `OPENAI_API_KEY` já estão no `.env` local. Sem repo no GitHub. Captura automática ainda não ligada.
>
> **Objetivo único da Fase 2:** o Marco deixa de ser um app que eu abro e alimento, e passa a se alimentar sozinho — captura de qualquer lugar (Telegram, Claude Code, Claude.ai, n8n, Drive), classifica com IA, e me devolve síntese semanal citada. No fim da fase, o Gmail (Fase A) está auditado e o painel de decisão no ar.

---

## Princípios da fase
- **YAGNI mantido:** nada de gbrain como dependência. Padrões dele (extração de entidades na escrita, síntese citada) implementados com o que já temos: Supabase + pgvector + API OpenAI.
- **Modelos (OpenAI):** sempre via variáveis de ambiente, nunca hardcoded — `OPENAI_MODEL` (modelo completo, para a síntese semanal e casos ambíguos) e `OPENAI_MODEL_LIGHT` (modelo mini/barato, para classificação e extração de entidades em volume). Embeddings: `text-embedding-3-small` (1536 dims) no pgvector.
- **Toda ação irreversível ou em massa passa por mim** (padrão já estabelecido: Gmail Fase C fica fora desta fase).

---

## Marcos (ordem de execução)

### Marco 8 — Fundação de engenharia *(bloqueia tudo; 30 min)*
1. Criar repo privado `marco` no GitHub e push do projeto (gh CLI ou manual).
2. Conferir `.gitignore` cobre `.env*` ANTES do primeiro push.
3. Subir para a Vercel as envs que hoje só existem no local: `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_MODEL_LIGHT` (o `TELEGRAM_BOT_TOKEN` vai para o n8n, não para a Vercel — quem fala com o Telegram é o n8n).
4. Refatorar a classificação de inbox para usar o client OpenAI lendo `OPENAI_MODEL_LIGHT` (se foi implementada com Anthropic, trocar aqui).
5. Smoke test: classificação de inbox roda em produção.
- **Pronto quando:** repo no GitHub sem segredos, classificação funcionando em produção via OpenAI.

### Marco 9 — Captura via Telegram *(killer feature; token já no .env)*
1. Registrar o webhook do bot (`setWebhook`) apontando para o n8n; o `TELEGRAM_BOT_TOKEN` entra como credencial do n8n.
2. n8n → endpoint `/api/ingest` do Marco com HMAC (`N8N_WEBHOOK_SECRET`).
3. Mensagem de texto vira item no inbox, já classificada (`OPENAI_MODEL_LIGHT`) com sugestão de projeto.
4. Suporte a comandos rápidos: `#ae`, `#kairos`, `#esca7`, `#clt` forçam o projeto.
- **Pronto quando:** mando uma mensagem no Telegram e ela aparece classificada no inbox do Marco.

### Marco 10 — Captura Claude Code + Claude.ai *(fecha o loop original)*
1. Hook `SessionEnd` do Claude Code → webhook n8n → `/api/ingest` (resumo da sessão, projeto, arquivos).
2. MCP Server Trigger no n8n com tools `registrar_atividade` e `criar_task`; conectar no Claude.ai.
- **Pronto quando:** uma sessão do Claude Code e um registro via Claude.ai aparecem sozinhos no feed.

### Marco 11 — Extração de entidades na escrita *(padrão gbrain, leve)*
1. No ingest, extrair referências (projeto, pessoa, tema) via `OPENAI_MODEL_LIGHT` → colunas/tags no item.
2. Embedding do item com `text-embedding-3-small` (pgvector, 1536 dims) para busca semântica futura.
- **Pronto quando:** itens novos entram com entidades e embedding; consulta SQL mostra os vetores.

### Marco 12 — Síntese semanal citada *(padrão gbrain)*
1. n8n schedule toda segunda 7h: busca marcos da semana → `OPENAI_MODEL` (modelo completo) gera retrospectiva com citação dos itens de origem (id/link).
2. Entrega: nota no Marco (seção Notas, projeto "semana") + opcional mensagem no Telegram via bot.
- **Pronto quando:** segunda de manhã chega a retrospectiva citando os marcos reais da semana.

### Marco 13 — Captura n8n + Drive *(completa as 4 fontes)*
1. Workflow agendado lê a API do n8n (workflows criados/modificados, execuções com erro) → ingest.
2. Trigger Drive (Service Account — pendente do Marco 2: criar o SA `marco-sa` e baixar o JSON) → planilha nova/modificada vira item.
- **Pronto quando:** criar um workflow no n8n e uma planilha no Drive gera itens no inbox sem eu fazer nada.

### Marco 14 — Gmail Fase A + painel de decisão
1. Workflow de auditoria (`fase-a-auditoria-gmail.md`) → popular `email_senders`.
2. Painel no Marco: remetentes ordenados por volume × baixa leitura, ações manter/cancelar (sem executar nada ainda).
- **Pronto quando:** vejo e classifico minhas inscrições no painel.

### Marco 15 — Qualidade de vida + ADRs *(fecho da fase)*
1. Busca global (pgvector + texto) no app.
2. Troca de senha.
3. ADR-001: "gbrain — padrões sim, dependência não". ADR-002: estratégia de modelos (OpenAI: modelo completo para síntese, mini para classificação/extração, embeddings text-embedding-3-small; modelos sempre via env, trocáveis sem refactor).
- **Pronto quando:** busco qualquer coisa de qualquer fonte numa caixa só; decisões documentadas em `/docs/adr/`.

---

## Pendências herdadas da Fase 1 (não esquecer)
- [ ] Service Account `marco-sa` no Google Cloud (a seção estava vazia na tela) — necessário no Marco 13.
- [ ] OAuth consent screen em **Production** (se ainda estiver Testing, o token do n8n volta a cair em 7 dias).
- [ ] Calendário (Marco 6 original) — reavaliar prioridade no fim desta fase; entra na Fase 3 se não doer antes.
- [ ] Atualizar o `.env.example` do repo com as novas variáveis: `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_MODEL_LIGHT`, `TELEGRAM_BOT_TOKEN` (e remover as `ANTHROPIC_*` se não forem mais usadas).

## Fora de escopo (Fase 3+)
- Gmail Fase C (executar unsubscribe) e Fase D (classificação contínua com leitura de corpo).
- Agente conversacional sobre o histórico (aí sim reavaliar gbrain como retrieval).
- Migração do conteúdo do Notion para o Marco.
- Multi-usuário, apps móveis nativos.

---

## Definição de pronto (Fase 2 concluída)
- [ ] Repo privado no GitHub, deploy contínuo Vercel, sem segredos no código.
- [ ] 5 fontes capturando sozinhas: Telegram, Claude Code, Claude.ai, n8n, Drive.
- [ ] Todo item entra classificado, com entidades e embedding.
- [ ] Retrospectiva semanal citada chegando toda segunda.
- [ ] Auditoria Gmail rodada e painel de decisão funcionando.
- [ ] Busca global no app. ADRs documentados.

---

## Como usar este goal no Claude Code

> "/goal Fase 2 Marco — arquivo GOAL-fase2.md na raiz. Estou no Marco N. Já fiz X. Execute o Marco N até o critério de pronto, sem pular para o seguinte."

Sequência sugerida de sessões: 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15. Os Marcos 9 e 10 são independentes entre si; se uma sessão travar em auth/credencial, pule para o outro e volte.
