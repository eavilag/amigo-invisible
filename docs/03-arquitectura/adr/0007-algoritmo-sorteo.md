# ADR-0007: Sorteo en círculo único con aleatoriedad criptográfica

**Estado:** Aceptado · **Fecha:** 2026-10-12 · **Decide:** Equipo · **Tipo:** Arquitectura · **Requisitos:** RF-05 (reglas 1–4), CA-05.1, CA-05.2 · **Amenazas:** AME-07

## Contexto
El sorteo debe garantizar que nadie se toca a sí mismo, que no hay parejas cruzadas y que el resultado no es predecible.

## Decisión
1. Barajar los participantes con **Fisher–Yates** usando `crypto.getRandomValues` y **muestreo por rechazo** para evitar el sesgo de módulo.
2. Asignar a cada persona la siguiente en la lista barajada, y a la última la primera: un **único círculo**.

Con N ≥ 3 esto garantiza por construcción: sin autoasignación, sin parejas cruzadas, todos dan y reciben uno. Cada uno de los (N−1)! círculos posibles tiene la misma probabilidad.

## Opciones consideradas
| | Círculo único | Desarreglo aleatorio (reintentar hasta válido) | `Math.random` |
|---|---|---|---|
| Parejas cruzadas | Imposibles | Posibles | — |
| Tiempo | Determinista O(N) | Probabilístico | — |
| Predecible | No | No | **Sí** (no criptográfico) |

## Compromisos
- Se excluyen las combinaciones con varios círculos pequeños. Es deseable para el juego (decisión de SPEC) y aceptable.
- Con exclusiones futuras (P2) el algoritmo tendría que cambiar a búsqueda con retroceso; el módulo `domain/draw.ts` es puro y aislado para facilitarlo.

## Consecuencias
- Pruebas de propiedades: miles de sorteos para N = 3…40 verifican las invariantes, y una prueba estadística comprueba la uniformidad para N = 4.
