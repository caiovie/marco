# DESIGN.md — Marco

> Sistema pessoal de organização de atividades e contextos. Cada coisa feita vira um marco registrado.
> Estética: editorial minimalista, preto e branco com cor semântica. Inspiração: Linear, Vercel, Notion.
> Este arquivo é a fonte de verdade visual. Qualquer tela nova deve seguir estes tokens e regras.

---

## 1. Atmosfera / tema visual

Calmo, denso em informação, sem ornamento. A interface some e o conteúdo aparece. Preto e branco fazem o trabalho pesado; cor só entra para comunicar estado (positivo/negativo/atenção/info) ou identificar projeto. Nada de gradientes, sombras pesadas, glows ou cores decorativas. Superfícies planas, bordas finas (0.5px), muito respiro.

Sensação alvo: abrir o app e sentir controle, não estímulo.

---

## 2. Identidade / logo

- Wordmark: `marco` em minúsculas, Inter Medium (500), letter-spacing -0.02em, na cor `--ink`.
- Símbolo: a inicial **M** geométrica OU um pino/marco de trilha simplificado (três traços formando um marcador). Sempre monocromático: preto no claro, branco no escuro. Nunca colorido.
- Na sidebar do app: `marco` + sufixo discreto `/caio` em `--ink-400`.
- Favicon: o símbolo M em `--ink` sobre `--paper`.

---

## 3. Paleta de cores

### Neutros (base — warm gray)
A base de tudo. Têm leve calor para não parecerem clínicos.

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--ink` | `#0A0A0A` | `#FAFAF9` | texto primário, ação primária |
| `--ink-900` | `#1C1917` | `#E7E5E4` | títulos |
| `--ink-700` | `#44403C` | `#D6D3D1` | texto forte |
| `--ink-500` | `#78716C` | `#A8A29E` | texto secundário |
| `--ink-400` | `#A8A29E` | `#78716C` | texto terciário, hints |
| `--line` | `#E7E5E4` | `#1F1F1F` | bordas, divisores |
| `--surface` | `#FFFFFF` | `#121212` | cards |
| `--surface-2` | `#F5F5F4` | `#1A1A1A` | superfícies secundárias |
| `--paper` | `#FAFAF9` | `#0A0A0A` | fundo da página |

### Semânticas (só comunicam estado — nunca decorar)
Cada uma tem fundo suave (chip), cor sólida (dot/ícone) e texto escuro (sobre o chip).

| Estado | Sólido | Chip light | Texto light | Chip dark | Texto dark |
|---|---|---|---|---|---|
| Positivo (feito, sucesso) | `#16A34A` | `#DCFCE7` | `#166534` | `#052E16` | `#86EFAC` |
| Negativo (erro, atrasado) | `#DC2626` | `#FEE2E2` | `#991B1B` | `#450A0A` | `#FCA5A5` |
| Atenção (prioridade ★) | `#D97706` | `#FEF3C7` | `#92400E` | `#451A03` | `#FBBF24` |
| Info (links, foco) | `#2563EB` | `#DBEAFE` | `#1E40AF` | `#172554` | `#93C5FD` |

### Tags de projeto (dessaturadas — nunca competem com estado)

| Projeto | Chip light | Texto light | Chip dark | Texto dark |
|---|---|---|---|---|
| AE | `#EDE9FE` | `#5B21B6` | `#2E1065` | `#C4B5FD` |
| Kairós | `#D1FAE5` | `#065F46` | `#064E3B` | `#6EE7B7` |
| Esca7 | `#FEF3C7` | `#92400E` | `#451A03` | `#FCD34D` |
| Busca CLT | `#FCE7F3` | `#9D174D` | `#500724` | `#F9A8D4` |

**Regra de ouro das cores:** se há vermelho na tela, algo está errado. Se há verde, algo deu certo. Cor de estado sempre tem prioridade visual sobre tag de projeto. Quando em dúvida, use neutro.

---

## 4. Tipografia

- Família: `Inter` (ou `Geist`) para UI; `JetBrains Mono` para código/IDs/timestamps técnicos.
- Dois pesos só: 400 (regular) e 500 (medium). Nunca 600/700 — pesado demais para esta estética.
- Escala: h1 22px / h2 18px / h3 16px / corpo 14px / auxiliar 13px / micro 11px.
- Line-height: 1.5 para corpo, 1.2 para títulos.
- Sentence case sempre. Nunca Title Case nem ALL CAPS (exceto labels de seção, que podem ser uppercase com letter-spacing 0.06em e 11px).

