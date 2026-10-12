---
name: sdd-specify
description: Write or update a Spec Driven Development requirements specification (user stories HU, functional RF, non-functional RNF, Gherkin acceptance criteria CA) with versioned header and history. Use when starting a project, capturing requirements, or applying owner feedback to a spec.
---

# SDD · Especificación de requisitos

## Cuándo
Al iniciar un proyecto (fase 1) o al aplicar cambios de alcance del propietario.

## Pasos
1. Pregunta primero solo las decisiones que cambian el alcance (máx. 4, con opción recomendada). El resto, decídelo y lístalo como "decisiones que puedes cambiar".
2. Crea `docs/01-especificacion/especificacion.md` con esta cabecera:
   ```
   | ID | Versión | Estado | Fecha |
   |---|---|---|---|
   | SPEC | 0.1.0 | En revisión (Puerta P1) | AAAA-MM-DD |
   ```
3. Secciones: Problema · Objetivos medibles · No objetivos (con motivo) · Personas · Glosario · Flujo principal · Historias `HU-NN` · Requisitos `RF-NN` con prioridad P0/P1/P2 y trazados a HU · Criterios `CA-NN.M` (Dado/Cuando/Entonces, incluir negativos y casos límite: vacío, mínimo, máximo, duplicados, concurrencia, caracteres especiales) · RNF en tabla con columna "Verificación" · P2 futuros · Preguntas abiertas `PA-N` · Historial.
4. Reglas de cambio:
   - Nunca renumerar. Un requisito eliminado conserva su ID: `### RF-17 · ~~Título~~ — **Eliminado en vX.Y.Z**` + motivo.
   - SemVer documental: MAYOR = cambio de alcance aprobado; MENOR = ampliación; PARCHE = erratas. Antes de la aprobación se usa 0.x.
   - Añade fila al historial y actualiza `CHANGELOG.md`.
5. Propaga el cambio a los artefactos dependientes (UX, guía, constitución) y busca referencias huérfanas con `grep -rn "RF-NN" docs`.
6. Cierra con la skill `sdd-gate`.

## Calidad
- Cada CA debe ser comprobable por una prueba automática o una revisión explícita.
- Evita "rápido", "intuitivo": da cifras (≤ 3 toques, < 2,5 s, ≥ 56 px).
