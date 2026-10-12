# ADR-0013: Estrategia de pruebas y E2E en producción

**Estado:** Aceptado · **Fecha:** 2026-10-12 · **Decide:** Equipo · **Tipo:** Calidad · **Requisitos:** CONST §4 y §6, RNF-10

## Decisión
| Nivel | Herramienta | Qué cubre | Prefijo |
|---|---|---|---|
| Unitarias | Vitest | Sorteo, normalización, esquemas, utilidades | `CP-U` |
| Integración API | Vitest + `@cloudflare/vitest-pool-workers` (workerd + D1 reales en local) | Cada endpoint, autorización, concurrencia, errores | `CP-I` |
| Componentes | Vitest + Testing Library (jsdom) | Comportamiento de pantallas aisladas | `CP-C` |
| Extremo a extremo | Playwright (Chromium móvil Pixel 7 y WebKit iPhone 13) | Recorridos completos de usuario | `CP-E` |
| Accesibilidad | `@axe-core/playwright` + comprobaciones de tamaño | WCAG 2.2 AA, botones ≥ 56 px, 320 px, texto 200 % | `CP-A` |
| Producción | Playwright contra la URL pública tras desplegar | Humo: crear grupo, sortear, ver, borrar; cabeceras | `CP-P` |

- Cada prueba lleva en su título los IDs de requisito que verifica (`[RF-05][CA-05.2]`), lo que permite **generar la matriz de trazabilidad automáticamente** desde los informes.
- Las pruebas en producción crean un grupo de prueba y lo **borran al terminar**.

## Consecuencias
- Un script (`scripts/traceability.mjs`) cruza la especificación con los informes JSON de Vitest y Playwright y genera `docs/06-pruebas/matriz-trazabilidad.md`; falla si algún criterio de aceptación activo no tiene prueba.
