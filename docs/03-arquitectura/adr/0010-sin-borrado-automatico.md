# ADR-0010: Sin borrado automático de datos

**Estado:** Aceptado · **Fecha:** 2026-10-12 · **Decide:** Propietario · **Tipo:** Privacidad · **Requisitos:** RF-16, RF-17 (eliminado), RNF-09, CONST §2 (v2.0.0)

## Contexto
SPEC 0.1 incluía un borrado diario automático (RF-17). El propietario lo descartó: no quiere procesos recurrentes.

## Decisión
No hay borrado automático. Los datos se conservan hasta que el organizador borra el grupo (RF-16), que es inmediato y elimina en cascada todos los participantes y listas.

## Opciones consideradas
| | Sin borrado automático | Cron diario (Cron Trigger) | Borrado perezoso al abrir un grupo caducado |
|---|---|---|---|
| Procesos recurrentes | Ninguno | Uno | Ninguno |
| Datos huérfanos | Permanecen | Se eliminan | Permanecen si nadie vuelve a abrir el grupo |
| Complejidad | Nula | Baja | Baja |

## Compromisos
- **Los grupos que nadie borra permanecen indefinidamente** (nombres de pila e ideas de regalo). El riesgo se considera bajo por la mínima sensibilidad de los datos y porque los identificadores no son adivinables.
- El volumen de datos es despreciable frente a los 5 GB gratuitos de D1.

## Consecuencias
- La pantalla de crear recuerda que se puede borrar todo al terminar (CA-01.8), y la guía de usuario lo pide expresamente.
- Si se quisiera retomar, la opción de borrado perezoso no requiere procesos recurrentes (SPEC §10).
