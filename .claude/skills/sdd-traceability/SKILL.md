---
name: sdd-traceability
description: Maintain requirement-to-test-to-evidence traceability — tag every test title with requirement IDs, run the test suites with JSON reporters and regenerate the traceability matrix, failing if any active acceptance criterion lacks a passing test. Use after adding tests, before a release, and after production E2E runs.
---

# SDD · Trazabilidad requisito → prueba → evidencia

## Convención
- Título de cada prueba: `CP-<nivel>-NN [RF-05][CA-05.2] descripción`. Niveles: U unitaria, I integración, C componente, E extremo a extremo, A accesibilidad, P producción.
- Un CA puede cubrirse por varias pruebas; una prueba puede cubrir varios CA.
- Requisitos que se verifican por revisión (no automatizable) se listan en `docs/06-pruebas/verificacion-manual.md` con fecha y evidencia.

## Pasos
1. Ejecuta `npm run test:all` (genera `reports/*.json`).
2. Ejecuta `npm run traceability` (`scripts/traceability.mjs`):
   - Lee los IDs activos de `docs/01-especificacion/especificacion.md` (ignora los marcados "Eliminado").
   - Cruza con los títulos de pruebas y su resultado en los informes JSON.
   - Escribe `docs/06-pruebas/matriz-trazabilidad.md` (requisito → pruebas → resultado → informe).
   - Termina con código ≠ 0 si algún CA activo no tiene prueba que pase ni verificación manual.
3. Guarda los informes de la ejecución relevante en `docs/06-pruebas/evidencias/<fecha>-<entorno>/`.
