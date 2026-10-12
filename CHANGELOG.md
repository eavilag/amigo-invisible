# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [SemVer](https://semver.org/lang/es/).

## [Sin publicar]
### Añadido
- Constitución del proyecto (`CONST` 1.0.0).
- Especificación de requisitos (`SPEC` 1.0.0), aprobada en la puerta P1.
- Diseño UX y prototipo navegable (`UX` 0.1.0) para revisión en la puerta P2.
- Guía de usuario temprana (`GUIA` 0.1.0).

### Cambiado (revisión del propietario, 2026-10-12)
- `SPEC` 0.2.0: flujo flexible explícito (enviar el enlace antes de sortear, corregir, listas de deseos en cualquier momento) y nuevo RNF-14 de navegación sencilla.
- `CONST` 2.0.0, `UX` 0.2.0, `GUIA` 0.2.0 alineados con la especificación.

### Añadido (implementación)
- API en Cloudflare Workers + D1 y SPA React accesible (T-01 a T-13).
- 63 pruebas Vitest y 44 ejecuciones E2E/accesibilidad Playwright (Chromium y WebKit); matriz de trazabilidad automática sin huecos.
- CI/CD en GitHub Actions con despliegue y pruebas de humo en producción; Dependabot.
- ADR-0005 y ADR-0011 precisados (zod solo en servidor; HSTS solo por HTTPS).

### Eliminado
- RF-17 (borrado automático diario) y RF-19 (pantallas "¿Cómo funciona?" y "Privacidad").
