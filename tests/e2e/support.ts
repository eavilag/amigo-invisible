import { type Browser, type BrowserContext, type Page, expect, test as base } from '@playwright/test';

/**
 * Cada prueba usa una "IP" distinta para no activar los límites de peticiones (ADR-0012).
 * En local, workerd acepta la cabecera CF-Connecting-IP; en producción la fija Cloudflare.
 */
export const test = base.extend({
  extraHTTPHeaders: async ({}, use, testInfo) => {
    await use({ 'CF-Connecting-IP': `e2e-${testInfo.project.name}-${testInfo.testId}-${testInfo.retry}` });
  },
});
export { expect };

export interface CreatedGroup {
  gid: string;
  groupUrl: string;
}

/** Crea un grupo desde la interfaz como lo haría el organizador (RF-01). */
export async function createGroupViaUi(
  page: Page,
  name: string,
  people: string[],
  options: { budget?: string; date?: string } = {},
): Promise<CreatedGroup> {
  await page.goto('/');
  await page.getByRole('link', { name: 'Crear amigo invisible' }).click();
  await page.getByLabel('Nombre del grupo').fill(name);
  if (options.date) await page.getByLabel(/Fecha de entrega/).fill(options.date);
  if (options.budget) await page.getByLabel(/Presupuesto/).fill(options.budget);
  for (const person of people) {
    await page.getByRole('textbox', { name: 'Nombre de la persona', exact: true }).fill(person);
    await page.getByRole('button', { name: 'Añadir' }).click();
  }
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  const gid = new URL(page.url()).pathname.split('/')[2]!;
  return { gid, groupUrl: `/g/${gid}` };
}

/** Hace el sorteo desde el panel del organizador (RF-05). */
export async function drawViaUi(page: Page) {
  await page.getByRole('button', { name: 'Hacer el sorteo' }).click();
  await page.getByRole('dialog', { name: '¿Hacer el sorteo ahora?' }).getByRole('button', { name: 'Sí, hacer el sorteo' }).click();
  await expect(page.getByText('✓ Sorteo hecho.')).toBeVisible();
}

/** Abre un móvil nuevo (contexto aislado, como otra persona con su propio teléfono). */
export async function newPhone(browser: Browser, page: Page): Promise<{ context: BrowserContext; phone: Page }> {
  const context = await browser.newContext({
    ...pageContextOptions(page),
    extraHTTPHeaders: { 'CF-Connecting-IP': `e2e-phone-${Math.random().toString(36).slice(2)}` },
  });
  return { context, phone: await context.newPage() };
}

function pageContextOptions(page: Page) {
  const viewport = page.viewportSize() ?? { width: 390, height: 844 };
  return { viewport, locale: 'es-ES', timezoneId: 'Europe/Madrid', isMobile: true, hasTouch: true };
}

/** El participante abre el enlace, toca su nombre y confirma (RF-07). Devuelve el nº de toques. */
export async function claimViaUi(phone: Page, groupUrl: string, name: string): Promise<number> {
  await phone.goto(groupUrl);
  await phone.getByRole('button', { name, exact: true }).click();
  await phone
    .getByRole('dialog', { name: `¿Eres ${name}?` })
    .getByRole('button', { name: `Sí, soy ${name}` })
    .click();
  await expect(phone.getByRole('heading', { level: 1, name: `Hola, ${name}` })).toBeVisible();
  return 2;
}
