| ID | Versión | Estado | Fecha |
|---|---|---|---|
| DESP | 1.0.0 | Aprobado (Puerta P3) | 2026-10-12 |

# Despliegue y operación

## 1. Dónde está

| Elemento | Valor |
|---|---|
| Dirección pública | https://reyes.familia-avila-gonzalez.workers.dev |
| Plataforma | Cloudflare Workers (plan gratuito), cuenta del propietario |
| Worker | `reyes` (subdominio de cuenta `familia-avila-gonzalez`) |
| Base de datos | D1 `amigo-invisible` (`db8f1960-24f1-461e-9dbd-f30fab7ef57d`), región WEUR |
| Límites de peticiones | `RL_CREATE` 5/min · `RL_WRITE` 30/min · `RL_READ` 120/min por IP |
| Código | https://github.com/eavilag/amigo-invisible (rama `main`) |

## 2. Cómo se despliega (automático)

Cada *push* o fusión en `main` ejecuta `.github/workflows/ci.yml`:

1. **Calidad y pruebas**: auditoría de dependencias, formato, lint, tipos, 63 pruebas Vitest, 44 E2E Playwright, cobertura y matriz de trazabilidad.
2. **Desplegar y probar en producción** (solo si lo anterior pasa):
   1. `wrangler d1 migrations apply amigo-invisible --remote`
   2. `npm run deploy` (compila y publica)
   3. `npm run test:prod`: pruebas de humo `CP-P` en la dirección pública (crean un grupo de prueba y lo borran).

Las evidencias de cada ejecución se guardan 90 días como *artefactos* de GitHub Actions.

### Configuración en GitHub (ya hecha)
| Tipo | Nombre | Contenido |
|---|---|---|
| Secreto | `CLOUDFLARE_API_TOKEN` | Token con plantilla *Edit Cloudflare Workers* + *Account · D1 · Edit* |
| Secreto | `CLOUDFLARE_ACCOUNT_ID` | ID de la cuenta de Cloudflare |
| Variable | `PROD_URL` | Dirección pública; si se borra, se desactiva el despliegue automático |

## 3. Despliegue manual (alternativa)

Desde un ordenador con el repositorio y Node 24:

```bash
npx wrangler login
npm ci
npm run db:migrate:remote
npm run deploy
PROD_URL=https://reyes.familia-avila-gonzalez.workers.dev npm run test:prod
```

## 4. Volver a una versión anterior (rollback)

```bash
npx wrangler deployments list
npx wrangler rollback <version-id>
```

O desde el panel de Cloudflare: *Workers & Pages → reyes → Deployments → Rollback*. Las migraciones de base de datos son solo aditivas, así que una versión anterior del código sigue funcionando con la base de datos actual.

## 5. Añadir un dominio propio (opcional)

1. Comprar el dominio en Cloudflare (*Domain Registration*).
2. *Workers & Pages → reyes → Settings → Domains & Routes → Add → Custom domain*.
3. Cambiar la variable `PROD_URL` en GitHub.
4. Opcional: activar una regla de *Rate limiting* del WAF como defensa adicional (ADR-0012).

No requiere cambios de código.

## 6. Primera puesta en marcha (registro de lo que se hizo, 2026-10-12)

1. El propietario creó la cuenta de Cloudflare y ejecutó `npx wrangler login`.
2. `wrangler d1 create amigo-invisible --location weur` y el ID se guardó en `wrangler.jsonc`.
3. `wrangler d1 migrations apply --remote` (`0001_init.sql`).
4. `npm run deploy`: el certificado TLS del subdominio nuevo tardó unos minutos en emitirse.
5. Pruebas de producción `CP-P-01..03`: 6/6 superadas (evidencia en `docs/06-pruebas/evidencias/2026-10-12-produccion`).
6. Secretos y variable configurados en GitHub; fusión de la PR #1 y primer despliegue automático.
7. Se borró el Worker antiguo `amigo-invisible` (la base de datos no se ve afectada).
8. Dirección más amigable: el propietario cambió el subdominio de la cuenta a `familia-avila-gonzalez` y el Worker pasó a llamarse `reyes`. Se descartaron los acortadores externos porque el enlace del grupo es una capacidad secreta (ADR-0006) y quedaría en manos de terceros. Pruebas de producción con la dirección nueva: 6/6.
