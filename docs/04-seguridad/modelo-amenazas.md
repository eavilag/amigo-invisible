| ID | Versión | Estado | Fecha |
|---|---|---|---|
| SEC | 1.0.0 | Aprobado | 2026-10-12 |

# Modelo de amenazas y controles de seguridad

Metodología **STRIDE** sobre la arquitectura de `ARQ` 1.0.0. Cada amenaza (`AME-NN`) enlaza sus controles, la decisión que la justifica (ADR) y la prueba que la verifica (ver matriz de trazabilidad).

## 1. Activos

| Activo | Sensibilidad | Por qué importa |
|---|---|---|
| Asignaciones (quién regala a quién) | **Alta para el juego** | Si se filtran, el juego pierde la gracia |
| Clave de organizador | Alta | Permite borrar, resortear o liberar nombres |
| Token de participante | Media | Permite ver la asignación y la lista de deseos de esa persona |
| Nombres de pila e ideas de regalo | Baja–media | Datos personales mínimos |
| Disponibilidad y cuota gratuita | Media | Sin servicio no hay juego |

## 2. Fronteras de confianza

1. **Internet → Worker**: toda entrada es hostil hasta validarse.
2. **Worker → D1**: solo consultas parametrizadas de `db/repo.ts`.
3. **Navegador**: `localStorage` guarda secretos; lo protege la CSP sin scripts de terceros.
4. **GitHub Actions → Cloudflare**: token de API con permisos mínimos.

## 3. Amenazas y controles

| ID | STRIDE | Amenaza | Controles | ADR | Riesgo residual |
|---|---|---|---|---|---|
| AME-01 | Suplantación | Alguien con el enlace del grupo elige el nombre de otra persona | Confirmación "¿Eres…?"; "Dejar entrar de nuevo" (RF-14); "No soy yo" (RF-15); repetir sorteo (RF-06) | 0006 | **Aceptado**: inherente a un juego sin cuentas |
| AME-02 | Suplantación | Adivinar o robar la clave de organizador | 256 bits aleatorios; viaja en el fragmento `#` (no llega a servidores ni registros); se borra de la barra de direcciones; `Referrer-Policy: no-referrer`; solo se guarda su hash | 0006, 0008 | Bajo |
| AME-03 | Revelación | Obtener la asignación de otro participante por la API (IDOR) | La asignación solo sale de `/me/reveal` para el token autenticado; las respuestas públicas y de organizador nunca incluyen `receiver` ni listas de deseos | 0006, 0009 | Bajo |
| AME-04 | Elevación de privilegios | Usar un token de participante en otro grupo, o el enlace del grupo en rutas de organizador | Cada petición comprueba que el secreto pertenece al `gid` de la ruta; las rutas de organizador exigen la clave | 0006 | Bajo |
| AME-05 | Revelación | Volcado de la base de datos permite suplantar | Secretos guardados como SHA-256 de 256 bits | 0008 | Bajo |
| AME-06 | Revelación | El operador consulta asignaciones en la consola de D1 | Política de uso en la guía de mantenimiento | 0009 | **Aceptado** |
| AME-07 | Manipulación | Predecir o sesgar el sorteo | `crypto.getRandomValues` con muestreo por rechazo; prueba de uniformidad | 0007 | Bajo |
| AME-08 | Manipulación / Revelación | XSS almacenado con nombres o listas de deseos | React escapa la salida; prohibido `dangerouslySetInnerHTML` (lint); CSP `script-src 'self'` sin `unsafe-inline`; validación de longitud y eliminación de caracteres de control | 0004, 0011 | Bajo |
| AME-09 | Manipulación | *Clickjacking* (incrustar la web en un iframe para engañar al usuario) | `frame-ancestors 'none'` | 0011 | Bajo |
| AME-10 | Revelación | Filtrar el enlace del grupo por cabecera Referer, buscadores o la vista previa de WhatsApp | `no-referrer`; `X-Robots-Tag: noindex` y `robots.txt`; metadatos Open Graph genéricos sin datos del grupo | 0011 | Bajo |
| AME-11 | Denegación de servicio | Saturar la API o agotar la cuota gratuita | Rate Limiting por IP; cuerpo ≤ 16 KB; anti-DDoS de Cloudflare | 0012 | Bajo–medio |
| AME-12 | Denegación de servicio | Crear grupos masivamente para llenar la BD | 5 creaciones/min por IP; máx. 40 participantes y longitudes acotadas | 0012 | Bajo |
| AME-13 | Manipulación | Dependencia maliciosa o robo de secretos de CI | `npm ci` con lockfile; `npm audit`; Dependabot; token de Cloudflare con permisos mínimos; `GITHUB_TOKEN` de solo lectura | 0014 | Medio (inherente al ecosistema npm) |
| AME-14 | Manipulación | Condiciones de carrera: dos móviles eligen el mismo nombre, o dos sorteos simultáneos | `UPDATE … WHERE token_hash IS NULL`; control optimista con `draw_version` en un `batch` transaccional | ARQ §4 | Bajo |
| AME-15 | Manipulación | Inyección SQL | Solo sentencias preparadas con `bind`; sin SQL concatenado (revisión y lint) | 0005 | Muy bajo |
| AME-16 | Revelación | Datos personales o secretos en registros o mensajes de error | Errores genéricos con código; los registros no incluyen cuerpos, nombres ni cabeceras `Authorization` | 0005 | Bajo |
| AME-17 | Repudio | Nadie puede demostrar quién resorteó o liberó un nombre | Sin auditoría | — | **Aceptado**: valor bajo para un juego |
| AME-18 | Revelación | Alguien coge el móvil de otra persona y ve su resultado | El resultado exige pulsar "Ver a quién regalo" | — | **Aceptado** |
| AME-19 | Suplantación | *Phishing*: copias de la web que piden datos | La web nunca pide datos personales ni contraseñas, lo que reduce el valor de imitarla | — | Bajo |

## 4. Correspondencia con OWASP Top 10 (2021)

| OWASP | Cobertura |
|---|---|
| A01 Control de acceso roto | AME-03, AME-04: autorización por recurso en cada endpoint + pruebas de integración negativas |
| A02 Fallos criptográficos | AME-02, AME-05, AME-07: HTTPS/HSTS, Web Crypto, SHA-256, secretos de 256 bits |
| A03 Inyección | AME-08, AME-15: zod, `bind`, escape de React, CSP |
| A04 Diseño inseguro | Este modelo de amenazas + ADRs |
| A05 Mala configuración de seguridad | AME-09, AME-10: cabeceras en todas las respuestas, verificadas por pruebas E2E en producción |
| A06 Componentes vulnerables | AME-13: Dependabot, `npm audit` en CI |
| A07 Fallos de identificación | ADR-0006: sin contraseñas; capacidades de alta entropía |
| A08 Integridad de software y datos | AME-13: lockfile, despliegue solo desde CI |
| A09 Fallos de registro y monitorización | Logs de Workers sin datos personales (RNF-13) |
| A10 SSRF | No aplica: el servidor no hace peticiones salientes |

## 5. Riesgos aceptados (inventario)

AME-01, AME-06, AME-17 y AME-18, más los recogidos en ADR-0010 (sin borrado automático) y ADR-0015 (sin página de privacidad).

## Historial
| Versión | Fecha | Cambio |
|---|---|---|
| 1.0.0 | 2026-10-12 | Versión inicial |
