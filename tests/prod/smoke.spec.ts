import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Pruebas de humo en producción. Crean un grupo de prueba y lo BORRAN al terminar.
 * No usan cabeceras especiales: van por Cloudflare como un usuario real.
 */
test.describe('Producción', () => {
  test('CP-P-01 [RNF-08][RNF-09][ADR-0011][AME-09][AME-10] HTTPS con HSTS y cabeceras de seguridad en página, ruta SPA, estáticos y API', async ({
    request,
    baseURL,
  }) => {
    expect(baseURL!.startsWith('https://')).toBe(true);
    for (const path of ['/', '/g/AAAAAAAAAAAAAAAAAAAAAA', '/favicon.svg', '/api/health']) {
      const res = await request.get(path);
      const h = res.headers();
      expect(res.ok() || res.status() === 404, path).toBe(true);
      expect(h['strict-transport-security'], path).toContain('max-age=63072000');
      expect(h['content-security-policy'], path).toContain('upgrade-insecure-requests');
      expect(h['content-security-policy'], path).toContain("frame-ancestors 'none'");
      expect(h['x-content-type-options'], path).toBe('nosniff');
      expect(h['referrer-policy'], path).toBe('no-referrer');
      expect(h['x-robots-tag'], path).toBe('noindex, nofollow');
    }
    expect(await (await request.get('/api/health')).json()).toEqual({ ok: true });
    expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');
  });

  test('CP-P-02 [RF-01][RF-03][RF-05][RF-07][RF-09][RF-10][RF-11][RF-16][RNF-03][RNF-07] recorrido completo real: crear, sortear, elegir nombre, ver resultado y borrar', async ({
    page,
    browser,
  }) => {
    const name = `Prueba automática ${new Date().toISOString().slice(0, 16)}`;
    let cleanup: (() => Promise<void>) | undefined;
    try {
      await page.goto('/nuevo');
      await page.getByLabel('Nombre del grupo').fill(name);
      for (const person of ['Ana', 'Luis', 'Eva']) {
        await page.getByRole('textbox', { name: 'Nombre de la persona', exact: true }).fill(person);
        await page.getByRole('button', { name: 'Añadir' }).click();
      }
      await page.getByRole('button', { name: 'Crear', exact: true }).click();
      await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
      const gid = new URL(page.url()).pathname.split('/')[2]!;
      cleanup = async () => {
        const key = await page.evaluate((id) => JSON.parse(localStorage.getItem('amigo-invisible:v1') ?? '{}')[id]?.adminKey, gid);
        if (key) await page.request.delete(`/api/groups/${gid}/admin`, { headers: { Authorization: `Bearer ${key}` } });
      };

      await page.getByRole('button', { name: 'Hacer el sorteo' }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Sí, hacer el sorteo' }).click();
      await expect(page.getByText('✓ Sorteo hecho.')).toBeVisible();

      const ctx = await browser.newContext({ viewport: page.viewportSize()!, isMobile: true, hasTouch: true, locale: 'es-ES' });
      const phone = await ctx.newPage();
      await phone.goto(`/g/${gid}`);
      await phone.getByRole('button', { name: 'Eva', exact: true }).click();
      await phone.getByRole('dialog').getByRole('button', { name: 'Sí, soy Eva' }).click();
      await phone.getByRole('link', { name: '🎁 Ver a quién regalo' }).click();
      await expect(phone.getByTestId('receiver-name')).toHaveText(/Ana|Luis/);
      await phone.getByRole('link', { name: '‹ Volver' }).click();
      await phone.getByRole('link', { name: 'Escribir mis ideas' }).click();
      await phone.getByLabel('¿Qué te gustaría?').fill('Un libro');
      await phone.getByRole('button', { name: 'Guardar' }).click();
      await expect(phone.getByText('Un libro')).toBeVisible();

      await page.reload();
      await expect(page.getByText('1 de 3 ya saben a quién regalan.')).toBeVisible();
      await page.getByText('Más opciones').click();
      await page.getByRole('button', { name: 'Borrar este amigo invisible' }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Sí, borrar' }).click();
      await expect(page.getByRole('heading', { level: 1, name: 'Amigo Invisible' })).toBeVisible();
      cleanup = undefined;

      await phone.reload();
      await expect(phone.getByRole('heading', { name: 'No encontramos este amigo invisible' })).toBeVisible();
      await ctx.close();
    } finally {
      await cleanup?.();
    }
  });

  test('CP-P-03 [RNF-01][RNF-06] la portada carga rápido y cumple WCAG 2.2 AA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Crear amigo invisible' })).toBeVisible();
    const loadMs = await page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return nav ? nav.loadEventEnd - nav.startTime : 0;
    });
    expect(loadMs).toBeLessThan(2500);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
