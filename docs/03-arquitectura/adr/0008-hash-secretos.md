# ADR-0008: Secretos guardados como SHA-256

**Estado:** Aceptado · **Fecha:** 2026-10-12 · **Decide:** Equipo · **Tipo:** Seguridad · **Amenazas:** AME-05

## Contexto
Las claves de organizador y los tokens de participante no deben poder usarse si alguien obtiene una copia de la base de datos.

## Decisión
Guardar solo `SHA-256(secreto)` (Web Crypto) y buscar por ese hash. Los secretos se generan con 256 bits de `crypto.getRandomValues`.

## Opciones consideradas
| | SHA-256 | bcrypt / Argon2 | En claro |
|---|---|---|---|
| Adecuado para secretos de alta entropía | Sí | Sí, pero innecesario | No |
| Coste CPU en Workers (límite 10 ms en plan gratis) | ~0 | Alto | 0 |

## Compromisos
- bcrypt/Argon2 existen para contraseñas de baja entropía elegidas por humanos. Con 256 bits aleatorios, la fuerza bruta sobre SHA-256 es inviable, así que el hash lento no aporta seguridad y sí coste.
- Se busca por hash con índice único, no se compara en memoria: no hay canal lateral de tiempo explotable.

## Consecuencias
- Un volcado de la BD no permite suplantar a nadie.
