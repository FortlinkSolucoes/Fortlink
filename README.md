# FortLink Soluções — site institucional (v2)

Site da **FortLink Soluções**, hub de tecnologia em Foz do Iguaçu (infraestrutura de TI, redes, cabeamento,
suporte, CFTV, firewall e monitoramento NOC). Publicado em **https://www.fortlinksolucoes.com.br**.

Visual escuro, neon sutil e animações fluidas, sem abrir mão de desempenho, acessibilidade e
`prefers-reduced-motion`.

## Stack

| Camada       | Tecnologia                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| Framework    | [Astro 7](https://astro.build) com saída 100% estática                     |
| Linguagem    | TypeScript strict (alias `@/*` → `src/*`)                                  |
| Animação     | GSAP 3 + ScrollTrigger + SplitText, Lenis (smooth scroll)                  |
| Estilo       | CSS puro com design tokens + `<style>` com escopo nos componentes `.astro` |
| Fontes       | Self-hosted via Fontsource: Michroma (display), Sora (títulos), Inter (texto) |
| SEO          | `@astrojs/sitemap`, Open Graph, JSON-LD `LocalBusiness`                    |
| Hospedagem   | GitHub Pages (branch `gh-pages`) + domínio próprio via `CNAME`             |

Sem Tailwind, sem React e sem bibliotecas de ícones: ícones são SVG inline.

## Como rodar

Requisitos: **Node.js 22 ou superior** (veja `engines` no `package.json`) e npm.

```bash
npm i            # instala as dependências (em CI usamos npm ci)
npm run dev      # servidor de desenvolvimento em http://localhost:4321
npm run build    # astro check (tipos) + build estático em ./dist
npm run preview  # serve o ./dist localmente para conferir o build
npm run check    # só a checagem de tipos/diagnósticos do Astro
```

### Imagens da marca (OG, ícones, logo leve)

As imagens rasterizadas são geradas a partir do logo mestre `assets/brand/logo-fortlink.png`
(PNG de 2 MB mantido **fora** de `public/` para nunca ir para produção):

```bash
node scripts/generate-og.mjs
```

Gera `public/og.png` (1200×630), `public/logo-fortlink.webp` (600 px, fundo transparente) e
`public/apple-touch-icon.png` (180×180). Os textos do card vêm de `src/data/site.ts` e são convertidos em
curvas com as próprias fontes do projeto, então o resultado é idêntico em qualquer máquina.
Rode de novo sempre que o nome, a tagline ou o logo mudarem, e faça commit dos arquivos gerados.

## Estrutura de pastas

```
.
├── .github/workflows/gh-pages.yml   CI (build em PRs) + deploy na main
├── assets/brand/                    arquivos-fonte da marca (não publicados)
├── docs/                            BRIEF.md (direção) e CONTRACT.md (APIs dos componentes)
├── legacy/                          site antigo em HTML estático (referência)
├── public/                          arquivos servidos como estão: CNAME, favicon, og.png, ícones
├── scripts/generate-og.mjs          gera og.png, logo .webp e apple-touch-icon
└── src/
    ├── data/site.ts                 TODO o conteúdo: contato, serviços, textos, navegação
    ├── styles/tokens.css            design tokens (cores, tipografia, espaços, raios, easings)
    ├── styles/global.css            reset + utilitários (.container .section .eyebrow .text-gradient ...)
    ├── scripts/motion.ts            Lenis + GSAP + reveals ([data-reveal], [data-stagger])
    ├── layouts/BaseLayout.astro     <html>, SEO, header, footer, cursor, preloader
    ├── components/
    │   ├── layout/                  Header, Footer, WhatsAppFloat, Seo
    │   ├── fx/                      Cursor, Preloader, NetworkCanvas, Marquee, FxBoot...
    │   ├── ui/                      Logo, Button, Icon, GlowCard, SectionHeading...
    │   └── sections/<página>/       seções de cada página
    └── pages/                       index, servicos/, contato/, 404
```

## Deploy

O workflow `.github/workflows/gh-pages.yml` roda automaticamente:

- **Pull requests:** `npm ci` + `npm run build` (inclui `astro check`). Nada é publicado.
- **Push na `main`:** mesmo build e, se passar, publica `./dist` na branch `gh-pages` com
  `peaceiris/actions-gh-pages@v4` e `cname: www.fortlinksolucoes.com.br`.

Builds antigos do mesmo branch são cancelados quando chega um commit novo (o deploy em si nunca é
interrompido no meio). O token só tem permissão de escrita no job de deploy.

Configuração única no GitHub: **Settings → Pages → Source: Deploy from a branch → `gh-pages` / `/ (root)`**
e DNS do domínio apontando para o GitHub Pages.

## Convenções

- **Tokens, sempre.** Cores, espaçamentos, fontes, raios, sombras, easings e durações só via variáveis de
  `src/styles/tokens.css`. Nada de hex ou `px` soltos nos componentes.
- **Conteúdo só em `src/data/site.ts`.** Telefone, e-mail, endereço, serviços e textos institucionais
  nunca são escritos direto nos componentes.
- **Movimento com responsabilidade.**
  - Todo módulo de animação importa de `@/scripts/motion` e roda dentro de `onMotionReady(() => { ... })`.
  - Checa `prefersReducedMotion()` e não anima quando o usuário pede menos movimento.
  - O conteúdo precisa estar visível sem JavaScript. Para reveals simples use `data-reveal` / `data-stagger`.
  - Tweens de DOM só em `transform` e `opacity`. Canvas/WebGL pausa fora da viewport e com a aba oculta,
    limita DPR a 2 e simplifica em touch/mobile.
- **Acessibilidade.** HTML semântico, um `<h1>` por página, hierarquia de headings, `alt` e `aria-*`
  corretos, foco visível, tudo operável por teclado, contraste AA.
- **Mobile-first.** Sem scroll horizontal; testar a partir de 360 px.
- **Imagens.** Use `astro:assets` para imagens de conteúdo; o logo no site é SVG inline (`ui/Logo.astro`).
  O `logo-fortlink.webp` existe para usos externos (JSON-LD, e-mail etc.).
- **Código.** Nomes em inglês, textos em pt-BR com acentuação correta, comentários curtos só para o "porquê".
- **Editor.** `.editorconfig` define UTF-8, LF e indentação de 2 espaços.
