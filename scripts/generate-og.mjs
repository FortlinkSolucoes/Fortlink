// Generates brand raster assets from the master logo (assets/brand/logo-fortlink.png — kept out of public/ so the 2 MB PNG never ships):
//   public/og.png               1200×630 Open Graph / Twitter card
//   public/logo-fortlink.webp   600px wide, transparent (lightweight logo for <img>/JSON-LD)
//   public/apple-touch-icon.png 180×180
//
// Usage: node scripts/generate-og.mjs   (Node ≥ 22.18 — imports src/data/site.ts via type stripping)
//
// Text is converted to SVG paths with the self-hosted fonts (fontkitten ships with Astro),
// so the card renders identically on any machine regardless of installed system fonts.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { site } from '../src/data/site.ts';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));

// Mirrors src/styles/tokens.css (raster output cannot read CSS custom properties).
const c = {
  bg: '#07041a',
  bg2: '#0e0725',
  violet: '#3a1e65',
  blue: '#465eba',
  cyan: '#3bcae6',
  magenta: '#c04fd6',
  pink: '#f07ad8',
  text: '#f4f2ff',
  muted: '#a9a4cf',
  dim: '#6f6a98',
  line: 'rgba(207,204,236,0.07)',
};

const LOGO = root('assets/brand/logo-fortlink.png');
// Crop boxes measured on the 1024×1536 master (alpha > 200 bbox: 137,351 → 879,1193), padded for the glow.
const MARK_BOX = { left: 150, top: 320, width: 700, height: 700 };
const FULL_BOX = { left: 100, top: 300, width: 824, height: 940 };

// ---------- Text → SVG paths ----------
let fontkit = null;
try {
  fontkit = await import('fontkitten');
} catch {
  console.warn('! fontkitten indisponível — usando <text> com fontes do sistema.');
}

// Variable fonts load at their default instance (wght 400): fontkitten can't instance WOFF2
// variations, so heavier weights are emulated with a same-color stroke (`embolden`).
async function loadFont(file) {
  if (!fontkit) return null;
  return fontkit.create(await readFile(root(file)));
}

const fonts = {
  display: await loadFont('node_modules/@fontsource/michroma/files/michroma-latin-400-normal.woff'),
  heading: await loadFont('node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2'),
  body: await loadFont('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'),
};
const fallbackFamily = { display: 'Verdana, sans-serif', heading: 'Segoe UI, Arial, sans-serif', body: 'Segoe UI, Arial, sans-serif' };

