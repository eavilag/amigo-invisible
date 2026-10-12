# ADR-0003: Un único Worker para SPA y API en el mismo origen

**Estado:** Aceptado · **Fecha:** 2026-10-12 · **Decide:** Equipo · **Tipo:** Arquitectura · **Requisitos:** RNF-08, RNF-11

## Contexto
La SPA y la API podrían desplegarse por separado (p. ej. Pages + Worker) o juntas.

## Decisión
Un único Worker con *Static Assets*: `/api/*` lo atiende Hono; el resto se sirve desde los ficheros estáticos con *fallback* SPA a `index.html`. Todo en el mismo origen.

## Opciones consideradas
| | Worker único | Pages + Worker separados |
|---|---|---|
| Despliegue | 1 comando, 1 versión | 2 artefactos a sincronizar |
| CORS | Innecesario | Hay que configurarlo (superficie de ataque) |
| CSP | `connect-src 'self'` | Debe listar otro origen |

## Consecuencias
- Sin CORS: el navegador bloquea cualquier llamada desde otros orígenes.
- Cliente y servidor se versionan y despliegan juntos: no hay incompatibilidades de contrato en producción.
