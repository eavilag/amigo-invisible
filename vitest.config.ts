import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Proyectos de prueba (ADR-0013): unitarias (node), integración (workerd + D1) y componentes (jsdom).
export default defineConfig({
  test: {
    projects: [
      {
        test: { name: 'unit', include: ['tests/unit/**/*.test.ts'], environment: 'node' },
      },
      {
        plugins: [
          cloudflareTest(async () => ({
            wrangler: { configPath: './wrangler.jsonc' },
            miniflare: { bindings: { TEST_MIGRATIONS: await readD1Migrations('./migrations') } },
          })),
        ],
        test: {
          name: 'worker',
          include: ['tests/integration/**/*.test.ts'],
          setupFiles: ['tests/integration/apply-migrations.ts'],
        },
      },
      {
        plugins: [react()],
        test: { name: 'component', include: ['tests/component/**/*.test.tsx'], environment: 'jsdom' },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/shared/**', 'src/worker/domain/**'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