const escapeXml = (s) => s.replace(/[<>&"]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[ch]);

function measure(kind, str, size, tracking = 0) {
  const font = fonts[kind];
  if (!font) return str.length * size * 0.56 + tracking * (str.length - 1);
  const scale = size / font.unitsPerEm;
  return font.glyphsForString(str).reduce((w, g) => w + g.advanceWidth * scale + tracking, -tracking);
}

let maskId = 0;

/** Renders `str` with its baseline at (x, y). Returns SVG markup. */
function text(kind, str, { x, y, size, fill, tracking = 0, embolden = 0 }) {
  const font = fonts[kind];
  if (!font) {
    return `<text x="${x}" y="${y}" font-family="${fallbackFamily[kind]}" font-size="${size}" letter-spacing="${tracking}" fill="${fill}">${escapeXml(str)}</text>`;
  }
  const scale = size / font.unitsPerEm;
  let cursor = x;
  const parts = [];
  for (const glyph of font.glyphsForString(str)) {
    const d = glyph.path.toSVG();
    if (d) parts.push(`<path transform="translate(${cursor.toFixed(2)} ${y}) scale(${scale.toFixed(5)} ${(-scale).toFixed(5)})" d="${d}"/>`);
    cursor += glyph.advanceWidth * scale + tracking;
  }
  const width = cursor - tracking - x;
  const stroke = (paint) =>
    embolden ? ` stroke="${paint}" stroke-width="${(embolden / scale).toFixed(1)}" stroke-linejoin="round"` : '';
  if (!fill.startsWith('url(')) return `<g fill="${fill}"${stroke(fill)}>${parts.join('')}</g>`;
  // Paint servers resolve per glyph (each path has its own transform), so gradient text is a masked rect.
  const id = `t${++maskId}`;
  const top = y - size;
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%"><g fill="#fff"${stroke('#fff')}>${parts.join('')}</g></mask>
  <rect x="${x - size * 0.1}" y="${top}" width="${width + size * 0.2}" height="${size * 1.4}" fill="${fill}" mask="url(#${id})"/>`;
}

/** Splits into the fewest lines that fit, then balances them (no one-word orphans). */
function wrap(kind, str, size, maxWidth) {
  const greedy = wrapGreedy(kind, str, size, maxWidth);
  if (greedy.length !== 2 && greedy.length !== 3) return greedy;
  const words = str.split(/\s+/);
  let best = greedy;
  let bestWidth = Math.max(...greedy.map((l) => measure(kind, l, size)));
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(' '), words.slice(i).join(' ')];
    const w = Math.max(...lines.map((l) => measure(kind, l, size)));
    if (w <= maxWidth && (best.length > 2 || w < bestWidth)) {
      best = lines;
      bestWidth = w;
    }
  }
  return best;
}

function wrapGreedy(kind, str, size, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of str.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(kind, next, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

// ---------- Open Graph card ----------
async function buildOg() {
  const W = 1200;
  const H = 630;
  const colX = 600;
  const colW = W - colX - 40;

  const eyebrow = `TI CORPORATIVA · ${site.address.city.toUpperCase()}`;
  const [first, ...rest] = site.name.split(' ');
  const tagline = wrap('body', site.tagline, 24, colW).slice(0, 3);
  const domain = site.url.replace(/^https?:\/\/(www\.)?/, '');

  // Decorative circuit traces flowing out of the mark toward the text column.
  const traces = [
    { y: 178, x1: 520, x2: 580, node: 580 },
    { y: 446, x1: 470, x2: 1128, node: 1128 },
  ]
    .map(
      (t) =>
        `<path d="M${t.x1} ${t.y} H${t.x2}" stroke="url(#trace)" stroke-width="1.5" fill="none"/><circle cx="${t.node}" cy="${t.y}" r="4" fill="${c.cyan}" filter="url(#soft)"/>`,
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glowCyan" cx="0.2" cy="0.45" r="0.55">
      <stop offset="0" stop-color="${c.cyan}" stop-opacity="0.28"/>
      <stop offset="1" stop-color="${c.cyan}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowMagenta" cx="0.9" cy="1" r="0.6">
      <stop offset="0" stop-color="${c.magenta}" stop-opacity="0.32"/>
      <stop offset="1" stop-color="${c.magenta}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowViolet" cx="0.55" cy="0.1" r="0.7">
      <stop offset="0" stop-color="${c.violet}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${c.violet}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0.3">
      <stop offset="0" stop-color="#7ee8ff"/>
      <stop offset="0.45" stop-color="#8fa2ff"/>
      <stop offset="1" stop-color="#e28bf0"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${c.cyan}"/>
      <stop offset="0.45" stop-color="${c.blue}"/>
      <stop offset="0.8" stop-color="${c.magenta}"/>
      <stop offset="1" stop-color="${c.pink}"/>
    </linearGradient>
    <linearGradient id="trace" gradientUnits="userSpaceOnUse" x1="470" y1="0" x2="1128" y2="0">
      <stop offset="0" stop-color="${c.cyan}" stop-opacity="0"/>
      <stop offset="0.3" stop-color="${c.cyan}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${c.magenta}" stop-opacity="0.55"/>
    </linearGradient>
    <radialGradient id="gridFade" cx="0.5" cy="0.5" r="0.7">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <mask id="gridMask"><rect width="${W}" height="${H}" fill="url(#gridFade)"/></mask>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="${c.line}" stroke-width="1"/>
    </pattern>
    <filter id="soft" x="-200%" y="-200%" width="500%" height="500%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#glowViolet)"/>
  <rect width="${W}" height="${H}" fill="url(#glowCyan)"/>
  <rect width="${W}" height="${H}" fill="url(#glowMagenta)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gridMask)"/>
  ${traces}

  ${text('display', eyebrow, { x: colX, y: 186, size: 15, fill: c.cyan, tracking: 3 })}
  ${text('heading', first, { x: colX - 4, y: 292, size: 104, fill: c.text, tracking: -2, embolden: 3 })}
  ${text('heading', rest.join(' '), { x: colX - 4, y: 402, size: 104, fill: 'url(#brand)', tracking: -2, embolden: 3 })}
  ${tagline.map((l, i) => text('body', l, { x: colX, y: 512 + i * 36, size: 24, fill: c.muted })).join('\n  ')}

  <rect x="0" y="${H - 4}" width="${W}" height="4" fill="url(#bar)" opacity="0.9"/>
  ${text('display', domain, { x: 72, y: H - 40, size: 13, fill: c.dim, tracking: 2 })}
</svg>`;

  const markHeight = 460;
  const mark = await sharp(LOGO).extract(MARK_BOX).resize({ height: markHeight }).png().toBuffer();

  await sharp(Buffer.from(svg))
    .composite([{ input: mark, left: 60, top: Math.round((H - markHeight) / 2) - 16 }])
    .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10, dither: 0.6 })
    .toFile(root('public/og.png'));
}

// ---------- Lightweight logo + touch icon ----------
async function buildLogoWebp() {
  await sharp(LOGO).extract(FULL_BOX).resize({ width: 600 }).webp({ quality: 88, alphaQuality: 90, effort: 6 }).toFile(root('public/logo-fortlink.webp'));
}

async function buildAppleTouchIcon() {
  const S = 180;
  const inner = 148;
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
    <defs><radialGradient id="g" cx="0.35" cy="0.35" r="0.8">
      <stop offset="0" stop-color="${c.violet}"/><stop offset="1" stop-color="${c.bg}"/>
    </radialGradient></defs>
    <rect width="${S}" height="${S}" fill="url(#g)"/>
  </svg>`;
  const mark = await sharp(LOGO).extract(MARK_BOX).resize({ width: inner, height: inner }).png().toBuffer();
  await sharp(Buffer.from(bg))
    .composite([{ input: mark, left: (S - inner) / 2, top: (S - inner) / 2 }])
    .flatten({ background: c.bg })
    .png({ compressionLevel: 9 })
    .toFile(root('public/apple-touch-icon.png'));
}

await Promise.all([buildOg(), buildLogoWebp(), buildAppleTouchIcon()]);
console.log('✓ public/og.png, public/logo-fortlink.webp, public/apple-touch-icon.png');
