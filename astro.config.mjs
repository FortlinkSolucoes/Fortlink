// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.fortlinksolucoes.com.br',
  integrations: [sitemap()],
  build: { format: 'directory' },
  prefetch: { prefetchAll: true },
});
