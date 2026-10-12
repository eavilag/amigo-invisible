# ADR-0012: Limitación de peticiones por IP

**Estado:** Aceptado · **Fecha:** 2026-10-12 · **Decide:** Equipo · **Tipo:** Seguridad · **Requisitos:** RNF-08, CA-20.3 · **Amenazas:** AME-11, AME-12

## Contexto
Una API pública puede sufrir creación masiva de grupos (relleno de la BD), enumeración o abuso que agote el plan gratuito.

## Decisión
Binding **Workers Rate Limiting** de Cloudflare con clave = IP del cliente (`CF-Connecting-IP`):
| Limitador | Ámbito | Límite |
|---|---|---|
| `RL_CREATE` | `POST /api/groups` | 5 por minuto |
| `RL_WRITE` | resto de escrituras | 30 por minuto |
| `RL_READ` | lecturas | 120 por minuto |

Al superarse: `429 {"error":"RATE_LIMITED"}` → "Espera un minuto y vuelve a intentarlo".

Defensas complementarias: tamaño máximo de cuerpo (16 KB), máximo 40 participantes y la protección anti-DDoS de Cloudflare incluida.

## Opciones consideradas
| | Binding Rate Limiting | Regla WAF | Contador en D1 |
|---|---|---|---|
| Disponible en `workers.dev` | Sí | Solo con dominio propio | Sí |
| Coste en BD | Ninguno | Ninguno | Escrituras por petición |
| Precisión | Aproximada (por ubicación) | Alta | Alta |

## Compromisos
- La documentación desaconseja la IP como clave (NAT compartida), pero sin cuentas no hay otra; los límites son holgados para una familia detrás del mismo router.
- La enumeración de `gid` (128 bits) es inviable aun sin límite; el límite es defensa en profundidad.

## Consecuencias
- En pruebas locales el binding se simula; las pruebas de integración verifican el 429.
