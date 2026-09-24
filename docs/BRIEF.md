# FortLink v2 — Brief do time

Site institucional da **FortLink Soluções** (TI corporativa, Foz do Iguaçu). É a empresa do dono em jogo:
padrão de agência premiada (Awwwards/FWA), **moderno, clean, escuro, neon sutil**, com animações exclusivas —
mas rápido, acessível e sem exagero visual. Idioma: **pt-BR** (acentuação correta sempre).

## Stack
- Astro 7 (saída estática, GitHub Pages, domínio `www.fortlinksolucoes.com.br` via `public/CNAME`)
- TypeScript strict (`@/*` → `src/*`)
- GSAP 3 + ScrollTrigger, Lenis (smooth scroll) — já inicializados em `src/scripts/motion.ts`
- CSS puro com tokens (`src/styles/tokens.css`) + `<style>` com escopo nos componentes `.astro`
- Fontes self-hosted: Michroma (display/eyebrows/wordmark), Sora (títulos), Inter (texto)
- **Sem** Tailwind, **sem** React, **sem** novas dependências sem necessidade real.

## Identidade
- Logo: um "F" feito de trilhas de circuito, gradiente ciano → azul → violeta → magenta/rosa com brilho neon, wordmark
  "FORTLINK / SOLUÇÕES" em fonte larga tipo Michroma. PNG em `public/logo-fortlink.png` (1024×1536, fundo com glow, pesado — **não usar no header**).
- Conceito visual: **conexão / rede / circuito / link**. Linhas finas, nós, pulsos de dados percorrendo trilhas, grid técnico sutil.
- Fundo quase preto violeta (`--bg`), superfícies em vidro (`--bg-elev` + `backdrop-filter`), bordas finas com `--grad-border`.
- Gradiente só como acento (títulos-chave, bordas, glows). Muito espaço em branco. Tipografia grande.

## Regras (boas práticas — obrigatórias)
1. Cores, espaçamentos, fontes, raios, easings: **somente tokens** de `tokens.css`.
2. Conteúdo: **somente** de `src/data/site.ts` (não hardcode telefone, endereço, textos de serviço).
3. Acessibilidade: HTML semântico, `alt`, `aria-*` corretos, foco visível, navegação por teclado, contraste AA,
   um `<h1>` por página, hierarquia de headings.
4. **`prefers-reduced-motion`**: todo módulo de animação checa `prefersReducedMotion()` e não roda; o conteúdo tem que
   estar visível sem JS. Use `[data-reveal]` / `[data-stagger]` (já tratados em `motion.ts`) para reveals simples.
5. Animações pesadas (canvas/WebGL): pausar fora da viewport (IntersectionObserver) e quando a aba está oculta,
   limitar DPR a 2, desligar/simplificar em touch/mobile. Somente `transform`/`opacity` em tweens de DOM.
6. Scripts de animação: `import { gsap, ScrollTrigger, onMotionReady, prefersReducedMotion, isTouch } from '@/scripts/motion'`
   e rodar dentro de `onMotionReady(() => { ... })`.
7. Mobile-first, sem scroll horizontal, testado em 360px.
8. Performance: imagens com `astro:assets` quando houver, SVG inline para ícones, nada de libs de ícone.
9. Código limpo, comentários curtos só quando o "porquê" não é óbvio. Nomes em inglês no código, textos em pt-BR.
10. Cada agente **só cria/edita os arquivos da sua responsabilidade**. Não mexer em `tokens.css`, `global.css`,
    `motion.ts`, `site.ts`, `BaseLayout.astro` — se precisar de algo lá, reporte no resumo final.

## Estrutura
```
src/
  data/site.ts            conteúdo
  styles/tokens.css       design tokens
  styles/global.css       reset + utilitários (.container .section .eyebrow .text-gradient .muted .sr-only)
  scripts/motion.ts       Lenis + GSAP + reveals
  layouts/BaseLayout.astro
  components/layout/      Header, Footer, WhatsAppFloat, Seo
  components/fx/          Cursor, Preloader, NetworkCanvas, SplitText, Marquee, Magnetic...
  components/ui/          Button, Icon, GlowCard, SectionHeading...
  components/sections/    seções das páginas
  pages/                  index.astro, servicos/index.astro, contato/index.astro, 404.astro
```
