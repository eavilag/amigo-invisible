| ID | Versión | Estado | Fecha |
|---|---|---|---|
| SPEC | 1.0.0 | Aprobado (Puerta P1, 2026-10-12) | 2026-10-12 |

# Especificación de requisitos · Amigo Invisible

## 1. Problema

Organizar un amigo invisible familiar por WhatsApp suele acabar con papelitos en una bolsa (imposible si la familia no está junta), con alguien que se "toca a sí mismo", o con un organizador que conoce todas las parejas. Las aplicaciones existentes piden registro, correo o descargar una app, lo que deja fuera a los mayores de la familia, que precisamente son quienes más disfrutan del juego.

## 2. Objetivos

| # | Objetivo | Cómo se mide |
|---|---|---|
| O1 | Una persona mayor ve a quién regala sin ayuda | ≥ 9 de cada 10 personas de +70 años lo consiguen en la prueba de usuario, en menos de 2 minutos desde que tocan el enlace |
| O2 | Organizar un sorteo es rápido | Crear grupo de 8 personas, sortear y compartir por WhatsApp en < 3 minutos |
| O3 | El sorteo es justo y secreto | 0 casos de autoasignación; ninguna vía en la aplicación para ver emparejamientos ajenos (verificado por pruebas) |
| O4 | Cero mantenimiento y coste | 0 €/mes; ninguna intervención manual necesaria tras el despliegue |

## 3. Fuera de alcance (no objetivos)

| No objetivo | Motivo |
|---|---|
| Cuentas de usuario, contraseñas, correo o teléfono | Barrera para mayores y datos personales innecesarios |
| Exclusiones (p. ej. parejas que no se tocan) | Decisión del propietario: simplicidad (puede añadirse en v2, ver §10) |
| PIN por persona | Decisión del propietario: un paso más para mayores |
| Notificaciones por correo, SMS o push | WhatsApp ya cumple ese papel; requeriría datos de contacto |
| Chat anónimo entre participantes | Complejidad; no es parte del juego básico |
| Varios idiomas | Público objetivo hispanohablante (los textos quedan centralizados para facilitarlo en el futuro) |
| App nativa / instalación | El enlace web es más sencillo |

## 4. Personas usuarias

- **Organizador/a ("Carmen", 45 años)**: maneja WhatsApp con soltura. Prepara el juego para la familia. Normalmente también participa.
- **Participante mayor ("Abuelo Paco", 82 años)**: usa WhatsApp para ver fotos y mensajes de voz. Toca enlaces que le mandan, pero se pierde con menús, letras pequeñas y formularios. Puede que tenga el tamaño de letra del móvil aumentado.
- **Participante joven ("Lucía", 16 años)**: se maneja perfectamente; quiere ir rápido.

## 5. Glosario

| Término | Definición |
|---|---|
| Grupo | Un juego de amigo invisible concreto (p. ej. "Navidad Familia 2027") |
| Enlace del grupo | Dirección web única del grupo que se comparte en WhatsApp. Sirve para entrar y elegir tu nombre |
| Enlace de organizador | Dirección web secreta que permite gestionar el grupo. Solo la tiene quien lo creó |
| Elegir nombre | Acción por la que un participante dice "soy yo" y su móvil queda asociado a ese nombre |
| Asignación | Persona a la que le toca regalar a cada participante |
| Lista de deseos | Texto libre con ideas de regalo que escribe cada participante |

## 6. Flujo principal

```
ORGANIZADOR                                   PARTICIPANTE
1. Entra en la web → "Crear amigo invisible"
2. Escribe nombre del grupo, fecha,
   presupuesto y los nombres
3. Pulsa "Hacer el sorteo"
4. Pulsa "Enviar por WhatsApp" → elige
   el grupo familiar                 ───────▶ 5. Toca el enlace en WhatsApp
                                              6. Toca su nombre → "Sí, soy yo"
                                              7. Toca "Ver a quién regalo"
                                              8. (Opcional) Escribe su lista de deseos
9. Ve quién ha mirado ya y recuerda
   a los que faltan por WhatsApp
```

