# Registro de decisiones (ADR)

Cada decisión relevante de arquitectura, seguridad o privacidad se documenta con su contexto, alternativas y compromisos. Los ADR son inmutables: si una decisión cambia, se crea uno nuevo que **sustituye** al anterior.

Estados: `Propuesto` · `Aceptado` · `Sustituido por ADR-NNNN` · `Obsoleto`.

| ADR | Título | Tipo | Estado | Decide |
|---|---|---|---|---|
| [0001](0001-registrar-decisiones.md) | Registrar decisiones con ADRs | Proceso | Aceptado | Equipo |
| [0002](0002-plataforma-cloudflare.md) | Plataforma: Cloudflare Workers + D1 | Arquitectura | Aceptado | **Propietario** |
| [0003](0003-worker-unico-mismo-origen.md) | Un único Worker para SPA y API en el mismo origen | Arquitectura | Aceptado | Equipo |
| [0004](0004-pila-frontend.md) | Frontend: React + Vite + TypeScript, fuentes autoalojadas | Arquitectura | Aceptado | Equipo |
| [0005](0005-pila-backend.md) | Backend: Hono + esquemas zod compartidos | Arquitectura | Aceptado | Equipo |
| [0006](0006-identidad-sin-cuentas.md) | Identidad sin cuentas: enlaces-capacidad y tokens portadores | Seguridad | Aceptado | Equipo |
| [0007](0007-algoritmo-sorteo.md) | Sorteo en círculo único con aleatoriedad criptográfica | Arquitectura | Aceptado | Equipo |
| [0008](0008-hash-secretos.md) | Secretos guardados como SHA-256 | Seguridad | Aceptado | Equipo |
| [0009](0009-asignaciones-sin-cifrar.md) | Asignaciones guardadas sin cifrar en la base de datos | Privacidad | Aceptado | Equipo |
| [0010](0010-sin-borrado-automatico.md) | Sin borrado automático de datos | Privacidad | Aceptado | **Propietario** |
| [0011](0011-cabeceras-seguridad.md) | Cabeceras de seguridad aplicadas por el Worker | Seguridad | Aceptado | Equipo |
| [0012](0012-limitacion-peticiones.md) | Limitación de peticiones por IP | Seguridad | Aceptado | Equipo |
| [0013](0013-estrategia-pruebas.md) | Estrategia de pruebas y E2E en producción | Calidad | Aceptado | Equipo |
| [0014](0014-ci-cd.md) | CI/CD con GitHub Actions y token de API mínimo | Seguridad | Aceptado | Equipo |
| [0015](0015-sin-pagina-privacidad.md) | Sin página de privacidad dedicada | Privacidad | Aceptado | **Propietario** |
