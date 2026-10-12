| ID | Versión | Estado | Fecha |
|---|---|---|---|
| TRAZ | generada | Completa | 2026-10-12 17:53 UTC |

# Matriz de trazabilidad

> Documento **generado automáticamente** por `npm run traceability` (scripts/traceability.mjs). No editar a mano.

- Especificación: `SPEC` 1.0.1
- Informes: `reports/vitest.json` (local), `reports/playwright.json` (local), `reports/playwright-prod.json` (producción)
- Ejecuciones de prueba: ✅ 113 superadas · ❌ 0 fallidas · ⏭️ 2 omitidas
- Criterios sin evidencia: **0**

Leyenda: ✅ prueba superada (en todos los navegadores/entornos donde se ejecuta) · ❌ alguna ejecución falla · ⏭️ omitida · 📝 verificado por revisión ([verificacion-manual.md](verificacion-manual.md)).
Prefijos de prueba: `CP-U` unitaria · `CP-I` integración API · `CP-C` componente · `CP-E` extremo a extremo · `CP-A` accesibilidad · `CP-P` producción.

## Requisitos → pruebas

| Requisito / criterio | Descripción | Pruebas | Estado | Pruebas del requisito |
|---|---|---|---|---|
| **RF-01** | Crear grupo | | | ✅ CP-E-01<br>✅ CP-E-09<br>✅ CP-E-16<br>✅ CP-E-20<br>✅ CP-I-01<br>✅ CP-I-02<br>✅ CP-I-03<br>✅ CP-I-04<br>✅ CP-I-05<br>✅ CP-I-06<br>✅ CP-I-07<br>✅ CP-P-02<br>✅ CP-U-10<br>✅ CP-U-11<br>✅ CP-U-20<br>✅ CP-U-21<br>✅ CP-U-22<br>✅ CP-U-23<br>✅ CP-U-24<br>✅ CP-U-26<br>✅ CP-U-30 |
| ↳ CA-01.1 | Dado que estoy en la portada, cuando pulso "Crear amigo invisible", relleno el nombre del grupo y escribo 3 nombres y pulso "Crear", entonce | ✅ CP-E-01<br>✅ CP-I-01<br>✅ CP-U-20 | ✅ Verificado | |
| ↳ CA-01.2 | Dado que escribo solo 2 nombres, cuando pulso "Crear", entonces no se crea y veo el mensaje "Hacen falta al menos 3 personas". | ✅ CP-E-09<br>✅ CP-I-02<br>✅ CP-U-21 | ✅ Verificado | |
| ↳ CA-01.3 | Dado que escribo "María" y "maria " (o "MARIA", o "Maria"), cuando pulso "Crear", entonces veo "Hay dos nombres iguales: María". (Se compara | ✅ CP-E-09<br>✅ CP-I-03<br>✅ CP-U-10<br>✅ CP-U-24 | ✅ Verificado | |
| ↳ CA-01.4 | Dado que intento añadir el participante número 41, entonces el botón "Añadir" no lo permite y se indica "Máximo 40 personas". | ✅ CP-E-20<br>✅ CP-I-04<br>✅ CP-U-22 | ✅ Verificado | |
| ↳ CA-01.5 | Dado que escribo una fecha pasada, cuando pulso "Crear", entonces veo "La fecha ya ha pasado". | ✅ CP-E-09<br>✅ CP-I-05<br>✅ CP-U-30 | ✅ Verificado | |
| ↳ CA-01.6 | Dado un nombre vacío o de más de 30 caracteres, o un nombre de grupo vacío o de más de 60, entonces se indica el error junto al campo y no s | ✅ CP-E-09<br>✅ CP-I-06<br>✅ CP-U-23 | ✅ Verificado | |
| ↳ CA-01.7 | Los textos con etiquetas HTML o caracteres especiales (p. ej. `<script>`) se guardan y muestran como texto literal, nunca se interpretan. | ✅ CP-E-16<br>✅ CP-I-07<br>✅ CP-U-11 | ✅ Verificado | |
| ↳ CA-01.8 | La pantalla de crear muestra una línea informativa: "Solo se guardan los nombres y las ideas de regalo. Puedes borrarlo todo cuando termine  | ✅ CP-E-01 | ✅ Verificado | |
| **RF-02** | Acceso del organizador | | | ✅ CP-C-01<br>✅ CP-E-01<br>✅ CP-E-08<br>✅ CP-I-01<br>✅ CP-I-08 |
| ↳ CA-02.1 | Dado que he creado un grupo, cuando cierro y vuelvo a abrir la web en el mismo móvil, entonces veo el grupo en "Mis grupos" y puedo gestiona | ✅ CP-E-08 | ✅ Verificado | |
| ↳ CA-02.2 | Dado que abro el enlace de organizador en otro móvil, entonces puedo gestionar el grupo. | ✅ CP-E-08<br>✅ CP-I-08 | ✅ Verificado | |
| ↳ CA-02.3 | Dado un enlace de organizador incorrecto o manipulado, entonces veo "Este enlace de organizador no es válido" y no accedo a nada. | ✅ CP-E-08<br>✅ CP-I-08 | ✅ Verificado | |
| ↳ CA-02.4 | Con el enlace del grupo (el que se comparte) no se puede acceder a las funciones de organizador. | ✅ CP-I-08 | ✅ Verificado | |
| **RF-03** | Compartir el enlace del grupo | | | ✅ CP-C-05<br>✅ CP-E-01<br>✅ CP-P-02 |
| ↳ CA-03.1 | Cuando pulso "Enviar por WhatsApp", entonces se abre WhatsApp con el texto: "🎁 ¡Amigo invisible «{grupo}»! Toca este enlace, elige tu nombr | ✅ CP-C-05<br>✅ CP-E-01 | ✅ Verificado | |
| ↳ CA-03.2 | Cuando pulso "Copiar enlace", entonces el enlace se copia y veo "Enlace copiado". | ✅ CP-E-01 | ✅ Verificado | |
| ↳ CA-03.3 | La vista previa del enlace en WhatsApp muestra un título genérico ("Amigo Invisible") y no revela nombres ni datos del grupo. | ✅ CP-E-17 | ✅ Verificado | |
| ↳ CA-03.4 | Los botones de compartir están disponibles desde que se crea el grupo, sin necesidad de haber hecho el sorteo. | ✅ CP-E-01 | ✅ Verificado | |
| **RF-04** | Modificar el grupo antes del sorteo | | | ✅ CP-E-02<br>✅ CP-I-09<br>✅ CP-I-10<br>✅ CP-I-11<br>✅ CP-I-12<br>✅ CP-U-27 |
| ↳ CA-04.1 | Dado un grupo sin sortear, cuando cambio "Pepe" por "José", entonces todos ven "José". | ✅ CP-E-02<br>✅ CP-I-09 | ✅ Verificado | |
| ↳ CA-04.2 | Dado un grupo con 3 participantes, entonces no puedo quitar ninguno ("Hacen falta al menos 3 personas"). | ✅ CP-I-10 | ✅ Verificado | |
| ↳ CA-04.3 | Dado que quito a un participante que ya había elegido su nombre, entonces su móvil deja de estar asociado y, si vuelve a abrir el enlace, ve | ✅ CP-I-11 | ✅ Verificado | |
| ↳ CA-04.4 | Dado un grupo sin sortear y con el enlace ya enviado, cuando corrijo nombres o dejo entrar de nuevo a alguien (RF-14), entonces no hay ningu | ✅ CP-I-12 | ✅ Verificado | |
| ↳ CA-04.5 | La opción de cambiar nombres y datos está a la vista en el panel mientras no se haya sorteado (no escondida en un menú). | ✅ CP-E-02 | ✅ Verificado | |
| **RF-05** | Hacer el sorteo | | | ✅ CP-E-03<br>✅ CP-I-13<br>✅ CP-I-14<br>✅ CP-I-15<br>✅ CP-I-16<br>✅ CP-P-02<br>✅ CP-U-01<br>✅ CP-U-02<br>✅ CP-U-03<br>✅ CP-U-04<br>✅ CP-U-06 |
| ↳ CA-05.1 | Dado un grupo de N personas (3 ≤ N ≤ 40), cuando se sortea, entonces cada persona tiene exactamente una asignación, nadie se tiene a sí mism | ✅ CP-I-13<br>✅ CP-U-01 | ✅ Verificado | |
| ↳ CA-05.2 | Dado un sorteo de 3 o más personas, entonces no existen parejas cruzadas y las asignaciones forman un único círculo. | ✅ CP-I-13<br>✅ CP-U-02 | ✅ Verificado | |
| ↳ CA-05.3 | Tras sortear, la pantalla del organizador muestra "Sorteo hecho" pero no muestra quién regala a quién. | ✅ CP-E-03<br>✅ CP-I-14 | ✅ Verificado | |
| ↳ CA-05.4 | Tras sortear, ya no se pueden añadir, quitar ni renombrar participantes (solo deshaciendo el sorteo, RF-06). Nombre del grupo, fecha y presu | ✅ CP-E-05<br>✅ CP-I-15 | ✅ Verificado | |
| ↳ CA-05.5 | Si dos peticiones de sorteo llegan a la vez, solo una produce resultado (no hay sorteos mezclados). | ✅ CP-I-16 | ✅ Verificado | |
| **RF-06** | Repetir o deshacer el sorteo | | | ✅ CP-E-04<br>✅ CP-E-05<br>✅ CP-I-17<br>✅ CP-I-18 |
| ↳ CA-06.1 | Dado un sorteo hecho, cuando lo repito y confirmo, entonces hay nuevas asignaciones válidas y todos los estados "Ha visto a su amigo" vuelve | ✅ CP-E-04<br>✅ CP-I-17 | ✅ Verificado | |
| ↳ CA-06.2 | Dado un sorteo hecho, cuando lo deshago, entonces puedo editar participantes y los participantes ven "Todavía no se ha hecho el sorteo". | ✅ CP-E-05<br>✅ CP-I-18 | ✅ Verificado | |
| ↳ CA-06.3 | Dado que cancelo la confirmación, entonces no cambia nada. | ✅ CP-E-04 | ✅ Verificado | |
| **RF-07** | Elegir mi nombre | | | ✅ CP-E-10<br>✅ CP-E-11<br>✅ CP-E-19<br>✅ CP-I-19<br>✅ CP-I-20<br>✅ CP-I-21<br>✅ CP-I-22<br>✅ CP-I-23<br>✅ CP-P-02 |
| ↳ CA-07.1 | Dado un nombre libre, cuando lo toco y confirmo, entonces queda asociado a mi móvil y paso a mi pantalla personal. | ✅ CP-E-10<br>✅ CP-I-19 | ✅ Verificado | |
| ↳ CA-07.2 | Dado que pulso "No" en la confirmación, entonces vuelvo a la lista sin cambios. | ✅ CP-E-11 | ✅ Verificado | |
| ↳ CA-07.3 | Dado un nombre que ya ha elegido otro móvil, entonces aparece como "Ya ha entrado" y no se puede elegir; al tocarlo se explica: "Si eres tú  | ✅ CP-E-11<br>✅ CP-I-20 | ✅ Verificado | |
| ↳ CA-07.4 | Si dos móviles intentan elegir el mismo nombre a la vez, solo uno lo consigue; el otro ve que ya está elegido. | ✅ CP-I-21 | ✅ Verificado | |
| ↳ CA-07.5 | Un mismo móvil solo puede tener un nombre por grupo. | ✅ CP-E-19<br>✅ CP-I-22 | ✅ Verificado | |
| ↳ CA-07.6 | El enlace funciona igual si el sorteo aún no se ha hecho. | ✅ CP-E-11<br>✅ CP-I-19 | ✅ Verificado | |
| **RF-08** | Recordar al participante | | | ✅ CP-C-01<br>✅ CP-E-10<br>✅ CP-I-24 |
| ↳ CA-08.1 | Dado que ya elegí mi nombre, cuando vuelvo a tocar el enlace, entonces veo directamente "Hola, Pepe". | ✅ CP-E-10<br>✅ CP-I-24 | ✅ Verificado | |
| ↳ CA-08.2 | Dado que el organizador liberó mi nombre o me quitó del grupo, cuando vuelvo a entrar, entonces veo la lista de nombres de nuevo. | ✅ CP-E-06<br>✅ CP-I-24 | ✅ Verificado | |
| **RF-09** | Ver a quién regalo | | | ✅ CP-C-06<br>✅ CP-E-10<br>✅ CP-E-12<br>✅ CP-I-25<br>✅ CP-I-26<br>✅ CP-P-02 |
| ↳ CA-09.1 | Dado sorteo hecho, cuando pulso "Ver a quién regalo", entonces veo el nombre de mi amigo invisible y queda registrado que "Ha visto a su ami | ✅ CP-E-10<br>✅ CP-I-25 | ✅ Verificado | |
| ↳ CA-09.2 | Dado sorteo no hecho, entonces veo "Todavía no se ha hecho el sorteo. Vuelve a abrir este enlace más adelante." y no hay botón de ver. | ✅ CP-E-12<br>✅ CP-I-25 | ✅ Verificado | |
| ↳ CA-09.3 | El sistema solo devuelve la asignación del propio participante identificado. Ninguna petición (con o sin identificación, con el enlace del g | ✅ CP-I-26 | ✅ Verificado | |
| **RF-10** | Mi lista de deseos | | | ✅ CP-E-12<br>✅ CP-I-27<br>✅ CP-I-28<br>✅ CP-P-02<br>✅ CP-U-12<br>✅ CP-U-25 |
| ↳ CA-10.1 | Cuando escribo mis ideas y pulso "Guardar", entonces veo "Guardado" y quien me regala lo ve. | ✅ CP-E-12<br>✅ CP-I-27 | ✅ Verificado | |
| ↳ CA-10.2 | Un texto de más de 500 caracteres no se puede guardar y se muestra el contador. | ✅ CP-E-12<br>✅ CP-I-28<br>✅ CP-U-25 | ✅ Verificado | |
| ↳ CA-10.3 | Puedo dejar la lista vacía. | ✅ CP-I-28<br>✅ CP-U-25 | ✅ Verificado | |
| ↳ CA-10.4 | Puedo escribir y cambiar mi lista tanto antes como después del sorteo, con el mismo botón de mi pantalla personal. | ✅ CP-E-12<br>✅ CP-I-27 | ✅ Verificado | |
| **RF-11** | Lista de deseos de mi amigo invisible | | | ✅ CP-E-10<br>✅ CP-E-12<br>✅ CP-I-27<br>✅ CP-P-02 |
| ↳ CA-11.1 | Dado que mi amigo invisible escribió ideas, cuando veo mi resultado, entonces aparecen sus ideas. | ✅ CP-E-12<br>✅ CP-I-27 | ✅ Verificado | |
| ↳ CA-11.2 | Solo veo la lista de deseos de mi amigo invisible, no la de otros. | ✅ CP-I-14 | ✅ Verificado | |
| ↳ CA-11.3 | Si mi amigo invisible cambia sus ideas después de que yo las haya visto, al volver a mirar veo la versión actualizada. | ✅ CP-E-12<br>✅ CP-I-27 | ✅ Verificado | |
| **RF-12** | Seguimiento del organizador | | | ✅ CP-E-03<br>✅ CP-I-29<br>✅ CP-U-31 |
| ↳ CA-12.1 | Cuando un participante elige su nombre, su estado pasa a "Ha entrado". | ✅ CP-E-03<br>✅ CP-I-29 | ✅ Verificado | |
| ↳ CA-12.2 | Cuando un participante ve su resultado, su estado pasa a "Ha visto a su amigo". | ✅ CP-E-03<br>✅ CP-I-29 | ✅ Verificado | |
| ↳ CA-12.3 | La pantalla del organizador nunca muestra asignaciones ni listas de deseos. | ✅ CP-I-14 | ✅ Verificado | |
| **RF-13** | Recordatorio por WhatsApp | | | ✅ CP-C-05 |
| ↳ CA-13.1 | Cuando lo pulso, se abre WhatsApp con: "🎁 Recordatorio del amigo invisible «{grupo}»: si todavía no has mirado a quién regalas, toca aquí:  | ✅ CP-C-05 | ✅ Verificado | |
| **RF-14** | Dejar entrar de nuevo (liberar nombre) | | | ✅ CP-E-06<br>✅ CP-I-30 |
| ↳ CA-14.1 | Dado un participante "Ha entrado", cuando el organizador pulsa "Dejar entrar de nuevo" y confirma, entonces el nombre vuelve a estar libre y | ✅ CP-E-06<br>✅ CP-I-30 | ✅ Verificado | |
| ↳ CA-14.2 | El móvil anterior, al volver a entrar, ve la lista de nombres. | ✅ CP-E-06<br>✅ CP-I-30 | ✅ Verificado | |
| **RF-15** | "No soy yo" | | | ✅ CP-E-13<br>✅ CP-I-31 |
| ↳ CA-15.1 | Dado que elegí un nombre y no he visto el resultado, cuando pulso "No soy yo" y confirmo, entonces el nombre queda libre y vuelvo a la lista | ✅ CP-E-13<br>✅ CP-I-31 | ✅ Verificado | |
| ↳ CA-15.2 | Dado que ya vi el resultado, la opción no aparece (debe pedirlo al organizador, RF-14). | ✅ CP-E-13<br>✅ CP-I-31 | ✅ Verificado | |
| **RF-16** | Borrar el grupo | | | ✅ CP-E-07<br>✅ CP-I-32<br>✅ CP-P-02 |
| ↳ CA-16.1 | Cuando confirmo el borrado, entonces el grupo y todos sus datos desaparecen y cualquiera que abra el enlace ve "Este amigo invisible ya no e | ✅ CP-E-07<br>✅ CP-I-32 | ✅ Verificado | |
| **RF-17** | Borrado automático | — | *Eliminado* | — |
| **RF-18** | Mis grupos | | | ✅ CP-C-01<br>✅ CP-C-03<br>✅ CP-E-08 |
| ↳ CA-18.1 | Dado que organizo un grupo y participo en otro, cuando abro la portada, veo ambos con la etiqueta "Organizas" / "Participas". | ✅ CP-E-08 | ✅ Verificado | |
| ↳ CA-18.2 | Los grupos borrados desaparecen de la lista al detectarse. | ✅ CP-E-07 | ✅ Verificado | |
| **RF-19** | Ayuda y privacidad | — | *Eliminado* | — |
| **RF-20** | Mensajes de error comprensibles | | | ✅ CP-C-04<br>✅ CP-E-14<br>✅ CP-E-15<br>✅ CP-I-33<br>✅ CP-I-34 |
| ↳ CA-20.1 | Enlace mal copiado o inexistente → "No encontramos este amigo invisible. Revisa que el enlace esté completo." + botón "Ir al inicio". | ✅ CP-C-04<br>✅ CP-E-14<br>✅ CP-I-33 | ✅ Verificado | |
| ↳ CA-20.2 | Sin conexión → "No hay conexión a Internet. Revisa tu conexión y vuelve a intentarlo." + botón "Reintentar". | ✅ CP-C-04<br>✅ CP-E-15 | ✅ Verificado | |
| ↳ CA-20.3 | Demasiados intentos (límite anti-abuso) → "Espera un minuto y vuelve a intentarlo." | ✅ CP-C-04<br>✅ CP-I-34 | ✅ Verificado | |
| ↳ CA-20.4 | Error inesperado del servidor → "Algo ha fallado. Vuelve a intentarlo en un momento." Nunca se muestran códigos técnicos. | ✅ CP-C-04 | ✅ Verificado | |
| **RNF-01** | Accesibilidad: WCAG 2.2 nivel AA en todas las pantallas; contraste de texto ≥ 7:1 (AAA) | ✅ CP-A-01<br>✅ CP-A-03<br>✅ CP-C-07<br>✅ CP-P-03 | ✅ Verificado | |
| **RNF-02** | Usabilidad mayores: Letra base ≥ 20 px; botones ≥ 56 px de alto y ≥ 8 px de separación; una acción principal por pantalla; sin gestos especi | ✅ CP-A-01<br>✅ CP-A-02<br>✅ CP-C-07 | ✅ Verificado | |
| **RNF-03** | Usabilidad mayores: Desde el enlace, ver a quién regalo requiere como máximo 3 toques (nombre → "Sí, soy yo" → "Ver a quién regalo") | ✅ CP-E-10<br>✅ CP-P-02 | ✅ Verificado | |
| **RNF-04** | Diseño adaptable: Mobile-first. Funciona de 320 px a 1440 px de ancho sin desplazamiento horizontal, y con el texto del sistema ampliado al  | ✅ CP-A-01<br>✅ CP-A-02 | ✅ Verificado | |
| **RNF-05** | Compatibilidad: Safari iOS 15+, Chrome Android 100+, Samsung Internet 20+, y navegador interno al abrir desde WhatsApp | ✅ CP-C-02 | ✅ Verificado | |
| **RNF-06** | Rendimiento: Carga inicial < 2,5 s en 4G; JavaScript inicial < 120 KB comprimido; respuesta de la API < 300 ms (p95) | ✅ CP-E-18<br>✅ CP-P-03 | ✅ Verificado | |
| **RNF-07** | Disponibilidad: Servicio sin "arranque en frío" ni suspensión por inactividad; ≥ 99,9 % | ✅ CP-P-02 | ✅ Verificado | |
| **RNF-08** | Seguridad: Ver modelo de amenazas `SEC`: identificadores y secretos ≥ 128 bits aleatorios, secretos guardados con hash, validación estricta, | ✅ CP-E-17<br>✅ CP-I-34<br>✅ CP-I-35<br>✅ CP-I-36<br>✅ CP-I-37<br>✅ CP-P-01<br>✅ CP-U-26 | ✅ Verificado | |
| **RNF-09** | Privacidad: Solo se guardan nombres de pila y listas de deseos. Sin cookies de seguimiento ni analítica de terceros (no requiere banner de c | ✅ CP-E-17<br>✅ CP-P-01 | ✅ Verificado | |
| **RNF-10** | Mantenibilidad: TypeScript estricto, lint sin avisos, cobertura ≥ 90 % en lógica de dominio, CI en cada cambio, documentación de mantenimien | Mantenibilidad: TypeScript estricto, ESLint sin avisos, cobertura ≥ 90 % del dominio (umbral en `vitest.config.ts`), CI en cada cambio (`.github/workflows/ci.yml`, `vitest.config.ts`) | 📝 Revisión | |
| **RNF-11** | Coste y operación: 0 €/mes en el plan gratuito; despliegue automático; sin servidores que mantener | Coste 0 €: plan gratuito de Workers (100.000 peticiones/día) y D1 (5 GB); despliegue automático desde CI (ADR-0002, ADR-0014) | 📝 Revisión | |
| **RNF-12** | Idioma: Español de España, lenguaje llano; textos centralizados en un único fichero | Idioma: todos los textos visibles están en `src/client/i18n/es.ts`; revisión de lenguaje llano con la guía `elderly-friendly-ux` (`src/client/i18n/es.ts`) | 📝 Revisión | |
| **RNF-13** | Observabilidad: Registros de errores sin datos personales (sin nombres, listas ni secretos) | Observabilidad: el único registro (`app.onError`) escribe método, ruta, nombre y mensaje del error, sin cuerpos, cabeceras ni nombres (`src/worker/app.ts`) | 📝 Revisión | |
| **RNF-14** | Navegación sencilla: El participante tiene todo en una pantalla personal: ver a quién regala y escribir sus ideas están a 1 toque. El organi | ✅ CP-E-10 | ✅ Verificado | |

## Amenazas y decisiones de seguridad → pruebas

| Referencia | Pruebas |
|---|---|
| ADR-0008 | ✅ CP-I-37 |
| ADR-0011 | ✅ CP-E-17<br>✅ CP-I-36<br>✅ CP-P-01 |
| AME-03 | ✅ CP-I-14<br>✅ CP-I-26 |
| AME-04 | ✅ CP-I-26 |
| AME-05 | ✅ CP-I-37 |
| AME-07 | ✅ CP-U-04<br>✅ CP-U-05 |
| AME-08 | ✅ CP-E-16<br>✅ CP-I-07<br>✅ CP-U-11 |
| AME-09 | ✅ CP-E-17<br>✅ CP-I-36<br>✅ CP-P-01 |
| AME-10 | ✅ CP-E-17<br>✅ CP-I-36<br>✅ CP-P-01 |
| AME-11 | ✅ CP-I-34 |
| AME-12 | ✅ CP-I-34 |
| AME-14 | ✅ CP-I-16<br>✅ CP-I-21 |
| AME-15 | ✅ CP-I-35 |