### Flujo flexible
El flujo anterior es el habitual, pero **ningún paso obliga al siguiente**:
- El enlace del grupo existe desde el momento de crearlo: el organizador puede enviarlo por WhatsApp **antes de sortear**, dejar que cada persona elija su nombre y escriba sus ideas, corregir equivocaciones (nombres mal escritos, alguien que tocó el nombre de otro) y **sortear al final**, cuando todo esté bien.
- Cada participante puede escribir o cambiar sus ideas de regalo **en cualquier momento**, antes o después del sorteo.
- Tras el sorteo, cada participante puede consultar **en cualquier momento** a quién regala y las ideas de esa persona, siempre en su versión más reciente.
- Esta flexibilidad no añade pantallas ni pasos: el participante tiene todo en una única pantalla personal y el organizador en un único panel (RNF-14).

## 7. Historias de usuario

### Organizador
- **HU-01** Como organizador, quiero crear un amigo invisible escribiendo solo los nombres, para no tener que pedir datos a nadie.
- **HU-02** Como organizador, quiero hacer el sorteo con un botón, sin conocer el resultado, para poder participar yo también.
- **HU-03** Como organizador, quiero enviar un único enlace al grupo de WhatsApp, para no tener que escribir a cada persona.
- **HU-04** Como organizador, quiero ver quién ha visto ya a su amigo invisible, para recordárselo a quien falte.
- **HU-05** Como organizador, quiero poder corregir errores (un nombre mal escrito, alguien que eligió el nombre equivocado, alguien que cambió de móvil), para que nadie se quede fuera.
- **HU-06** Como organizador, quiero no perder el acceso a la gestión del grupo, para poder volver otro día.
- **HU-07** Como organizador, quiero borrar el grupo cuando termine, para no dejar datos en Internet.

### Participante
- **HU-08** Como participante mayor, quiero tocar el enlace, tocar mi nombre y ver a quién regalo, sin registrarme ni escribir nada.
- **HU-09** Como participante, quiero que al volver a abrir el enlace la web me recuerde, para no tener que volver a elegir.
- **HU-10** Como participante, quiero escribir ideas de regalo, para que quien me regale acierte.
- **HU-11** Como participante, quiero ver las ideas de regalo de mi amigo invisible, la fecha y el presupuesto, para comprar algo adecuado.
- **HU-12** Como participante, quiero saber que nadie más puede ver a quién regalo, para confiar en el juego.

## 8. Requisitos funcionales

Prioridad: **P0** imprescindible para publicar · **P1** importante, entra en v1 si no compromete P0 · **P2** futuro.

### RF-01 · Crear grupo — P0 — (HU-01)
El organizador crea un grupo con: nombre del grupo (obligatorio, 1–60 caracteres), fecha de entrega (opcional, no puede ser pasada), presupuesto (opcional, texto libre hasta 30 caracteres, p. ej. "20 €") y lista de participantes (3–40 nombres, 1–30 caracteres cada uno).

- **CA-01.1** Dado que estoy en la portada, cuando pulso "Crear amigo invisible", relleno el nombre del grupo y escribo 3 nombres y pulso "Crear", entonces se crea el grupo y veo la pantalla del organizador.
- **CA-01.2** Dado que escribo solo 2 nombres, cuando pulso "Crear", entonces no se crea y veo el mensaje "Hacen falta al menos 3 personas".
- **CA-01.3** Dado que escribo "María" y "maria " (o "MARIA", o "Maria"), cuando pulso "Crear", entonces veo "Hay dos nombres iguales: María". (Se comparan sin mayúsculas, acentos ni espacios sobrantes.)
- **CA-01.4** Dado que intento añadir el participante número 41, entonces el botón "Añadir" no lo permite y se indica "Máximo 40 personas".
- **CA-01.5** Dado que escribo una fecha pasada, cuando pulso "Crear", entonces veo "La fecha ya ha pasado".
- **CA-01.6** Dado un nombre vacío o de más de 30 caracteres, o un nombre de grupo vacío o de más de 60, entonces se indica el error junto al campo y no se crea el grupo.
- **CA-01.7** Los textos con etiquetas HTML o caracteres especiales (p. ej. `<script>`) se guardan y muestran como texto literal, nunca se interpretan.
- **CA-01.8** La pantalla de crear muestra una línea informativa: "Solo se guardan los nombres y las ideas de regalo. Puedes borrarlo todo cuando termine el juego." (sustituye a la página de privacidad, ver RF-19).

### RF-02 · Acceso del organizador — P0 — (HU-06)
Al crear el grupo se genera un enlace de organizador secreto. El dispositivo que creó el grupo lo recuerda automáticamente. Además se ofrece "Guardar mi enlace de organizador" (enviármelo por WhatsApp o copiarlo).