---

## 5. Espaçamento e layout

- Grid base 4px. Espaçamentos: 4, 8, 12, 16, 24, 32.
- Sidebar fixa 200–220px; conteúdo flui ao lado.
- Cards: padding 14–16px, radius 12px, borda 0.5px `--line`.
- Densidade alta mas nunca apertada: 8–12px entre linhas de lista.

---

## 6. Componentes (estilos e estados)

### Botões
- Primário: fundo `--ink`, texto invertido. Hover: leve dim. Active: scale(0.98).
- Secundário: transparente, borda 0.5px `--line`, texto `--ink`. Hover: fundo `--surface-2`.
- Destrutivo: texto `#DC2626`, borda da mesma cor em hover. Confirmação sempre antes de ação irreversível.
- Altura 32–36px, radius 8px, peso 500.

### Cards
- Fundo `--surface`, borda 0.5px `--line`, radius 12px. Sem sombra (ou quase imperceptível só no hover de itens clicáveis).

### Tags / chips
- Radius pill (20px), 11px, peso 500. Fundo = chip da cor; texto = texto da cor. Nunca preto puro sobre chip colorido.

### Inputs
- Altura 36px, borda 0.5px `--line`, radius 8px. Focus: ring 2px `--info` com leve transparência. Sem sombra interna.

### Estrela de prioridade (★)
- Off: contorno `--ink-400`. On: preenchida `#D97706` (atenção). Único uso de âmbar como "marcador", coerente com o significado de atenção.

### Estados de tarefa
- Backlog: neutro. Doing: sutil destaque de borda `--info`. Done: texto riscado `--ink-400` + chip verde.

---

## 7. Modo claro / escuro

- Implementar via `next-themes`, troca por classe `.dark` no `<html>`.
- Todos os tokens viram CSS variables — componentes nunca hardcodam hex.
- Default: seguir o sistema operacional; permitir override manual (toggle sol/lua na sidebar).
- Transição de tema: crossfade de 200ms em `background-color` e `color`. Nada mais.

```css
:root {
  --ink: #0A0A0A; --paper: #FAFAF9; --surface: #FFFFFF;
  --surface-2: #F5F5F4; --line: #E7E5E4; --ink-500: #78716C;
}
.dark {
  --ink: #FAFAF9; --paper: #0A0A0A; --surface: #121212;
  --surface-2: #1A1A1A; --line: #1F1F1F; --ink-500: #A8A29E;
}
```

---

## 8. Animação / movimento

Discreta e funcional. A animação confirma uma ação; nunca chama atenção para si.

- Duração: 150–200ms. Easing: `ease-out` para entradas, `ease-in-out` para troca de estado.
- Anime só `opacity` e `transform`. Nunca `width`/`height`/`top`.
- Biblioteca: Framer Motion.
- Padrões:
  - Item novo no Inbox/Feed: fade-in + slide sutil de 4px.
  - Tarefa concluída: risca o texto, fade para `--ink-400`, depois colapsa a linha.
  - Troca de tema: crossfade 200ms.
  - Hover de item clicável: transição de fundo 120ms.
- Respeitar `prefers-reduced-motion`: desligar todas as animações não essenciais.

---

## 9. Iconografia

- Lucide (outline). Tamanho 16–20px inline, 24px máximo decorativo.
- Ícones herdam a cor do texto ao redor. Nunca ícone colorido sem motivo semântico.

---

## 10. Guardrails (o que nunca fazer)

- Nunca usar cor para decorar. Cor = estado ou identidade de projeto, só.
- Nunca peso de fonte acima de 500.
- Nunca sombra pesada, gradiente, glow ou blur.
- Nunca Title Case ou ALL CAPS (exceto labels de seção).
- Nunca preto puro sobre chip colorido.
- Nunca animar mais que `opacity`/`transform`.
- Quando em dúvida entre neutro e cor: escolher neutro.
- Cor de estado sempre vence cor de projeto na hierarquia visual.

---

## Stack de implementação

- Next.js (App Router) + TypeScript + Tailwind CSS.
- shadcn/ui para componentes base (acessíveis, sem opinião visual forte).
- next-themes para claro/escuro.
- Framer Motion para animação.
- Lucide para ícones. Inter + JetBrains Mono via next/font.
- IA (classificação/síntese via API Anthropic): modelo `claude-fable-5`; para classificação simples em volume, `claude-haiku-4-5-20251001`.