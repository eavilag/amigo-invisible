| ID | Versión | Estado | Fecha |
|---|---|---|---|
| PLAN | 1.2.0 | Completado (pendientes puertas P2 y P4) | 2026-10-12 |

# Plan técnico y tareas

## 1. Pila y versiones
| Pieza | Versión | ADR |
|---|---|---|
| Node.js (desarrollo y CI) | 24 LTS | — |
| TypeScript | 6.0 (estricto) | 0004 |
| Vite + `@cloudflare/vite-plugin` | 8.x + 1.x | 0004 |
| React + wouter | 19.x + 3.x | 0004 |
| Hono + zod | 4.x + 4.x | 0005 |
| Wrangler | 4.x | 0002 |
| Vitest + `@cloudflare/vitest-pool-workers` | 4.1.x + 0.23.x | 0013 |
| Playwright + axe-core | 1.6x + 4.x | 0013 |
| ESLint + typescript-eslint + Prettier | 10 + 8 + 3 | 0004 |

## 2. Estrategia de implementación
Desarrollo guiado por pruebas, de dentro afuera: dominio puro → API con pruebas de integración → interfaz → E2E → despliegue. Cada tarea termina con sus pruebas en verde y los IDs de requisito en el título de cada prueba (ADR-0013).

## 3. Tareas

| ID | Tarea | Requisitos | Pruebas | Estado |
|---|---|---|---|---|
| T-01 | Andamiaje: Vite + Worker + TS estricto + lint + Prettier + scripts npm | RNF-10 | CI | ✅ |
| T-02 | `shared/`: límites, normalización de nombres, esquemas zod, códigos de error | RF-01, RF-04, RF-10, CA-01.2–7 | CP-U | ✅ |
| T-03 | `domain/draw.ts`: sorteo en círculo único criptográfico | RF-05, CA-05.1–2 | CP-U (propiedades + uniformidad) | ✅ |
| T-04 | Migración D1 inicial + `db/repo.ts` | ARQ §4 | CP-I | ✅ |
| T-05 | Seguridad: generación y hash de secretos, autenticación, cabeceras, límites, tamaño de cuerpo, errores | RNF-08, RNF-13, AME-02–05, 08–12, 16 | CP-I, CP-E | ✅ |
| T-06 | API pública: crear, ver grupo, elegir nombre | RF-01, RF-02, RF-07, CA-07.3–5 | CP-I | ✅ |
| T-07 | API participante: me, reveal, wishlist, "no soy yo" | RF-08–11, RF-15, CA-09.3 | CP-I | ✅ |
| T-08 | API organizador: panel, cambiar, sortear, repetir, deshacer, liberar, borrar | RF-04–06, RF-12, RF-14, RF-16, CA-05.5 | CP-I | ✅ |
| T-09 | Cliente base: tokens de diseño, fuentes, componentes accesibles, textos, cliente API, almacenamiento seguro | RNF-01–04, RNF-12, RF-20 | CP-C, CP-A | ✅ |
| T-10 | Pantallas: portada y mis grupos; crear y editar | RF-01, RF-02, RF-04, RF-18, CA-01.8 | CP-E | ✅ |
| T-11 | Panel del organizador y WhatsApp | RF-03, RF-05, RF-06, RF-12–14, RF-16 | CP-E | ✅ |
| T-12 | Pantallas del participante | RF-07–11, RF-15 | CP-E | ✅ |
| T-13 | Errores y estados vacíos | RF-20 | CP-E | ✅ |
| T-14 | E2E completos + accesibilidad + tamaños (320 px, texto 200 %) en Chromium y WebKit | RNF-01–05, RNF-14 | CP-E, CP-A | ✅ |
| T-15 | Script de trazabilidad automática | CONST §4 | — | ✅ |
| T-16 | CI/CD GitHub Actions + Dependabot | RNF-10, RNF-11, AME-13 | — | ✅ |
| T-17 | Despliegue en Cloudflare (Puerta P3) + pruebas en producción | RNF-06, RNF-07 | CP-P | ✅ |
| T-18 | Documentación final: guía de usuario con capturas, mantenimiento, runbook | — | — | ✅ |

## Historial
| Versión | Fecha | Cambio |
|---|---|---|
| 1.0.0 | 2026-10-12 | Plan inicial |
| 1.1.0 | 2026-10-12 | T-01 a T-16 completadas (rama `feat/implementacion-v1`); pendientes T-17 despliegue y T-18 documentación final |
| 1.2.0 | 2026-10-12 | T-17 desplegado en Cloudflare con CI/CD y pruebas de producción; T-18 guía con capturas, despliegue, runbook, mantenimiento y plan de pruebas |