- **CA-02.1** Dado que he creado un grupo, cuando cierro y vuelvo a abrir la web en el mismo móvil, entonces veo el grupo en "Mis grupos" y puedo gestionarlo.
- **CA-02.2** Dado que abro el enlace de organizador en otro móvil, entonces puedo gestionar el grupo.
- **CA-02.3** Dado un enlace de organizador incorrecto o manipulado, entonces veo "Este enlace de organizador no es válido" y no accedo a nada.
- **CA-02.4** Con el enlace del grupo (el que se comparte) no se puede acceder a las funciones de organizador.

### RF-03 · Compartir el enlace del grupo — P0 — (HU-03)
La pantalla del organizador ofrece "Enviar por WhatsApp" (abre WhatsApp con un mensaje ya escrito que incluye el enlace del grupo) y "Copiar enlace".

- **CA-03.1** Cuando pulso "Enviar por WhatsApp", entonces se abre WhatsApp con el texto: "🎁 ¡Amigo invisible «{grupo}»! Toca este enlace, elige tu nombre y descubre a quién le haces el regalo: {enlace}".
- **CA-03.2** Cuando pulso "Copiar enlace", entonces el enlace se copia y veo "Enlace copiado".
- **CA-03.3** La vista previa del enlace en WhatsApp muestra un título genérico ("Amigo Invisible") y no revela nombres ni datos del grupo.
- **CA-03.4** Los botones de compartir están disponibles desde que se crea el grupo, sin necesidad de haber hecho el sorteo.

### RF-04 · Modificar el grupo antes del sorteo — P0 — (HU-05)
Antes del sorteo, el organizador puede cambiar nombre del grupo, fecha, presupuesto, y añadir, quitar o renombrar participantes, con las mismas reglas que RF-01.

- **CA-04.1** Dado un grupo sin sortear, cuando cambio "Pepe" por "José", entonces todos ven "José".
- **CA-04.2** Dado un grupo con 3 participantes, entonces no puedo quitar ninguno ("Hacen falta al menos 3 personas").
- **CA-04.3** Dado que quito a un participante que ya había elegido su nombre, entonces su móvil deja de estar asociado y, si vuelve a abrir el enlace, ve la lista de nombres.
- **CA-04.4** Dado un grupo sin sortear y con el enlace ya enviado, cuando corrijo nombres o dejo entrar de nuevo a alguien (RF-14), entonces no hay ninguna otra consecuencia, porque todavía no hay resultados.
- **CA-04.5** La opción de cambiar nombres y datos está a la vista en el panel mientras no se haya sorteado (no escondida en un menú).

### RF-05 · Hacer el sorteo — P0 — (HU-02, HU-12)
El organizador pulsa "Hacer el sorteo" y confirma. El sistema asigna a cada participante otra persona a quien regalar.

Reglas del sorteo:
1. Nadie se regala a sí mismo.
2. Cada persona da exactamente un regalo y recibe exactamente uno.
3. Con 3 o más personas no hay parejas cruzadas (si A regala a B, B no regala a A): se forma un único círculo.
4. Todas las combinaciones válidas en círculo tienen la misma probabilidad (aleatoriedad criptográfica).
5. El resultado no se muestra nunca al organizador como tal.

- **CA-05.1** Dado un grupo de N personas (3 ≤ N ≤ 40), cuando se sortea, entonces cada persona tiene exactamente una asignación, nadie se tiene a sí mismo y todos reciben un regalo.
- **CA-05.2** Dado un sorteo de 3 o más personas, entonces no existen parejas cruzadas y las asignaciones forman un único círculo.
- **CA-05.3** Tras sortear, la pantalla del organizador muestra "Sorteo hecho" pero no muestra quién regala a quién.
- **CA-05.4** Tras sortear, ya no se pueden añadir, quitar ni renombrar participantes (solo deshaciendo el sorteo, RF-06). Nombre del grupo, fecha y presupuesto sí se pueden cambiar.
- **CA-05.5** Si dos peticiones de sorteo llegan a la vez, solo una produce resultado (no hay sorteos mezclados).

### RF-06 · Repetir o deshacer el sorteo — P0 — (HU-05)
El organizador puede "Repetir el sorteo" o "Deshacer el sorteo para cambiar participantes". Si alguien ya había visto su resultado, se avisa claramente antes de confirmar: "{N} personas ya han visto a quién regalan. Si repites el sorteo, tendrán que volver a mirarlo."

