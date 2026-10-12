# ADR-0006: Identidad sin cuentas: enlaces-capacidad y tokens portadores

**Estado:** Aceptado · **Fecha:** 2026-10-12 · **Decide:** Equipo · **Tipo:** Seguridad · **Requisitos:** RF-02, RF-07, RF-08, RF-09, CA-09.3, CONST §1–3 · **Amenazas:** AME-01, AME-02, AME-03, AME-04

## Contexto
No hay registro ni contraseñas (CONST §1), pero hay tres niveles de acceso: quien tiene el enlace del grupo, el participante identificado y el organizador.

## Decisión
Modelo de **capacidades** (*capability URLs*, W3C TAG):
| Capacidad | Forma | Entropía | Dónde vive |
|---|---|---|---|
| Enlace del grupo | `/g/{gid}` | 128 bits | WhatsApp del grupo |
| Clave de organizador | `/g/{gid}/organizar#{clave}` (en el **fragmento**, que el navegador nunca envía al servidor) | 256 bits | `localStorage` del organizador + copia que se envía a sí mismo |
| Token de participante | Lo genera el servidor al elegir nombre | 256 bits | `localStorage` del móvil |

- Las claves se envían en `Authorization: Bearer …`, nunca en la URL de la API ni en cookies.
- Al abrir el enlace de organizador, la SPA guarda la clave y **la borra de la barra de direcciones** (`history.replaceState`) para que no quede en capturas ni en el historial visible.
- `Referrer-Policy: no-referrer` evita filtrar el `gid` a otros sitios.
- Los enlaces a WhatsApp usan `https://wa.me/?text=…`, que abre la app del usuario; ningún dato pasa por servidores de terceros desde el nuestro.

## Opciones consideradas
| | Capacidades + Bearer | Cookies de sesión | Cuentas con correo |
|---|---|---|---|
| Fricción para mayores | Ninguna | Ninguna | Alta |
| CSRF | Imposible (sin cookies) | Requiere tokens CSRF | Requiere tokens CSRF |
| Datos personales | Ninguno | Ninguno | Correo |

## Compromisos
- **Quien tenga el enlace del grupo puede elegir cualquier nombre libre** (p. ej. si el enlace se reenvía fuera de la familia). Se acepta: es el modelo del juego; el organizador puede liberar nombres (RF-14) y repetir el sorteo (RF-06).
- **Si alguien toca un nombre ajeno y mira el resultado, lo conoce.** Mitigado con la confirmación "¿Eres …?" y con "No soy yo" antes de ver (RF-15).
- **Perder el móvil o borrar los datos del navegador** obliga a pedir al organizador que libere el nombre. Si el organizador pierde su clave, no se puede recuperar (no hay a quién verificar).
- `localStorage` es accesible a cualquier script de la página: se mitiga con CSP estricta sin scripts de terceros (ADR-0011).

## Consecuencias
- La autorización se comprueba en el servidor en cada petición: el token identifica a un participante **y** debe pertenecer al `gid` de la ruta.
