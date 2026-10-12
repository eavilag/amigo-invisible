import { defineConfig, devices } from '@playwright/test';

/** Pruebas de humo contra producción tras cada despliegue (ADR-0013, CONST §6). */
const baseURL = process.env.PROD_URL;
if (!baseURL) throw new Error('Define PROD_URL con la dirección pública, p. ej. https://amigo-invisible.<cuenta>.workers.dev');

export default defineConfig({
  testDir: 'tests/prod',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 60_000,
  reporter: [
    ['list'],
    ['json', { outputFile: 'reports/playwright-prod.json' }],
    ['html', { open: 'never', outputFolder: 'playwright-report-prod' }],
  ],
  use: { baseURL, locale: 'es-ES', timezoneId: 'Europe/Madrid', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'android-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'iphone-safari', use: { ...devices['iPhone 13'] } },
  ],
});