- **CA-06.1** Dado un sorteo hecho, cuando lo repito y confirmo, entonces hay nuevas asignaciones válidas y todos los estados "Ha visto a su amigo" vuelven a "No lo ha visto".
- **CA-06.2** Dado un sorteo hecho, cuando lo deshago, entonces puedo editar participantes y los participantes ven "Todavía no se ha hecho el sorteo".
- **CA-06.3** Dado que cancelo la confirmación, entonces no cambia nada.

### RF-07 · Elegir mi nombre — P0 — (HU-08)
Al abrir el enlace del grupo, el participante ve el nombre del grupo, la fecha, el presupuesto y la lista de nombres en botones grandes. Toca el suyo y confirma ("¿Eres Pepe? · Sí, soy Pepe / No"). Su móvil queda asociado a ese nombre.

- **CA-07.1** Dado un nombre libre, cuando lo toco y confirmo, entonces queda asociado a mi móvil y paso a mi pantalla personal.
- **CA-07.2** Dado que pulso "No" en la confirmación, entonces vuelvo a la lista sin cambios.
- **CA-07.3** Dado un nombre que ya ha elegido otro móvil, entonces aparece como "Ya ha entrado" y no se puede elegir; al tocarlo se explica: "Si eres tú y has cambiado de móvil, pide a quien organiza que te deje entrar de nuevo".
- **CA-07.4** Si dos móviles intentan elegir el mismo nombre a la vez, solo uno lo consigue; el otro ve que ya está elegido.
- **CA-07.5** Un mismo móvil solo puede tener un nombre por grupo.
- **CA-07.6** El enlace funciona igual si el sorteo aún no se ha hecho.

### RF-08 · Recordar al participante — P0 — (HU-09)
En visitas posteriores desde el mismo móvil y navegador, el enlace del grupo lleva directamente a la pantalla personal.

- **CA-08.1** Dado que ya elegí mi nombre, cuando vuelvo a tocar el enlace, entonces veo directamente "Hola, Pepe".
- **CA-08.2** Dado que el organizador liberó mi nombre o me quitó del grupo, cuando vuelvo a entrar, entonces veo la lista de nombres de nuevo.

### RF-09 · Ver a quién regalo — P0 — (HU-08, HU-11, HU-12)
Si el sorteo está hecho, la pantalla personal muestra el botón "Ver a quién regalo". Al pulsarlo aparece el nombre en grande, junto a fecha, presupuesto y su lista de deseos. Se puede ver tantas veces como se quiera.

- **CA-09.1** Dado sorteo hecho, cuando pulso "Ver a quién regalo", entonces veo el nombre de mi amigo invisible y queda registrado que "Ha visto a su amigo".
- **CA-09.2** Dado sorteo no hecho, entonces veo "Todavía no se ha hecho el sorteo. Vuelve a abrir este enlace más adelante." y no hay botón de ver.
- **CA-09.3** El sistema solo devuelve la asignación del propio participante identificado. Ninguna petición (con o sin identificación, con el enlace del grupo o el de organizador) devuelve asignaciones de otras personas.

### RF-10 · Mi lista de deseos — P0 — (HU-10)
Cada participante puede escribir y cambiar en cualquier momento su lista de deseos (texto libre, hasta 500 caracteres).

- **CA-10.1** Cuando escribo mis ideas y pulso "Guardar", entonces veo "Guardado" y quien me regala lo ve.
- **CA-10.2** Un texto de más de 500 caracteres no se puede guardar y se muestra el contador.
- **CA-10.3** Puedo dejar la lista vacía.
- **CA-10.4** Puedo escribir y cambiar mi lista tanto antes como después del sorteo, con el mismo botón de mi pantalla personal.

### RF-11 · Lista de deseos de mi amigo invisible — P0 — (HU-11)
Junto al nombre de mi amigo invisible veo su lista de deseos, o "Todavía no ha escrito ideas" si está vacía.

- **CA-11.1** Dado que mi amigo invisible escribió ideas, cuando veo mi resultado, entonces aparecen sus ideas.
- **CA-11.2** Solo veo la lista de deseos de mi amigo invisible, no la de otros.
- **CA-11.3** Si mi amigo invisible cambia sus ideas después de que yo las haya visto, al volver a mirar veo la versión actualizada.

### RF-12 · Seguimiento del organizador — P0 — (HU-04)
La pantalla del organizador muestra cada participante con su estado: "Sin entrar", "Ha entrado" o "Ha visto a su amigo", y un resumen ("5 de 8 ya lo han visto").

