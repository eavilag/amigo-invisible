# ADR-0002: Plataforma: Cloudflare Workers + D1

**Estado:** Aceptado · **Fecha:** 2026-10-11 · **Decide:** Propietario · **Tipo:** Arquitectura · **Requisitos:** RNF-06, RNF-07, RNF-11

## Contexto
Se necesita publicar en Internet una web con API y base de datos, gratis, sin mantenimiento, con respuesta inmediata (los mayores abandonan si la página tarda) y con protección frente a abusos.

## Decisión
Cloudflare Workers (cómputo + ficheros estáticos) y Cloudflare D1 (SQLite gestionado), en el plan gratuito, con subdominio `*.workers.dev`.

## Opciones consideradas
| | Cloudflare Workers + D1 | Vercel + Neon | Render |
|---|---|---|---|
| Coste | 0 € (100k peticiones/día, 5 GB D1) | 0 € | 0 € |
| Arranque en frío | No (isolates, ~0 ms) | Neon se suspende (~1 s) | Se duerme (~50 s) |
| Servicios/cuentas | 1 | 2 | 1 |
| Caducidad datos gratis | No | No | BD gratis caduca a 30 días |
| Anti-DDoS / TLS | Incluido | Incluido | Incluido |
| Portabilidad | Media (APIs Workers) | Alta | Alta |

## Compromisos
- Se acepta cierta dependencia de Cloudflare (bindings D1, Rate Limiting). Se mitiga aislando el acceso a datos en `db/repo.ts` y la lógica de dominio en módulos puros.
- Límites del plan gratuito muy por encima del uso esperado (un grupo familiar genera decenas de peticiones).

## Consecuencias
- El propietario necesita una cuenta gratuita de Cloudflare (puerta P3).
- Despliegue con `wrangler` desde GitHub Actions.
