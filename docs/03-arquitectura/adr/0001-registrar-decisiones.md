# ADR-0001: Registrar decisiones con ADRs

**Estado:** Aceptado · **Fecha:** 2026-10-12 · **Decide:** Equipo · **Tipo:** Proceso

## Contexto
El propietario pide un inventario de los compromisos de arquitectura y seguridad para facilitar el mantenimiento futuro.

## Decisión
Usar ADRs en Markdown (formato de Michael Nygard ampliado con opciones y compromisos), numerados `ADR-NNNN`, en `docs/03-arquitectura/adr/`. Cada ADR indica su tipo (Arquitectura, Seguridad, Privacidad, Calidad, Proceso) y quién decide. Las decisiones del propietario se marcan como tales.

## Consecuencias
- Cualquier cambio de decisión deja rastro: se crea un ADR nuevo que sustituye al anterior.
- El índice `README.md` sirve como inventario de compromisos.
