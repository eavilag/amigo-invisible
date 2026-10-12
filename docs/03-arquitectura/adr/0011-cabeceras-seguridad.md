# ADR-0011: Cabeceras de seguridad aplicadas por el Worker

**Estado:** Aceptado · **Fecha:** 2026-10-12 · **Decide:** Equipo · **Tipo:** Seguridad · **Requisitos:** RNF-08, RNF-09, CA-01.7 · **Amenazas:** AME-08, AME-09, AME-10

## Contexto
Cloudflare permite un fichero `_headers` para estáticos, pero según su documentación no se aplica a respuestas generadas por el Worker, y no está garantizado para el *fallback* SPA.

## Decisión
`assets.run_worker_first = true`: **todas** las peticiones pasan por el Worker, que sirve los estáticos con `env.ASSETS.fetch()` y añade a todas las respuestas:

| Cabecera | Valor | Motivo |
|---|---|---|
| `Content-Security-Policy` | `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests` | XSS, inyección, *clickjacking* |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Solo HTTPS |
| `X-Content-Type-Options` | `nosniff` | Sniffing MIME |
| `Referrer-Policy` | `no-referrer` | No filtrar el enlace del grupo |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` | Mínimo privilegio |
| `Cross-Origin-Opener-Policy` | `same-origin` | Aislamiento |
| `Cross-Origin-Resource-Policy` | `same-origin` | Aislamiento |
| `X-Robots-Tag` | `noindex, nofollow` | No indexar grupos (RNF-09) |
| `Cache-Control` (API) | `no-store` | No cachear datos personales |

## Compromisos
- Cada petición de estáticos consume una invocación del Worker (100k/día gratis): irrelevante para el volumen esperado.
- CSP sin `'unsafe-inline'`: Vite genera CSS y JS como ficheros externos, y `index.html` no lleva estilos ni scripts en línea. La prop `style` de React se aplica mediante CSSOM (`element.style`), que `style-src` no bloquea; se usa solo para valores dinámicos (p. ej. el ancho de la barra de progreso).

## Consecuencias
- Una prueba E2E verifica las cabeceras en `/`, en una ruta SPA profunda, en un estático y en la API.
