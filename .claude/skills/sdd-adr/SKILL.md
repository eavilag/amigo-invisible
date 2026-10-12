---
name: sdd-adr
description: Record an architecture, security or privacy decision as an ADR (context, decision, options table, trade-offs, consequences) and update the ADR index used as the inventory of accepted compromises. Use when choosing technology, accepting a risk, or when the owner overrides a recommendation.
---

# SDD · Registro de decisión (ADR)

1. Fichero `docs/03-arquitectura/adr/NNNN-titulo-en-kebab.md` (numeración correlativa, nunca reutilizar).
2. Plantilla:
   ```
   # ADR-NNNN: Título
   **Estado:** Aceptado · **Fecha:** · **Decide:** Equipo | Propietario · **Tipo:** Arquitectura | Seguridad | Privacidad | Calidad | Proceso · **Requisitos:** RF/RNF/CA · **Amenazas:** AME-NN
   ## Contexto
   ## Decisión
   ## Opciones consideradas   (tabla comparativa con 2–4 opciones)
   ## Compromisos             (qué se sacrifica y por qué es aceptable)
   ## Consecuencias
   ```
3. Si el propietario descarta una recomendación de seguridad o privacidad, el ADR lo marca `Decide: Propietario` y explica el riesgo residual sin juicios.
4. Actualiza la tabla de `adr/README.md` y, si aplica, la sección "Riesgos aceptados" del modelo de amenazas.
5. Un ADR no se edita para cambiar la decisión: se crea uno nuevo con `Sustituye a ADR-NNNN` y el antiguo pasa a `Sustituido por ADR-MMMM`.
