| ID | Versión | Estado | Fecha |
|---|---|---|---|
| RUNBOOK | 1.0.0 | Vigente | 2026-10-12 |

# Runbook: qué hacer si algo falla

Cada problema sigue el mismo esquema: síntoma → comprobación → solución.

## La web no abre

1. Abre https://reyes.familia-avila-gonzalez.workers.dev/api/health. Debe responder `{"ok":true}`.
2. Si no responde, revisa https://www.cloudflarestatus.com.
3. Si Cloudflare está bien, haz rollback al despliegue anterior ([despliegue.md §4](despliegue.md)).

## "Algo ha fallado" al usar la aplicación

1. Panel de Cloudflare → *Workers & Pages → reyes → Logs* (observabilidad activada). Los errores aparecen como JSON con `route` y `error`, sin datos personales.
2. Si empezó tras un despliegue, haz rollback y abre una incidencia en GitHub con el registro.

## "Demasiados intentos" a una familia

Los límites son por IP y por minuto ([ADR-0012](../03-arquitectura/adr/0012-limitacion-peticiones.md)). Basta con esperar un minuto. Si se repite con un uso normal, sube los límites en `wrangler.jsonc` (`ratelimits`) y despliega.

## El despliegue automático falla en GitHub

| Paso que falla | Causa probable | Solución |
|---|---|---|
| Calidad y pruebas | Un cambio rompe pruebas | Ver el informe en los artefactos; corregir antes de fusionar |
| `npm audit` | Vulnerabilidad nueva en una dependencia | Aceptar la PR de Dependabot o actualizar la dependencia |
| Migraciones / deploy con "Authentication error" | Token de Cloudflare caducado o revocado | Crear un token nuevo ([despliegue.md §2](despliegue.md)) y `gh secret set CLOUDFLARE_API_TOKEN` |
| Pruebas en producción | Problema real en producción | Rollback inmediato y revisar el informe `playwright-report-prod` |

## Un organizador perdió su enlace de organizador

Por diseño no se puede recuperar ([ADR-0006](../03-arquitectura/adr/0006-identidad-sin-cuentas.md)). Solución: crear un grupo nuevo. Si hace falta borrar el antiguo, el operador puede hacerlo desde la consola de D1:

```sql
-- Sustituir <gid> por el identificador del enlace (/g/<gid>)
DELETE FROM participants WHERE group_id = '<gid>';
DELETE FROM groups WHERE id = '<gid>';
```

No consultes la tabla `participants` salvo para diagnóstico: contiene las asignaciones ([ADR-0009](../03-arquitectura/adr/0009-asignaciones-sin-cifrar.md)).

## Ver cuánto se usa (cuota gratuita)

Panel de Cloudflare → *Workers & Pages → reyes → Metrics*. Límite gratuito: 100.000 peticiones al día.
