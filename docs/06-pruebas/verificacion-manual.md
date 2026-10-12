| ID | Versión | Estado | Fecha |
|---|---|---|---|
| PRU-MAN | 1.0.0 | Vigente | 2026-10-12 |

# Verificación por revisión

Requisitos que no se pueden demostrar con una prueba automática y se verifican por revisión documentada. El script de trazabilidad lee la primera columna de esta tabla.

| Requisito | Verificación | Evidencia |
|---|---|---|
| RNF-05 | Compatibilidad: la batería E2E completa se ejecuta en Chromium (Pixel 7, Android) y WebKit (iPhone 13, motor de Safari iOS); objetivo de compilación `safari15`/`chrome100` | `playwright.config.ts`, `vite.config.ts`; prueba manual en móvil real en la puerta P4 |
| RNF-07 | Disponibilidad: Cloudflare Workers no tiene arranque en frío ni suspensión por inactividad; SLA de la plataforma | ADR-0002 |
| RNF-10 | Mantenibilidad: TypeScript estricto, ESLint sin avisos, cobertura ≥ 90 % del dominio (umbral en `vitest.config.ts`), CI en cada cambio | `.github/workflows/ci.yml`, `vitest.config.ts` |
| RNF-11 | Coste 0 €: plan gratuito de Workers (100.000 peticiones/día) y D1 (5 GB); despliegue automático desde CI | ADR-0002, ADR-0014 |
| RNF-12 | Idioma: todos los textos visibles están en `src/client/i18n/es.ts`; revisión de lenguaje llano con la guía `elderly-friendly-ux` | `src/client/i18n/es.ts` |
| RNF-13 | Observabilidad: el único registro (`app.onError`) escribe método, ruta, nombre y mensaje del error, sin cuerpos, cabeceras ni nombres | `src/worker/app.ts` |
