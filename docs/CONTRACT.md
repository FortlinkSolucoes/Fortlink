# Contrato de componentes (APIs fixas — agentes trabalham em paralelo contra estas assinaturas)

Todos em `src/components/`. Props em TypeScript (`interface Props`). Não mude assinaturas; pode adicionar props opcionais.

## ui/ (dono: agente UI)
- `ui/Logo.astro` — `{ variant?: 'full' | 'mark'; class?: string; animated?: boolean }`
  SVG inline recriando o "F" de circuito (trilhas + nós) com gradiente da marca; `full` inclui wordmark
  "FORTLINK" + "SOLUÇÕES" em `--font-display`. Paths das trilhas com classe `.logo-trace` e nós `.logo-node`
  (Preloader anima o stroke). `aria-label="FortLink Soluções"`, `role="img"`. IDs de gradiente únicos por instância.
- `ui/Icon.astro` — `{ name: IconName | 'arrow-right' | 'arrow-up-right' | 'check' | 'whatsapp' | 'mail' | 'pin' | 'phone' | 'clock' | 'menu' | 'close' | 'plus'; size?: number; class?: string }`
  SVG stroke 1.5, `currentColor`, `aria-hidden="true"`. `IconName` vem de `@/data/site`.
- `ui/Button.astro` — `{ href?: string; variant?: 'primary' | 'ghost' | 'link'; icon?: (Icon name); external?: boolean; magnetic?: boolean; class?: string; type?: 'button'|'submit' }`
  Renderiza `<a>` se `href`, senão `<button>`. `primary` = pill com gradiente animado + glow no hover; `ghost` = borda fina vidro.
  `magnetic` adiciona `data-magnetic` (o efeito é do agente FX). `external` → `target=_blank rel="noopener noreferrer"`.
  Slot = rótulo.
- `ui/SectionHeading.astro` — `{ eyebrow?: string; title: string; lead?: string; align?: 'left'|'center'; as?: 'h1'|'h2' }`
  Título usa `data-split` (animado pelo agente FX). Suporta `set:html` no título para `<span class="text-gradient">`.
- `ui/GlowCard.astro` — `{ as?: 'article'|'div'|'li'; class?: string }` + slot. Card vidro com borda gradiente e
  spotlight que segue o ponteiro (CSS vars `--mx/--my` atualizadas por script próprio do componente; desligado em touch/reduced motion).

## fx/ (dono: agente FX)
- `fx/Cursor.astro` — cursor custom (ponto + anel com lag), cresce sobre `a, button, [data-cursor]`, texto opcional via
  `data-cursor="Ver"`. Só em `(hover:hover) and (pointer:fine)` e sem reduced motion; senão não renderiza nada visível.
  Também inicializa o efeito global `[data-magnetic]`.
- `fx/Preloader.astro` — tela de entrada (só home, 1x por sessão via `sessionStorage` com try/catch): desenha o F de circuito
  (stroke-dashoffset), contador 0→100, sai com wipe. ≤ 1.8s. Sem JS/reduced motion → não aparece. Emite
  `window.dispatchEvent(new Event('preloader:done'))` ao terminar (e imediatamente quando não roda).
- `fx/NetworkCanvas.astro` — `{ class?: string; density?: number }` canvas absoluto de fundo: nós + ligações que se formam
  por proximidade, pulsos de dados (pontos de luz) viajando pelas ligações em ciano/magenta, reage ao mouse (atração suave).
  Pausa fora da viewport/aba oculta, DPR ≤ 2, densidade reduzida em mobile, estático (1 frame) em reduced motion.
- `fx/Marquee.astro` — `{ items: readonly string[]; speed?: number; reverse?: boolean }` faixa infinita que acelera/inverte com a
  velocidade do scroll. CSS-only fallback.
- `src/scripts/split.ts` — exporta `initSplitHeadings()`: todo `[data-split]` revela por linha/palavra com máscara
  (usar `SplitText` do GSAP — é gratuito desde 3.13: `import { SplitText } from 'gsap/SplitText'`). Chamado pelo Cursor.astro?
  **Não**: o agente FX cria `fx/FxBoot.astro` (script que chama `initSplitHeadings` + magnetic) e informa no resumo;
  o integrador adiciona ao BaseLayout.

## layout/ (dono: agente Layout)
- `layout/Header.astro` — header fixo vidro; `Logo variant="mark"` + "FORTLINK" pequeno; nav de `nav` em `site.ts` com
  indicador animado do link ativo (`Astro.url.pathname`, `aria-current="page"`); CTA "Solicitar orçamento" (Button primary → /contato/);
  some ao rolar para baixo e volta ao subir; menu mobile fullscreen com links grandes em stagger, trap de foco, Esc fecha,
  `aria-expanded`/`aria-controls`, trava scroll (Lenis `getLenis()?.stop()`).
- `layout/Footer.astro` — CTA gigante ("Vamos conectar sua empresa?") com Button, colunas (navegação, serviços, contato),
  endereço, e-mail, WhatsApp, wordmark enorme em outline no rodapé, "© 2026 FortLink Soluções".
- `layout/WhatsAppFloat.astro` — botão flutuante com Icon whatsapp, pulso sutil, tooltip, `aria-label`. Aparece após rolar 300px.
- `layout/Seo.astro` — `{ title: string; description: string; image?: string }` canonical, OG, Twitter, favicon (`/favicon.svg` +
  `/favicon.png`), JSON-LD `LocalBusiness` com dados de `site`.
- `pages/404.astro`.

## sections/ + pages (donos: agentes Home, Serviços, Contato)
Seções em `components/sections/<pagina>/Nome.astro`. Páginas: `pages/index.astro`, `pages/servicos/index.astro`,
`pages/contato/index.astro`, todas com `<BaseLayout title=... description=...>`.
