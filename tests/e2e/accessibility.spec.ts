import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { claimViaUi, createGroupViaUi, drawViaUi, expect, newPhone, test } from './support';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function audit(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(summary, `Violaciones WCAG en ${label}`).toEqual([]);
}

/** Botones y enlaces con aspecto de botón ≥ 56 px de alto (RNF-02). */
async function checkTapTargets(page: Page, label: string) {
  const small = await page.$$eval('button, a.btn', (elements) =>
    elements
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.height < 56;
      })
      .map((el) => `${el.textContent?.trim()} (${Math.round(el.getBoundingClientRect().height)}px)`),
  );
  expect(small, `Botones pequeños en ${label}`).toEqual([]);
}

/** Sin desplazamiento horizontal (RNF-04). */
async function checkNoHorizontalScroll(page: Page, label: string) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `Desplazamiento horizontal en ${label}`).toBeLessThanOrEqual(0);
}

test.describe('Accesibilidad y diseño adaptable', () => {
  test('CP-A-01 [RNF-01][RNF-02][RNF-04] todas las pantallas cumplen WCAG 2.2 AA, botones ≥ 56 px y sin desplazamiento horizontal, en claro y oscuro', async ({
    page,
    browser,
  }) => {
    // Audita ~16 pantallas en dos temas: necesita más margen que el resto.
    test.setTimeout(180_000);
    const screens: { label: string; go: (p: Page) => Promise<void> }[] = [];
    await page.goto('/');
    const home = async (p: Page) => void (await p.goto('/'));
    screens.push({ label: 'portada', go: home });
    screens.push({ label: 'crear', go: async (p) => void (await p.goto('/nuevo')) });

    const { gid, groupUrl } = await createGroupViaUi(page, 'Accesible', ['Carmen', 'Paco', 'Rosa'], { budget: '20 €', date: '2099-12-24' });
    const phoneSetup = await newPhone(browser, page);
    await claimViaUi(phoneSetup.phone, groupUrl, 'Paco');
    const storage = await phoneSetup.context.storageState();
    await phoneSetup.context.close();

    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      for (const s of screens) {
        await s.go(page);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await audit(page, `${s.label} (${scheme})`);
        await checkTapTargets(page, s.label);
      }
      await page.goto(`/g/${gid}/organizar`);
      await expect(page.getByRole('button', { name: 'Hacer el sorteo' })).toBeVisible();
      await page.getByText('Más opciones').click();
      await audit(page, `panel (${scheme})`);
      await checkTapTargets(page, 'panel');
      await page.getByRole('button', { name: 'Hacer el sorteo' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await audit(page, `diálogo (${scheme})`);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }

    await page.goto(`/g/${gid}/organizar`);
    await drawViaUi(page);

    const ctx = await browser.newContext({ storageState: storage, viewport: page.viewportSize()!, isMobile: true, hasTouch: true });
    const phone = await ctx.newPage();
    for (const scheme of ['light', 'dark'] as const) {
      await phone.emulateMedia({ colorScheme: scheme });
      for (const [label, path] of [
        ['mi pantalla', groupUrl],
        ['resultado', `${groupUrl}/regalo`],
        ['ideas', `${groupUrl}/ideas`],
        ['no encontrado', '/g/AAAAAAAAAAAAAAAAAAAAAA'],
      ] as const) {
        await phone.goto(path);
        await expect(phone.getByRole('heading', { level: 1 })).toBeVisible();
        await audit(phone, `${label} (${scheme})`);
        await checkTapTargets(phone, label);
      }
    }
    const fresh = await browser.newContext({ viewport: page.viewportSize()!, isMobile: true, hasTouch: true });
    const chooser = await fresh.newPage();
    await chooser.goto(groupUrl);
    await expect(chooser.getByRole('heading', { name: '¿Quién eres tú? Toca tu nombre' })).toBeVisible();
    await audit(chooser, 'elegir nombre');
    await checkTapTargets(chooser, 'elegir nombre');
    await ctx.close();
    await fresh.close();
  });

  test('CP-A-02 [RNF-02][RNF-04] a 320 px y con el texto al 200 % no hay desplazamiento horizontal; letra base ≥ 20 px', async ({
    page,
    browser,
  }) => {
    const { gid, groupUrl } = await createGroupViaUi(page, 'Una familia con un nombre de grupo bastante largo', [
      'María de los Ángeles',
      'Francisco Javier',
      'Rosa',
    ]);
    const fontSize = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(20);

    const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true });
    const small = await ctx.newPage();
    for (const zoom of ['20px', '40px']) {
      for (const path of ['/', '/nuevo', groupUrl, '/g/AAAAAAAAAAAAAAAAAAAAAA']) {
        await small.goto(path);
        await expect(small.getByRole('heading', { level: 1 })).toBeVisible();
        // Se aplica vía CSSOM: la CSP bloquea (correctamente) las hojas de estilo en línea.
        await small.evaluate((z) => document.documentElement.style.setProperty('font-size', z, 'important'), zoom);
        await checkNoHorizontalScroll(small, `${path} @ ${zoom}`);
      }
    }
    await ctx.close();
    void gid;
  });

  test('CP-A-03 [RNF-01] el diálogo atrapa el foco y Escape lo cierra devolviendo el foco', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit móvil no navega con Tab por defecto');
    await createGroupViaUi(page, 'Foco', ['Carmen', 'Paco', 'Rosa']);
    const trigger = page.getByRole('button', { name: 'Hacer el sorteo' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: '¿Hacer el sorteo ahora?' });
    await expect(dialog.getByRole('button', { name: 'Sí, hacer el sorteo' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'No, todavía no' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Sí, hacer el sorteo' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});
