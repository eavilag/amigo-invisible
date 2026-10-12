# ADR-0009: Asignaciones guardadas sin cifrar en la base de datos

**Estado:** Aceptado · **Fecha:** 2026-10-12 · **Decide:** Equipo · **Tipo:** Privacidad · **Requisitos:** CA-05.3, CA-09.3, CA-12.3 · **Amenazas:** AME-06

## Contexto
Nadie debe ver emparejamientos ajenos "a través de la aplicación". Queda la pregunta de si el operador (quien administra la cuenta de Cloudflare) debería poder verlos en la base de datos.

## Decisión
Guardar `receiver_id` sin cifrar. La confidencialidad se garantiza en la **capa de API**: ningún endpoint devuelve asignaciones salvo la del propio participante autenticado.

## Opciones consideradas
| | Sin cifrar + control en API | Cifrar con el token del participante |
|---|---|---|
| Sorteo antes de que la gente entre (flujo flexible, SPEC §6) | Sí | **No**: el token no existe hasta que se elige nombre |
| Liberar nombre sin rehacer sorteo (RF-14) | Sí | Requiere recifrar |
| Protege frente al operador | No | Sí |

## Compromisos
- **El operador de la cuenta de Cloudflare podría consultar emparejamientos en la consola de D1.** Es un juego familiar y el operador es el propietario; se considera aceptable. Se documenta en la guía de mantenimiento: no consultar la tabla `participants` salvo para diagnóstico.

## Consecuencias
- Pruebas de integración específicas verifican que ninguna respuesta del organizador ni de otros participantes contiene `receiver` ajeno (CA-09.3, CA-12.3).
