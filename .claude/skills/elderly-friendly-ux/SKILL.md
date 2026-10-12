---
name: elderly-friendly-ux
description: Design and review mobile web UIs for elderly users with low smartphone dexterity — sizing, contrast, copy, navigation and a usability test script. Use when designing screens, writing UI copy, or reviewing a page for older users.
---

# UX para personas mayores (móvil)

## Reglas de diseño
- Letra base ≥ 20 px (en `html { font-size }` para que todo escale con rem); títulos 28–36 px. Tipografía muy legible (Atkinson Hyperlegible, Lexend).
- Botones ≥ 56–60 px de alto, ancho completo, separación ≥ 12 px. Un único botón destacado (acción principal) por pantalla.
- Contraste de texto ≥ 7:1 (AAA). Estado nunca solo por color: siempre con texto ("✓ Ha visto a su amigo").
- Sin menús hamburguesa, gestos, carruseles, temporizadores ni iconos sin texto. Botón "Volver" siempre visible arriba. Profundidad máxima 2.
- Confirmaciones con botones que repiten el verbo: "Sí, hacer el sorteo" / "No, todavía no". Nada de "Aceptar/Cancelar".
- Lenguaje llano y en segunda persona: "Toca tu nombre". Prohibido: link, login, token, app, usuario, error 500.
- Errores: qué ha pasado + qué hacer + un único botón.
- Debe funcionar a 320 px de ancho y con el texto del sistema al 200 % sin desplazamiento horizontal.
- Sin registro ni contraseñas; recordar el dispositivo.

## Prueba con usuarios (5 minutos)
1. Da el móvil ya en la pantalla inicial y una sola tarea ("descubre a quién le haces el regalo").
2. No ayudes. Anota: dudas > 5 s, toques fallidos, textos que lee en voz alta sin entender, si necesita gafas.
3. Éxito = tarea completada sin ayuda en < 2 minutos. Objetivo: 9 de cada 10.
4. Convierte cada problema en un cambio de especificación o de UX (nunca "el usuario se equivocó").

## Revisión automática
- axe-core (WCAG 2.2 AA) en cada pantalla, en claro y oscuro.
- Comprobación de tamaño mínimo de botones y ausencia de scroll horizontal a 320 px.
