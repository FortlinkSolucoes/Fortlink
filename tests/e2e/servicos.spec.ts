import { test, expect, type Page } from '@playwright/test';

// Services page: pick a service from the list and read everything about it in one focused panel.

const trigger = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const panelOf = (page: Page, slug: string) => page.locator(`#painel-${slug}`);

test.describe('serviços — escolher e ler em foco', () => {
  test('abre com o primeiro serviço em foco e só um painel visível', async ({ page }) => {
    await page.goto('/servicos/');

    await expect(trigger(page, 'Consultoria em Planejamento e Processos')).toHaveAttribute('aria-expanded', 'true');
    await expect(panelOf(page, 'consultoria')).toBeVisible();
    await expect(page.locator('[data-svc-panel]:visible')).toHaveCount(1);
  });

  test('selecionar um serviço mostra resumo, dor, o que fazemos e o WhatsApp certo', async ({ page }) => {
    await page.goto('/servicos/');

    await trigger(page, 'CFTV e Segurança').click();

    const panel = panelOf(page, 'cftv');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Sistemas modernos de monitoramento');
    await expect(panel).toContainText('Não vejo o que acontece na empresa quando não estou lá.');
    await expect(panel.getByRole('listitem')).toHaveCount(4);
    await expect(panel.getByRole('link', { name: /Falar sobre CFTV e Segurança/ })).toHaveAttribute(
      'href',
      /wa\.me\/554574008279\?text=.*CFTV/,
    );
    await expect(panel.getByRole('link', { name: /formulário/ })).toHaveAttribute('href', '/contato/?servico=cftv');

    await expect(page.locator('[data-svc-panel]:visible')).toHaveCount(1);
    await expect(trigger(page, 'Consultoria em Planejamento e Processos')).toHaveAttribute('aria-expanded', 'false');
    await expect(page).toHaveURL(/#cftv$/);
  });

  test('link direto /servicos/#lgpd abre o serviço certo', async ({ page }) => {
    await page.goto('/servicos/#lgpd');

    await expect(trigger(page, 'Adequação à LGPD')).toHaveAttribute('aria-expanded', 'true');
    await expect(panelOf(page, 'lgpd')).toBeVisible();
    await expect(panelOf(page, 'lgpd')).toBeInViewport();
  });

  test('links antigos ?abrir= continuam funcionando', async ({ page }) => {
    await page.goto('/servicos/?abrir=noc');

    await expect(panelOf(page, 'noc')).toBeVisible();
  });

  test('slug inválido na URL cai no primeiro serviço', async ({ page }) => {
    await page.goto('/servicos/#nao-existe');

    await expect(panelOf(page, 'consultoria')).toBeVisible();
  });

  test('hash malformado não quebra a página', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/servicos/#50%');
    await trigger(page, 'Telefonia VoIP').click();

    await expect(panelOf(page, 'voip')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('preserva parâmetros de campanha na URL ao escolher', async ({ page }) => {
    await page.goto('/servicos/?utm_source=google&abrir=noc');
    await trigger(page, 'Site Survey Wi-Fi').click();

    await expect(page).toHaveURL(/\?utm_source=google#wifi$/);
  });

  test('o serviço aberto não recolhe e fica marcado como indisponível para clique', async ({ page }) => {
    await page.goto('/servicos/');
    await trigger(page, 'CFTV e Segurança').click();

    await expect(trigger(page, 'CFTV e Segurança')).toHaveAttribute('aria-disabled', 'true');
    await expect(trigger(page, 'Consultoria em Planejamento e Processos')).not.toHaveAttribute('aria-disabled', 'true');

    // Playwright won't click an aria-disabled control on its own; force it to prove the click is a no-op.
    await trigger(page, 'CFTV e Segurança').click({ force: true });
    await expect(panelOf(page, 'cftv')).toBeVisible();
  });

  test('link direto já pinta o serviço certo, sem piscar o primeiro', async ({ page }) => {
    await page.route('**/*.js', (route) => route.abort()); // only inline scripts run
    await page.goto('/servicos/#lgpd');

    await expect(panelOf(page, 'lgpd')).toBeVisible();
    await expect(panelOf(page, 'consultoria')).toBeHidden();
  });

  test('funciona pelo teclado', async ({ page }) => {
    await page.goto('/servicos/');

    await trigger(page, 'Consultoria em Planejamento e Processos').focus();
    await page.keyboard.press('ArrowDown');
    await expect(trigger(page, 'Infraestrutura de Redes')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(panelOf(page, 'redes')).toBeVisible();
  });

  test('não usa mais modal por cima da página', async ({ page }) => {
    await page.goto('/servicos/');

    await expect(page.locator('dialog')).toHaveCount(0);
  });

  test('diferenciais, como trabalhamos e diagnóstico continuam na página', async ({ page }) => {
    await page.goto('/servicos/');

    await expect(page.getByRole('heading', { name: /Por que trabalhar com a FortLink/ })).toBeAttached();
    await expect(page.getByRole('heading', { name: /Do diagnóstico ao/ })).toBeAttached();
    await expect(page.getByRole('heading', { name: /Seu diagnóstico de TI/ })).toBeAttached();
  });
});

test.describe('ordem: serviços antes de quem somos', () => {
  test('menu mostra Serviços antes de Quem somos', async ({ page, isMobile }) => {
    test.skip(isMobile, 'menu desktop');
    await page.goto('/');

    const labels = await page.getByRole('navigation', { name: 'Principal' }).getByRole('link').allInnerTexts();
    expect(labels.map((l) => l.trim())).toEqual(['Serviços', 'Quem somos', 'Contato']);
  });

  test('home apresenta o que oferecemos antes de quem somos', async ({ page }) => {
    await page.goto('/');

    const offer = page.locator('#o-que-oferecemos');
    await expect(offer.getByRole('heading', { level: 2 })).toBeAttached();
    await expect(offer.locator('a[href^="/servicos/#"]')).toHaveCount(11);

    const order = await page.evaluate(() => {
      const a = document.querySelector('#o-que-oferecemos');
      const b = document.querySelector('#quem-somos');
      return a && b ? a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING : 0;
    });
    expect(order).toBeTruthy();
  });
});

test.describe('home', () => {
  test('cada dor leva direto ao serviço em foco', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#problemas a[href="/servicos/#cftv"]')).toHaveCount(1);
  });

  test('tem um caminho claro para ver todos os serviços', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#problemas').getByRole('link', { name: /Ver todos os serviços/ })).toBeAttached();
  });
});
