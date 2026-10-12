| ID | Versión | Estado | Fecha |
|---|---|---|---|
| SEC-SECRETOS | 1.0.0 | Vigente | 2026-10-12 |

# Inventario de secretos y mecanismos de autenticación

Complementa al [modelo de amenazas](modelo-amenazas.md) y a los ADR 0006, 0008, 0009, 0011, 0012 y 0014.

## 1. Secretos de la aplicación (capacidades)

| Secreto | Forma | Permite | No permite | Dónde se guarda | En la BD | Quién puede tenerlo |
|---|---|---|---|---|---|---|
| Enlace del grupo | `/g/{gid}`, 128 bits | Ver nombres, fecha y presupuesto; elegir un nombre libre | Ver asignaciones o listas; gestionar | WhatsApp de la familia, historial del navegador | En claro (es la clave primaria) | Miembros del grupo y a quien se reenvíe (AME-01, aceptado) |
| Clave de organizador | 256 bits, en el fragmento `#` | Gestionar el grupo (sortear, liberar, borrar) | Ver asignaciones | `localStorage` del móvil del organizador; mensaje que se envía a sí mismo | Solo SHA-256 | El organizador |
| Token de participante | 256 bits | Ver su asignación y la lista de su amigo; editar su lista | Nada de otros participantes | `localStorage` de ese móvil | Solo SHA-256 | Esa persona (se invalida al liberar el nombre) |

Protecciones comunes:
- Generación con `crypto.getRandomValues`.
- Envío solo por HTTPS en `Authorization: Bearer`; nunca en cookies ni en URLs de la API, y nunca en registros.
- CSP sin scripts de terceros, que protege `localStorage`.
- `Referrer-Policy: no-referrer`, `noindex` y vista previa genérica.
- Límite de peticiones por IP.
- La clave de organizador se borra de la barra de direcciones al abrirse.

No se guardan contraseñas, correos, teléfonos, cookies ni analítica.

Las asignaciones se guardan sin cifrar a nivel de aplicación: el operador de la cuenta de Cloudflare podría verlas (ADR-0009). Cloudflare cifra D1 en reposo y todo el tráfico va por TLS.

## 2. Secretos de la infraestructura

| Secreto | Ubicación | Alcance | Acceso | Protección y recomendaciones |
|---|---|---|---|---|
| Cuenta de Cloudflare | Propietario | Total | Propietario | Activar 2FA |
| Cuenta de GitHub y token de `gh` | Propietario; llavero de macOS | Código, y por tanto producción (CD desde `main`) | Propietario | 2FA; sin colaboradores con escritura; recomendable proteger la rama `main` |
| Sesión OAuth de `wrangler` | `~/Library/Preferences/.wrangler/config/default.toml` del Mac del propietario | Amplio sobre la cuenta de Cloudflare | Usuario del Mac | Cerrar con `npx wrangler logout` (CI ya despliega) |
| `CLOUDFLARE_API_TOKEN` | Secretos cifrados de GitHub Actions | Workers y D1 de la cuenta | Solo el trabajo de despliegue en `push` a `main` (no en PRs); enmascarado en los registros | Plantilla *Edit Cloudflare Workers* + *D1 Edit*; revocar y rotar desde el panel |
| `CLOUDFLARE_ACCOUNT_ID` | Secretos de GitHub | Ninguno por sí solo | — | Guardado como secreto por higiene |
| `database_id` de D1 | `wrangler.jsonc` (público) | Ninguno sin credenciales | Público | No es secreto |

El repositorio público no contiene credenciales: `.gitignore` excluye `.env*`, `.dev.vars` y `.wrangler/`, y la [revisión de seguridad](revision-seguridad-2026-10-12.md) lo comprobó.

## 3. Quién puede ver qué

| Actor | Alcance |
|---|---|
| Extraño en Internet | Nada (identificadores no adivinables) |
| Quien tenga el enlace del grupo | Lista de nombres; ocupar un nombre libre |
| Participante | Su asignación y la lista de deseos de su amigo |
| Organizador (panel) | Estado de cada participante, **no** las asignaciones |
| Operador (consola de Cloudflare) | Todo, incluidas las asignaciones (ADR-0009) |
| Cloudflare (proveedor) | Infraestructura cifrada en reposo, sujeta a su política y al RGPD |

## 4. Rotación y respuesta

| Situación | Acción |
|---|---|
| Se filtra el enlace de un grupo | Liberar nombres ocupados por extraños y repetir el sorteo; o borrar el grupo y crear otro |
| Se filtra una clave de organizador | Borrar ese grupo (con la propia clave) y crear otro |
| Se filtra `CLOUDFLARE_API_TOKEN` | Revocarlo en el panel de Cloudflare, crear uno nuevo y `gh secret set CLOUDFLARE_API_TOKEN` |
| Se compromete el Mac del propietario | `wrangler logout` / revocar sesiones en Cloudflare y GitHub; cambiar contraseñas |
