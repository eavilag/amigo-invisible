| ID | Versión | Estado | Fecha |
|---|---|---|---|
| UX | 0.1.0 | En revisión (Puerta P2) | 2026-10-11 |

# Diseño de la experiencia de usuario

Prototipo navegable: [`prototipo/index.html`](prototipo/index.html) (abrir en el móvil o en el navegador; el selector superior permite saltar a cualquier pantalla).

## 1. Principios de diseño (derivados de `CONST` §1 y `RNF-01..04`)

| Principio | Cómo se aplica |
|---|---|
| Una acción principal por pantalla | Un único botón rojo (acento) por pantalla; el resto son botones con borde |
| Leer sin gafas | Letra base 20 px, títulos 28–35 px, tipografía *Atkinson Hyperlegible* (diseñada por el Braille Institute para baja visión) |
| Tocar sin fallar | Botones de 60 px de alto y ancho completo; separación ≥ 12 px |
| Contraste alto | Texto azul tinta sobre blanco (16:1); rojo del acento 7,4:1 (AAA) |
| Nada escondido | Sin menús hamburguesa, sin gestos, sin iconos sin texto; "Más opciones" desplegable solo para acciones raras del organizador |
| Confirmar lo importante | Toda acción con consecuencias (sorteo, repetir, borrar, elegir nombre) pide confirmación con botones "Sí, …" / "No" que repiten el verbo |
| Lenguaje llano | "Enlace", "Toca", "Ideas de regalo". Nunca "link", "token", "login", "usuario" |
| Errores con salida | Cada error explica qué pasa y ofrece un único botón para seguir |
| Modo oscuro | Respeta la preferencia del móvil con la misma legibilidad |

## 2. Inventario de pantallas

| # | Pantalla | Ruta | Requisitos | Acción principal |
|---|---|---|---|---|
| 1 | Portada | `/` | RF-18, RF-19 | Crear amigo invisible |
| 2 | Crear / editar grupo | `/nuevo` | RF-01, RF-04 | Crear |
| 3 | Panel del organizador | `/g/{id}/organizar#{clave}` | RF-02, RF-03, RF-05, RF-06, RF-12, RF-13, RF-14, RF-16, RF-17 | Hacer el sorteo → Enviar por WhatsApp |
| 4 | ¿Quién eres? | `/g/{id}` | RF-07 | Tocar tu nombre |
| 5 | Mi pantalla | `/g/{id}` (identificado) | RF-08, RF-09, RF-15 | Ver a quién regalo |
| 6 | Resultado | `/g/{id}` (vista) | RF-09, RF-11 | — (lectura) |
| 7 | Mis ideas de regalo | `/g/{id}` (vista) | RF-10 | Guardar |
| 8 | ¿Cómo funciona? | `/ayuda` | RF-19 | — |
| 9 | Privacidad | `/privacidad` | RF-19, RNF-09 | — |
| 10 | Error / no encontrado | cualquiera | RF-20 | Ir al inicio |

## 3. Recorridos clave

**Participante mayor (3 toques, RNF-03)**: WhatsApp → toca enlace → (1) toca su nombre → (2) "Sí, soy Paco" → (3) "Ver a quién regalo".

**Organizador**: Portada → Crear → escribe nombres → Crear → Hacer el sorteo → Sí → Enviar por WhatsApp → elige grupo.

## 4. Sistema visual (tokens)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg` | `#ffffff` | `#11142a` | Fondo |
| `--surface` | `#f3f4f9` | `#1d2142` | Tarjetas |
| `--ink` | `#1b1f3b` | `#f4f5fb` | Texto |
| `--ink-soft` | `#3f4466` | `#c9cce6` | Texto secundario (≥ 7:1) |
| `--ribbon` | `#a50f2a` | `#ff8fa0` | Acción principal, resultado |
| `--pine` | `#17604a` | `#7fdcb8` | WhatsApp, estado "visto" |
| Tipografía | Atkinson Hyperlegible (texto), Lexend (títulos) | | Autoalojadas en producción (sin peticiones a Google) |

## 5. Textos (microcopia)
Todos los textos de la aplicación estarán en un único fichero (`src/client/i18n/es.ts`) para revisarlos y cambiarlos sin tocar la lógica. Los textos de WhatsApp están fijados en `SPEC` CA-03.1 y CA-13.1.

## 6. Decisiones de UX abiertas a tu validación
1. El organizador **ve el botón "Hacer el sorteo" y el de "Enviar por WhatsApp" a la vez** (puede enviar el enlace antes de sortear).
2. Los nombres ya elegidos aparecen **con borde discontinuo y la etiqueta "Ya ha entrado"** (en vez de ocultarlos), para que nadie piense que falta.
3. El resultado se ve **tras pulsar un botón** (no aparece de golpe), por si hay alguien mirando la pantalla.
4. Las acciones raras del organizador (repetir, deshacer, borrar) van en **"Más opciones"** plegado.

## Historial
| Versión | Fecha | Cambio |
|---|---|---|
| 0.1.0 | 2026-10-11 | Primer borrador con prototipo navegable |
