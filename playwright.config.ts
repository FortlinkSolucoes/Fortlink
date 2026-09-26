import { defineConfig, devices } from '@playwright/test';

// E2E against the production build (astro preview) — what actually ships.
// Uses the system Edge locally; CI installs Chromium via `npx playwright install chromium`.
const channel = process.env.CI ? undefined : 'msedge';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4400',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel, viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel } },
  ],
  webServer: {
    command: 'npx astro preview --port 4400',
    url: 'http://localhost:4400',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