- **CA-12.1** Cuando un participante elige su nombre, su estado pasa a "Ha entrado".
- **CA-12.2** Cuando un participante ve su resultado, su estado pasa a "Ha visto a su amigo".
- **CA-12.3** La pantalla del organizador nunca muestra asignaciones ni listas de deseos.

### RF-13 · Recordatorio por WhatsApp — P0 — (HU-04)
Botón "Recordar por WhatsApp" que abre WhatsApp con un mensaje de recordatorio y el enlace del grupo.

- **CA-13.1** Cuando lo pulso, se abre WhatsApp con: "🎁 Recordatorio del amigo invisible «{grupo}»: si todavía no has mirado a quién regalas, toca aquí: {enlace}".

### RF-14 · Dejar entrar de nuevo (liberar nombre) — P0 — (HU-05)
El organizador puede liberar el nombre de un participante que ya entró (cambio de móvil o nombre elegido por error). El móvil anterior deja de estar asociado.

- **CA-14.1** Dado un participante "Ha entrado", cuando el organizador pulsa "Dejar entrar de nuevo" y confirma, entonces el nombre vuelve a estar libre y la asignación del sorteo no cambia.
- **CA-14.2** El móvil anterior, al volver a entrar, ve la lista de nombres.

### RF-15 · "No soy yo" — P1 — (HU-05)
Tras elegir un nombre, y mientras no se haya visto el resultado, el participante puede pulsar "¿No eres Pepe? Toca aquí" para liberar el nombre por sí mismo.

- **CA-15.1** Dado que elegí un nombre y no he visto el resultado, cuando pulso "No soy yo" y confirmo, entonces el nombre queda libre y vuelvo a la lista.
- **CA-15.2** Dado que ya vi el resultado, la opción no aparece (debe pedirlo al organizador, RF-14).

### RF-16 · Borrar el grupo — P0 — (HU-07)
El organizador puede borrar el grupo y todos sus datos, con confirmación.

- **CA-16.1** Cuando confirmo el borrado, entonces el grupo y todos sus datos desaparecen y cualquiera que abra el enlace ve "Este amigo invisible ya no existe".

### RF-17 · ~~Borrado automático~~ — **Eliminado en v0.2.0**
Descartado por el propietario: no se quiere ningún proceso recurrente. Los datos se conservan hasta que el organizador borra el grupo (RF-16). Ver ADR de privacidad.

### RF-18 · Mis grupos — P1 — (HU-06, HU-09)
La portada muestra los grupos en los que este móvil participa u organiza, para entrar con un toque.

- **CA-18.1** Dado que organizo un grupo y participo en otro, cuando abro la portada, veo ambos con la etiqueta "Organizas" / "Participas".
- **CA-18.2** Los grupos borrados desaparecen de la lista al detectarse.

### RF-19 · ~~Ayuda y privacidad~~ — **Eliminado en v0.2.0**
Descartado por el propietario: las pantallas "¿Cómo funciona?" y "Privacidad" no son necesarias. La información imprescindible se da en una línea dentro de la pantalla de crear (CA-01.8).

### RF-20 · Mensajes de error comprensibles — P0
Ante cualquier fallo se muestra un mensaje en lenguaje llano con una única salida clara.

- **CA-20.1** Enlace mal copiado o inexistente → "No encontramos este amigo invisible. Revisa que el enlace esté completo." + botón "Ir al inicio".
- **CA-20.2** Sin conexión → "No hay conexión a Internet. Revisa tu conexión y vuelve a intentarlo." + botón "Reintentar".
- **CA-20.3** Demasiados intentos (límite anti-abuso) → "Espera un minuto y vuelve a intentarlo."
- **CA-20.4** Error inesperado del servidor → "Algo ha fallado. Vuelve a intentarlo en un momento." Nunca se muestran códigos técnicos.

## 9. Requisitos no funcionales

