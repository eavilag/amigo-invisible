---
name: sdd-gate
description: Run a Spec Driven Development validation gate with the product owner (requirements, UX, deploy, production acceptance) — present the artifact, ask for approval, freeze the version and tag it in git. Use whenever an artifact is ready for owner sign-off.
---

# SDD · Puerta de validación

Puertas típicas: **P1** requisitos · **P2** UX y guía de usuario · **P3** despliegue/cuenta nube · **P4** aceptación en producción.

## Pasos
1. Sube el artefacto a GitHub antes de pedir la validación (el propietario debe poder verlo).
2. Resume en ≤ 6 viñetas **las decisiones que tomaste tú** y que el propietario puede cambiar.
3. Pregunta con `AskUserQuestion`: "Aprobada" / "Aprobada con cambios" / "Necesito revisarla". Para UX, sugiere una prueba concreta con un usuario real (tarea única, sin ayuda, qué observar).
4. Si hay cambios: aplícalos con la skill `sdd-specify` (o equivalente), sube versión 0.x y vuelve al paso 2.
5. Si se aprueba:
   - Cabecera → `Versión 1.0.0 · Aprobado (Puerta Pn, fecha)` y fila en historial.
   - `docs/README.md` → estado de la puerta ✅ con la etiqueta.
   - `git tag -a <artefacto>-v1.0.0 -m "... aprobada (Puerta Pn)"` y `git push --follow-tags`.
6. No avances a fases que dependan de una puerta abierta salvo que el propietario lo autorice; trabajo independiente sí puede adelantarse (decláralo).
