| ID | Versión | Estado | Fecha |
|---|---|---|---|
| PRU | 1.0.0 | Vigente | 2026-10-12 |

# Plan de pruebas

Estrategia: [ADR-0013](../03-arquitectura/adr/0013-estrategia-pruebas.md). Resultados: [matriz de trazabilidad](matriz-trazabilidad.md) (generada) y [evidencias](evidencias/).

## 1. Niveles

| Nivel | Prefijo | Herramienta | Ficheros | Nº | Entorno |
|---|---|---|---|---|---|
| Unitarias | CP-U | Vitest (node) | `tests/unit` | 19 | Local y CI |
| Integración API | CP-I | Vitest + workerd + D1 real | `tests/integration` | 37 | Local y CI |
| Componentes | CP-C | Vitest + jsdom + Testing Library | `tests/component` | 7 | Local y CI |
| Extremo a extremo | CP-E | Playwright: Pixel 7 (Chromium) e iPhone 13 (WebKit) | `tests/e2e` | 20 (×2 navegadores) | Local y CI |
| Accesibilidad | CP-A | Playwright + axe-core | `tests/e2e/accessibility.spec.ts` | 3 (×2) | Local y CI |
| Producción | CP-P | Playwright contra la URL pública | `tests/prod` | 3 (×2) | CI tras desplegar |

## 2. Casos límite cubiertos (selección)

| Caso | Prueba |
|---|---|
| 2, 3, 40 y 41 participantes | CP-U-21/22, CP-I-02/04, CP-E-20 |
| Nombres duplicados con acentos, mayúsculas y espacios | CP-U-10/24, CP-I-03, CP-E-09 |
| Fecha pasada, fecha de hoy y límite de medianoche en Madrid | CP-U-30, CP-I-05 |
| HTML e intentos de inyección SQL en nombres | CP-U-11, CP-I-07/35, CP-E-16 |
| Dos móviles eligen el mismo nombre a la vez | CP-I-21 |
| Tres sorteos simultáneos | CP-I-16 |
| Intercambiar nombres antes del sorteo | CP-I-12 |
| Token de otro grupo, falso o mal formado | CP-I-26 |
| Clave de organizador incorrecta o de otro grupo | CP-I-08, CP-E-08 |
| Liberar un nombre después de ver el resultado | CP-I-30 |
| Repetir el sorteo con gente que ya lo vio | CP-I-17, CP-E-04 |
| Grupo borrado con móviles que lo recuerdan | CP-I-32, CP-E-07 |
| Sin conexión y reintento | CP-E-15 |
| Almacenamiento bloqueado (modo privado) o corrupto | CP-C-02/03 |
| Límite de peticiones | CP-I-34 |
| Cuerpo de más de 16 KB, JSON roto, campos extra | CP-I-35 |
| 320 px de ancho y texto al 200 % | CP-A-02 |
| Uniformidad estadística del sorteo | CP-U-04 |

## 3. Criterios de salida de una versión

- Todas las pruebas de los niveles U, I, C, E y A pasan en CI.
- Cobertura del dominio ≥ 90 % (umbral en `vitest.config.ts`).
- `npm run traceability` termina sin criterios sin evidencia.
- `npm audit` sin vulnerabilidades altas.
- Pruebas CP-P en producción superadas tras el despliegue.
- Puerta P4: prueba de aceptación con usuarios reales (ver guía de usuario).

## 4. Prueba de aceptación con usuarios (Puerta P4)

Guion de la skill `elderly-friendly-ux`: una persona de más de 70 años recibe el enlace por WhatsApp y una única tarea ("descubre a quién le haces el regalo"), sin ayuda. Éxito: tarea completada en menos de 2 minutos. Objetivo: 9 de cada 10 personas.

## 5. Ejecuciones registradas

| Fecha | Entorno | Resultado | Evidencia |
|---|---|---|---|
| 2026-10-12 | Local (workerd) | 63/63 Vitest · 44 E2E superadas, 2 omitidas a propósito | `evidencias/2026-10-12-produccion/vitest.json`, `playwright.json` |
| 2026-10-12 | Producción | 6/6 CP-P | `evidencias/2026-10-12-produccion/playwright-prod.json` |

### Incidencias encontradas durante las pruebas (y corregidas)
| Incidencia | Corrección |
|---|---|
| WebKit aplicaba HSTS y `upgrade-insecure-requests` en `http://localhost` | Esas cabeceras solo se envían por HTTPS (ADR-0011) |
| Nombre ocupado marcado `aria-disabled`: los lectores de pantalla lo anunciaban como no disponible, aunque al tocarlo se explica qué hacer | Se quita `aria-disabled`; el estado se indica con texto y estilo |
| La pantalla del participante no se actualizaba tras el sorteo hasta recargar | Se recarga al volver a la pestaña (`useRefreshOnVisible`) |
| Un nombre escrito sin pulsar «Añadir» se perdía al crear | Se añade automáticamente |
| E2E inestable en WebKit con 4 procesos locales (workerd saturado) | 3 procesos en local y espera de 10 s |
