# 🎁 Amigo Invisible

[![CI/CD](https://github.com/eavilag/amigo-invisible/actions/workflows/ci.yml/badge.svg)](https://github.com/eavilag/amigo-invisible/actions/workflows/ci.yml)

**https://reyes.familia-avila-gonzalez.workers.dev**

Aplicación web para organizar un amigo invisible compartiendo **un único enlace por WhatsApp**. Pensada para que la puedan usar personas mayores con poca soltura con el móvil: sin registro, sin contraseñas, letra grande y una sola acción por pantalla.

## Cómo funciona
1. Quien organiza escribe los nombres y envía **un enlace** al grupo de WhatsApp.
2. Cada persona toca el enlace, toca su nombre y escribe sus ideas de regalo.
3. Cuando todo está bien, quien organiza pulsa **Hacer el sorteo**.
4. Cada persona vuelve a tocar el enlace y ve **a quién regala** y sus ideas.

Nadie, ni siquiera quien organiza, puede ver a quién le ha tocado a los demás.

## Para usuarios
👉 [Guía de uso](docs/08-guia-usuario/guia-usuario.md), escrita para leerse en voz alta.

## Para desarrolladores

| | |
|---|---|
| Plataforma | Cloudflare Workers + D1 (plan gratuito) |
| Frontend | React 19 + Vite + TypeScript, SPA mobile-first accesible (WCAG 2.2 AA) |
| Backend | Hono + zod, SQL parametrizado |
| Pruebas | Vitest (unitarias, componentes, integración en workerd) · Playwright (Chromium y WebKit) · axe-core |
| CI/CD | GitHub Actions: pruebas → despliegue → pruebas en producción |

```bash
npm ci && npx playwright install chromium webkit
npm run preview:local      # http://localhost:4173
npm run test:all && npm run traceability
```

Más detalles en el [manual de mantenimiento](docs/09-mantenimiento/mantenimiento.md).

## Documentación (Spec Driven Development)

Empieza por el [índice de documentación](docs/README.md).

| Fase | Artefacto |
|---|---|
| Principios | [Constitución](docs/00-constitucion/constitucion.md) |
| Requisitos | [Especificación v1.0.0](docs/01-especificacion/especificacion.md) |
| Experiencia de usuario | [Diseño UX](docs/02-ux/diseno-ux.md) y [prototipo](docs/02-ux/prototipo/index.html) |
| Arquitectura | [Arquitectura](docs/03-arquitectura/arquitectura.md), [ADRs](docs/03-arquitectura/adr/README.md), [API OpenAPI](docs/03-arquitectura/api/openapi.yaml) |
| Seguridad | [Modelo de amenazas](docs/04-seguridad/modelo-amenazas.md), [inventario de secretos](docs/04-seguridad/inventario-secretos.md), [revisión de seguridad](docs/04-seguridad/revision-seguridad-2026-10-12.md) |
| Plan | [Plan y tareas](docs/05-plan/plan-y-tareas.md) |
| Pruebas | [Plan de pruebas](docs/06-pruebas/plan-pruebas.md), [matriz de trazabilidad](docs/06-pruebas/matriz-trazabilidad.md) |
| Operación | [Despliegue](docs/07-despliegue/despliegue.md), [runbook](docs/07-despliegue/runbook.md) |
| Mantenimiento | [Manual](docs/09-mantenimiento/mantenimiento.md) |

## Licencia
[MIT](LICENSE)
