#!/usr/bin/env node
/**
 * Genera las capturas de la guía de usuario (docs/08-guia-usuario/img) recorriendo la
 * aplicación como lo haría una familia. Requiere el servidor local: `npm run preview:local`.
 * Uso: node scripts/capture-guide.mjs [http://localhost:4173]
 */
import { mkdirSync } from 'node:fs';
import { chromium, devices } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const OUT = 'docs/08-guia-usuario/img';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const phone = { ...devices['Pixel 7'], locale: 'es-ES', timezoneId: 'Europe/Madrid', baseURL: BASE };
/** Espera a las fuentes y a que terminen las animaciones antes de capturar. */
async function shot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

// Organizadora
const org = await (await browser.newContext({ ...phone, extraHTTPHeaders: { 'CF-Connecting-IP': 'guia-org' } })).newPage();
await org.goto('/');
await shot(org, '01-portada');
await org.getByRole('link', { name: 'Crear amigo invisible' }).click();
await org.getByLabel('Nombre del grupo').fill('Navidad Familia 2027');
await org.getByLabel(/Fecha de entrega/).fill('2027-12-24');
await org.getByLabel(/Presupuesto/).fill('20 €');
for (const person of ['Carmen', 'Abuelo Paco', 'Abuela Rosa', 'Lucía']) {
  await org.getByRole('textbox', { name: 'Nombre de la persona', exact: true }).fill(person);
  await org.getByRole('button', { name: 'Añadir' }).click();
}
await shot(org, '02-crear');
await org.getByRole('button', { name: 'Crear', exact: true }).click();
await org.getByRole('heading', { level: 1, name: 'Navidad Familia 2027' }).waitFor();
await org.waitForTimeout(5500); // deja que desaparezca el aviso
await shot(org, '03-panel-enviar');
const groupUrl = new URL(org.url()).pathname.replace('/organizar', '');

// Abuelo Paco entra antes del sorteo
const paco = await (await browser.newContext({ ...phone, extraHTTPHeaders: { 'CF-Connecting-IP': 'guia-paco' } })).newPage();
await paco.goto(groupUrl);
await shot(paco, '04-quien-eres');
await paco.getByRole('button', { name: 'Abuelo Paco', exact: true }).click();
await paco.getByRole('dialog').waitFor();
await shot(paco, '05-eres-tu');
await paco.getByRole('button', { name: 'Sí, soy Abuelo Paco' }).click();
await paco.getByRole('heading', { name: 'Hola, Abuelo Paco' }).waitFor();
await shot(paco, '06-sin-sorteo');
await paco.getByRole('link', { name: 'Escribir mis ideas' }).click();
await paco.getByLabel('¿Qué te gustaría?').fill('Un libro de historia de España.\nUnas zapatillas de casa (talla 43).');
await shot(paco, '07-mis-ideas');
await paco.getByRole('button', { name: 'Guardar' }).click();

// Abuela Rosa escribe sus ideas
const rosa = await (await browser.newContext({ ...phone, extraHTTPHeaders: { 'CF-Connecting-IP': 'guia-rosa' } })).newPage();
await rosa.goto(groupUrl);
await rosa.getByRole('button', { name: 'Abuela Rosa', exact: true }).click();
await rosa.getByRole('button', { name: 'Sí, soy Abuela Rosa' }).click();
await rosa.getByRole('link', { name: 'Escribir mis ideas' }).click();
await rosa.getByLabel('¿Qué te gustaría?').fill('Un libro de crucigramas con letra grande.\nUna bufanda azul.');
await rosa.getByRole('button', { name: 'Guardar' }).click();

// Sorteo
await org.reload();
await org.getByRole('button', { name: 'Hacer el sorteo' }).click();
await org.getByRole('dialog').waitFor();
await shot(org, '08-confirmar-sorteo');
await org.getByRole('button', { name: 'Sí, hacer el sorteo' }).click();
await org.getByText('✓ Sorteo hecho.').waitFor();

// Paco ve a quién regala
await paco.goto(groupUrl);
await paco.getByRole('heading', { name: 'Hola, Abuelo Paco' }).waitFor();
await shot(paco, '09-ver-a-quien');
await paco.getByRole('link', { name: '🎁 Ver a quién regalo' }).click();
await paco.getByTestId('receiver-name').waitFor();
await shot(paco, '10-resultado');

// Seguimiento
await org.reload();
await org.getByRole('heading', { name: '¿Quién lo ha visto ya?' }).scrollIntoViewIfNeeded();
await shot(org, '11-seguimiento');

// Nombre ocupado visto desde otro móvil
const otro = await (await browser.newContext({ ...phone, extraHTTPHeaders: { 'CF-Connecting-IP': 'guia-otro' } })).newPage();
await otro.goto(groupUrl);
await otro.getByRole('button', { name: /Abuelo Paco/ }).click();
await otro.getByRole('dialog').waitFor();
await shot(otro, '12-ya-ha-entrado');

await browser.close();
console.log(`Capturas guardadas en ${OUT}`);
