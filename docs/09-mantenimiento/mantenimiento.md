| ID | Versión | Estado | Fecha |
|---|---|---|---|
| MANT | 1.0.0 | Vigente | 2026-10-12 |

# Manual de mantenimiento

## 1. Puesta en marcha para desarrollar

Requisitos: Node 24.15 o superior, git y `gh` (opcional).

```bash
git clone https://github.com/eavilag/amigo-invisible.git
cd amigo-invisible
npm ci
npx playwright install chromium webkit
npm run preview:local
```

`npm run preview:local` compila, prepara la D1 local y sirve la aplicación en http://localhost:4173 con el mismo motor que producción (workerd).

| Comando | Para qué |
|---|---|
| `npm run dev` | Desarrollo con recarga en caliente |
| `npm run typecheck` · `npm run lint` · `npm run format` | Calidad |
| `npm test` | Vitest: unitarias, componentes e integración (workerd + D1) |
| `npm run test:e2e` | Playwright E2E y accesibilidad (Android y iPhone emulados) |
| `npm run test:all` y después `npm run traceability` | Todo, y regenerar la matriz de trazabilidad |
| `npm run cf-typegen` | Regenerar tipos tras cambiar `wrangler.jsonc` |

## 2. Mapa del código

Ver [arquitectura §3](../03-arquitectura/arquitectura.md). Reglas que conviene respetar:

- `src/shared` no depende de nada de plataforma; el cliente no importa zod (presupuesto de JavaScript).
- Todo el SQL vive en `src/worker/db/repo.ts`, con `bind`.
- `src/worker/domain` es puro (sin HTTP ni base de datos).
- Todos los textos visibles están en `src/client/i18n/es.ts`.
- Prohibido `dangerouslySetInnerHTML` e `innerHTML` (lo impide el lint).

## 3. Cómo hacer un cambio (flujo SDD)

1. **Especificación**: añade o modifica requisitos en `docs/01-especificacion/especificacion.md` (skill `sdd-specify`). Nunca renumeres; sube la versión y anota el historial.
2. **Decisión**: si afecta a la arquitectura o la seguridad, crea un ADR (skill `sdd-adr`) y revisa el modelo de amenazas (skill `sdd-threat-model`).
3. **Pruebas primero**: escribe pruebas cuyo título lleve los IDs (`CP-I-40 [RF-21][CA-21.1] …`).
4. **Código**, hasta que todo pase.
5. `npm run test:all && npm run traceability`: la matriz no puede tener huecos.
6. Rama, PR y revisión; al fusionar en `main` se despliega solo.
7. Si el cambio lo nota el usuario, actualiza la guía de usuario.

## 4. Base de datos

- Las migraciones son ficheros SQL numerados en `migrations/` (`0002_…sql`). **Solo aditivas** (añadir columnas o tablas), para que un rollback del código no rompa nada.
- En local se aplican con `npm run db:migrate:local`; en producción las aplica CI automáticamente.

## 5. Dependencias

- Dependabot abre PRs semanales; si CI pasa, se pueden fusionar.
- Para actualizaciones mayores (React, Vite, Wrangler, Vitest), revisa sus notas de versión. `@cloudflare/vitest-plugin` exige versiones concretas de Vitest.
- La caché global de npm del equipo de desarrollo tenía ficheros del usuario root. Si `npm` da `EACCES`, ejecuta `sudo chown -R $(id -u):$(id -g) ~/.npm`.

## 6. Tareas periódicas

| Cada | Tarea |
|---|---|
| Semana | Revisar y fusionar PRs de Dependabot |
| Año | Comprobar que el token de Cloudflare sigue válido (si se le puso caducidad) |
| Tras cada temporada | Opcional: avisar a los organizadores de que borren sus grupos (no hay borrado automático, ADR-0010) |

## 7. Skills reutilizables

En `.claude/skills/` hay skills del proceso SDD que sirven para cualquier proyecto futuro: copiarlas a `~/.claude/skills/` las hace disponibles en todos.

| Skill | Uso |
|---|---|
| `sdd-specify` | Especificación con HU, RF, RNF y CA, versionada |
| `sdd-gate` | Puertas de validación con el propietario y etiquetas git |
| `sdd-adr` | Registro de decisiones e inventario de compromisos |
| `sdd-threat-model` | Modelo de amenazas STRIDE y OWASP |
| `sdd-traceability` | Convención de pruebas y matriz automática |
| `elderly-friendly-ux` | Diseño y prueba con personas mayores |
