# ADR-0005: Backend: Hono + esquemas zod compartidos

**Estado:** Aceptado · **Fecha:** 2026-10-12 · **Decide:** Equipo · **Tipo:** Arquitectura · **Requisitos:** RNF-08, RNF-10, CA-01.1–7

## Contexto
API REST pequeña sobre Workers con validación estricta de entrada y un contrato compartido con el cliente.

## Decisión
- **Hono** como enrutador HTTP (nativo de Workers, sin dependencias, ~14 KB).
- **zod** para validar toda entrada; los esquemas viven en `src/shared/schemas.ts` y los usan cliente y servidor (misma regla, mismo mensaje).
- SQL escrito a mano, siempre con parámetros enlazados (`prepare().bind()`), concentrado en `db/repo.ts`. Sin ORM.

## Opciones consideradas
| | Hono + SQL | itty-router | Hono + Drizzle ORM |
|---|---|---|---|
| Simplicidad | Alta | Alta | Media |
| Middlewares (cabeceras, errores) | Sí | Pocos | Sí |
| Riesgo de inyección SQL | Nulo con `bind` | Nulo con `bind` | Nulo |

## Consecuencias
- Dos tablas y una docena de consultas no justifican un ORM.
- Las migraciones son SQL versionado en `migrations/` aplicado con `wrangler d1 migrations apply`.
