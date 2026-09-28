import { test, expect } from '@playwright/test';

// Mobile: no page may scroll sideways, on the phone widths people actually use.
const PAGES = ['/', '/servicos/', '/servicos/#consultoria', '/contato/', '/nao-existe'];
const WIDTHS = [360, 390, 414];

test.describe('responsivo — sem rolagem lateral no celular', () => {
  test.skip(({ isMobile }) => !isMobile, 'roda só no projeto mobile');

  for (const width of WIDTHS) {
    for (const path of PAGES) {
      test(`${path} em ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);
      });
    }
  }
});
