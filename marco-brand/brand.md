# brand.md — Marco

Manual de uso da identidade visual. Complementa o `DESIGN.md` (que rege a interface); este arquivo rege a **marca**.

---

## 1. O símbolo: O Marcador

Três barras horizontais empilhadas, larguras na razão **3 : 2 : 1** (36/24/12 no viewBox de 48), alinhadas ao centro, cantos totalmente arredondados.

Significado em camadas:
- **Marco de trilha** (cairn): pedras empilhadas que marcam o caminho.
- **Progresso**: as barras crescem da base — cada coisa feita soma.
- **Foco**: afunila para cima, do amplo ao essencial.

### Geometria canônica (não alterar)
- Altura de cada barra: 7 unidades. Gap vertical: 4 unidades. Radius: 3.5 (pill completo).
- Barras sempre centralizadas no eixo vertical.
- Nunca girar, espelhar, inclinar, mudar proporções ou número de barras.

---

## 2. Versões da marca

| Arquivo | Uso |
|---|---|
| `marco-logo-horizontal-light.svg` | Logo completa sobre fundos claros |
| `marco-logo-horizontal-dark.svg` | Logo completa sobre fundos escuros |
| `marco-symbol-light.svg` / `-dark.svg` | Símbolo isolado (avatares, espaços pequenos) |
| `icon.svg` | Favicon vetorial (Next.js `app/icon.svg`) |
| `favicon.ico` | Fallback multi-tamanho 16/32/48 |
| `apple-touch-icon.png` | iOS (180×180, iOS arredonda sozinho) |
| `marco-symbol-ink-1024.png` / `-paper-1024.png` | Símbolo em alta, fundo transparente |
| `og-image.png` | Compartilhamento social (1200×630) |

---

## 3. Cores da marca

A marca é **estritamente monocromática**:
- Sobre claro: `#0A0A0A` (ink)
- Sobre escuro: `#FAFAF9` (paper)

Nunca aplicar cor semântica (verde/vermelho/âmbar/azul) nem cores de projeto na marca. Nunca gradiente. Se o fundo não for neutro, usar a versão que der maior contraste.

---

## 4. Wordmark

- `marco` sempre em minúsculas, Inter Medium (500), letter-spacing −0.02em.
- No app, sufixo de contexto permitido: `marco /caio` — o sufixo em `--ink-400`, peso 400.
- Nunca usar peso acima de 500, nunca itálico, nunca caps.

---

## 5. Área de respiro e tamanho mínimo

- **Respiro:** manter ao redor da marca um espaço livre igual à altura da barra do meio (a de largura 24) em todas as direções.
- **Tamanho mínimo:**
  - Logo horizontal: 96px de largura.
  - Símbolo isolado: 16px (testado — lê no favicon).

---

## 6. O que nunca fazer

- Colorir o símbolo ou o wordmark.
- Alterar a razão 3:2:1 das barras ou os gaps.
- Adicionar sombra, contorno, glow ou gradiente.
- Colocar a marca sobre imagem ruidosa sem um bloco neutro por trás.
- Recriar o wordmark em outra fonte.
- Usar o símbolo como bullet point ou elemento decorativo repetido na interface (ele é marca, não ornamento).

---

## 7. Instalação no projeto Next.js

```
app/
  icon.svg              <- copiar icon.svg (Next gera favicon automaticamente)
  apple-icon.png        <- copiar apple-touch-icon.png
  opengraph-image.png   <- copiar og-image.png
public/
  brand/                <- demais SVGs para uso na UI (sidebar, login, e-mails)
```

Na sidebar, usar o componente com `marco-symbol-*` + texto, trocando a versão conforme o tema (`next-themes`).