| ID | Categoría | Requisito | Verificación |
|---|---|---|---|
| RNF-01 | Accesibilidad | WCAG 2.2 nivel AA en todas las pantallas; contraste de texto ≥ 7:1 (AAA) | axe-core automático + revisión manual |
| RNF-02 | Usabilidad mayores | Letra base ≥ 20 px; botones ≥ 56 px de alto y ≥ 8 px de separación; una acción principal por pantalla; sin gestos especiales ni límites de tiempo; iconos siempre acompañados de texto | Revisión de diseño + pruebas E2E de tamaños |
| RNF-03 | Usabilidad mayores | Desde el enlace, ver a quién regalo requiere como máximo 3 toques (nombre → "Sí, soy yo" → "Ver a quién regalo") | Prueba E2E |
| RNF-04 | Diseño adaptable | Mobile-first. Funciona de 320 px a 1440 px de ancho sin desplazamiento horizontal, y con el texto del sistema ampliado al 200 % | Pruebas E2E en varios tamaños |
| RNF-05 | Compatibilidad | Safari iOS 15+, Chrome Android 100+, Samsung Internet 20+, y navegador interno al abrir desde WhatsApp | Pruebas E2E (WebKit y Chromium) + prueba manual |
| RNF-06 | Rendimiento | Carga inicial < 2,5 s en 4G; JavaScript inicial < 120 KB comprimido; respuesta de la API < 300 ms (p95) | Lighthouse + medición de bundle |
| RNF-07 | Disponibilidad | Servicio sin "arranque en frío" ni suspensión por inactividad; ≥ 99,9 % | Plataforma (ADR) |
| RNF-08 | Seguridad | Ver modelo de amenazas `SEC`: identificadores y secretos ≥ 128 bits aleatorios, secretos guardados con hash, validación estricta, cabeceras de seguridad (CSP, HSTS...), límites de uso, sin scripts de terceros, HTTPS obligatorio | Pruebas de seguridad automáticas + revisión |
| RNF-09 | Privacidad | Solo se guardan nombres de pila y listas de deseos. Sin cookies de seguimiento ni analítica de terceros (no requiere banner de cookies). Los datos se conservan hasta que el organizador borra el grupo (RF-16). No se indexa en buscadores | Revisión + pruebas |
| RNF-10 | Mantenibilidad | TypeScript estricto, lint sin avisos, cobertura ≥ 90 % en lógica de dominio, CI en cada cambio, documentación de mantenimiento | CI |
| RNF-11 | Coste y operación | 0 €/mes en el plan gratuito; despliegue automático; sin servidores que mantener | Plataforma (ADR) |
| RNF-12 | Idioma | Español de España, lenguaje llano; textos centralizados en un único fichero | Revisión |
| RNF-13 | Observabilidad | Registros de errores sin datos personales (sin nombres, listas ni secretos) | Revisión de código |
| RNF-14 | Navegación sencilla | El participante tiene todo en una pantalla personal: ver a quién regala y escribir sus ideas están a 1 toque. El organizador tiene todo en un único panel. Nunca más de 2 niveles de profundidad y siempre un botón "Volver" visible | Prueba E2E de recorridos |

## 10. Consideraciones futuras (P2)
Diseñar de forma que no se impida más adelante: exclusiones entre participantes, varios idiomas, PIN opcional, mostrar el resultado tras una fecha concreta, borrado por caducidad (descartado en v0.2.0, podría hacerse sin procesos recurrentes borrando al abrir un grupo caducado).

## 11. Preguntas abiertas
| # | Pregunta | Quién | ¿Bloquea? |
|---|---|---|---|
| PA-1 | ~~Dirección web definitiva~~ **Resuelta (2026-10-11):** subdominio gratuito `*.workers.dev`; un dominio propio puede añadirse más adelante sin cambios de código | Propietario | — |

## 12. Plan de fases
1. Especificación (esta) → **Puerta P1**
2. Diseño UX + prototipo + guía de usuario temprana → **Puerta P2**
3. Arquitectura, seguridad, plan y tareas
4. Implementación guiada por pruebas
5. Despliegue en Cloudflare → **Puerta P3**
6. Pruebas de aceptación en producción → **Puerta P4**

## Historial
| Versión | Fecha | Cambio |
|---|---|---|
| 0.1.0 | 2026-10-11 | Primer borrador para revisión (decisiones previas: enlace de grupo, lista de deseos, seguimiento, Cloudflare, repo público) |
| 0.1.1 | 2026-10-11 | PA-1 resuelta: subdominio gratuito workers.dev |
| 0.2.0 | 2026-10-12 | Revisión del propietario: se explicita el flujo flexible (§6, CA-03.4, CA-04.4, CA-04.5, CA-10.4, CA-11.3); nuevo RNF-14 de navegación; se eliminan RF-17 (borrado automático) y RF-19 (ayuda y privacidad); se añade CA-01.8 |
| 1.0.0 | 2026-10-12 | **Aprobada por el propietario (Puerta P1).** Línea base de requisitos |
