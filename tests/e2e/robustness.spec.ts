import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { claimViaUi, createGroupViaUi, expect, newPhone, test } from './support';

test.describe('Errores, seguridad y rendimiento', () => {
  test('CP-E-14 [RF-20][CA-20.1] un enlace incompleto o una página inexistente muestran una salida clara', async ({ page }) => {
    await page.goto('/g/AAAAAAAAAAAAAAAAAAAAAA');
    await expect(page.getByRole('heading', { name: 'No encontramos este amigo invisible' })).toBeVisible();
    await expect(page.getByText('Revisa que el enlace esté completo').or(page.getByText('Pide a quien organiza'))).toBeVisible();
    await page.getByRole('link', { name: 'Ir al inicio' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Amigo Invisible' })).toBeVisible();

    await page.goto('/g/abc');
    await expect(page.getByRole('heading', { name: 'No encontramos este amigo invisible' })).toBeVisible();
    await page.goto('/esto/no/existe');
    await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible();
  });

  test('CP-E-15 [RF-20][CA-20.2] sin conexión se explica y se puede reintentar', async ({ page, context }) => {
    await createGroupViaUi(page, 'Sin red', ['Carmen', 'Paco', 'Rosa']);
    await page.goto('/');
    // Con la aplicación ya cargada se pierde la conexión y se navega dentro de ella.
    await context.setOffline(true);
    await page.getByRole('link', { name: /Sin red/ }).click();
    await expect(page.getByRole('heading', { name: 'No hay conexión a Internet' })).toBeVisible();
    await context.setOffline(false);
    await page.getByRole('button', { name: 'Reintentar' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Sin red' })).toBeVisible();
  });

  test('CP-E-16 [RF-01][CA-01.7][AME-08] un nombre con HTML se muestra como texto y no se ejecuta', async ({ page, browser }) => {
    let alerted = false;
    page.on('dialog', async (d) => {
      alerted = true;
      await d.dismiss();
    });
    const evil = '<img src=x onerror=alert(1)>';
    const { groupUrl } = await createGroupViaUi(page, '<b>Grupo</b>', [evil, 'Paco', 'Rosa']);
    await expect(page.getByRole('heading', { level: 1, name: '<b>Grupo</b>' })).toBeVisible();
    const { context, phone } = await newPhone(browser, page);
    phone.on('dialog', async (d) => {
      alerted = true;
      await d.dismiss();
    });
    await phone.goto(groupUrl);
    await expect(phone.getByRole('button', { name: evil, exact: true })).toBeVisible();
    expect(await phone.locator('img[src="x"]').count()).toBe(0);
    expect(alerted).toBe(false);
    await context.close();
  });

  test('CP-E-17 [RNF-08][RNF-09][ADR-0011][CA-03.3][AME-09][AME-10] cabeceras de seguridad en todas las respuestas y vista previa genérica', async ({
    request,
    page,
  }) => {
    for (const path of ['/', '/g/AAAAAAAAAAAAAAAAAAAAAA', '/favicon.svg', '/api/health']) {
      const res = await request.get(path);
      const h = res.headers();
      expect(h['content-security-policy'], path).toContain("script-src 'self'");
      expect(h['content-security-policy'], path).toContain("frame-ancestors 'none'");
      // HSTS y upgrade-insecure-requests solo se envían por HTTPS (se verifican en producción, CP-P-01).
      if (res.url().startsWith('https:')) expect(h['strict-transport-security'], path).toContain('max-age=');
      expect(h['x-content-type-options'], path).toBe('nosniff');
      expect(h['referrer-policy'], path).toBe('no-referrer');
      expect(h['x-robots-tag'], path).toBe('noindex, nofollow');
    }
    const html = await (await request.get('/g/AAAAAAAAAAAAAAAAAAAAAA')).text();
    expect(html).toContain('<meta property="og:title" content="Amigo Invisible"');
    expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');

    // La CSP no bloquea nada de la propia aplicación.
    const violations: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error' && /Content Security Policy|CSP/i.test(m.text())) violations.push(m.text());
    });
    await page.goto('/nuevo');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(violations).toEqual([]);
  });

  test('CP-E-18 [RNF-06] el JavaScript inicial pesa menos de 120 KB comprimido', async ({}, testInfo) => {
    testInfo.skip(testInfo.project.name !== 'android-chrome', 'Basta con medirlo una vez');
    const dir = join(process.cwd(), 'dist/client/assets');
    const total = readdirSync(dir)
      .filter((f) => f.endsWith('.js'))
      .reduce((sum, f) => sum + gzipSync(readFileSync(join(dir, f))).length, 0);
    expect(total).toBeLessThan(120 * 1024);
  });

  test('CP-E-19 [RF-07][CA-07.5] un móvil que ya eligió nombre no vuelve a ver la lista', async ({ page, browser }) => {
    const { groupUrl } = await createGroupViaUi(page, 'Un nombre', ['Carmen', 'Paco', 'Rosa']);
    const { context, phone } = await newPhone(browser, page);
    await claimViaUi(phone, groupUrl, 'Carmen');
    await phone.goto(groupUrl);
    await expect(phone.getByRole('heading', { level: 1, name: 'Hola, Carmen' })).toBeVisible();
    await expect(phone.getByRole('button', { name: 'Paco', exact: true })).toHaveCount(0);
    await context.close();
  });
});
