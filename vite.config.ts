import { cloudflare } from '@cloudflare/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Un único build: SPA (dist/client) + Worker (ADR-0003, ADR-0004).
export default defineConfig({
  plugins: [react(), cloudflare()],
  environments: {
    // Safari iOS 15+ (RNF-05). El entorno del Worker usa el objetivo que fija el plugin.
    client: { build: { target: ['safari15', 'chrome100'], sourcemap: false } },
  },
});
