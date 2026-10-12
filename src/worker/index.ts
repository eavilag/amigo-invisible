import { app } from './app';
import { withSecurityHeaders } from './security/headers';

/**
 * Punto de entrada del Worker (ADR-0003, ADR-0011).
 * Todas las peticiones pasan por aquí: `/api/*` va a Hono y el resto a los ficheros
 * estáticos (con fallback SPA), y TODAS las respuestas reciben las cabeceras de seguridad.
 */
export default {
  async fetch(request, env, ctx) {
    const { pathname, protocol } = new URL(request.url);
    const https = protocol === 'https:';
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return withSecurityHeaders(await app.fetch(request, env, ctx), { https, extra: { 'Cache-Control': 'no-store' } });
    }
    const response = await env.ASSETS.fetch(request);
    // Los ficheros de /assets llevan un hash en el nombre: pueden guardarse un año (RNF-06).
    const immutable: Record<string, string> =
      pathname.startsWith('/assets/') && response.ok ? { 'Cache-Control': 'public, max-age=31536000, immutable' } : {};
    return withSecurityHeaders(response, { https, extra: immutable });
  },
} satisfies ExportedHandler<Env>;
