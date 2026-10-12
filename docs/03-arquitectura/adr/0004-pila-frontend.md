# ADR-0004: Frontend: React + Vite + TypeScript, fuentes autoalojadas

**Estado:** Aceptado · **Fecha:** 2026-10-12 · **Decide:** Equipo · **Tipo:** Arquitectura · **Requisitos:** RNF-04, RNF-05, RNF-06, RNF-10

## Contexto
SPA sencilla (6 pantallas), con presupuesto de JS < 120 KB comprimido, mantenible por cualquier desarrollador en el futuro.

## Decisión
- **React 19 + TypeScript estricto**, empaquetado con **Vite** (`@cloudflare/vite-plugin` para integrar el Worker en desarrollo y compilación).
- **wouter** como enrutador (≈ 2 KB) en lugar de React Router.
- CSS propio con *custom properties* (tokens de `UX` §4); sin framework CSS.
- Fuentes **Atkinson Hyperlegible** y **Lexend** autoalojadas con `@fontsource` (sin peticiones a Google: privacidad y CSP estricta).

## Opciones consideradas
| | React | Preact | Svelte | Vanilla |
|---|---|---|---|---|
| Tamaño | ~60 KB | ~10 KB | ~5 KB | 0 |
| Familiaridad / mantenimiento | Muy alta | Alta | Media | Baja a escala |
| Ecosistema de pruebas | Excelente | Bueno | Bueno | Manual |

## Compromisos
- React pesa más que Preact, pero cabe holgadamente en el presupuesto y maximiza la mantenibilidad.

## Consecuencias
- Todos los textos en `src/client/i18n/es.ts` (RNF-12).
- React escapa por defecto el contenido: nunca se usa `dangerouslySetInnerHTML` (regla de lint).
