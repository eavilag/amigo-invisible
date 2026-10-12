| ID | Versión | Estado | Fecha |
|---|---|---|---|
| CONST | 2.0.0 | Aprobado | 2026-10-12 |

# Constitución del proyecto

Principios no negociables. Cualquier decisión de diseño, código o despliegue que entre en conflicto con ellos debe justificarse en un ADR.

## 1. La persona mayor manda
El usuario de referencia es una persona de más de 75 años, con poca destreza con el móvil, vista cansada y miedo a "romper algo". Si una pantalla no la entiende ella, la pantalla está mal.
- Una sola acción principal por pantalla.
- Textos cortos, en español llano, sin anglicismos ("enlace", no "link"; nada de "login", "token", "app").
- Letra grande (mínimo 20 px de base), botones grandes (mínimo 56 px de alto), alto contraste.
- Nada de gestos ocultos, menús hamburguesa, temporizadores ni ventanas emergentes inesperadas.
- Sin registro, sin contraseñas, sin descargar nada: abrir el enlace y listo.

## 2. Privacidad por defecto
- Se recoge el mínimo imprescindible: nombres de pila y la lista de deseos. Nada de teléfonos, correos ni cuentas.
- Nadie, tampoco el organizador ni el administrador del sistema a través de la aplicación, ve emparejamientos ajenos.
- Quien organiza puede borrar todos los datos del grupo en cualquier momento, de forma inmediata y definitiva.

## 3. Seguro en Internet desde el primer día
- Identificadores imposibles de adivinar, secretos guardados con hash, validación estricta de toda entrada, cabeceras de seguridad, sin scripts de terceros y límites de uso frente a abusos.

## 4. La especificación es la fuente de verdad
- Ningún código sin requisito; ningún requisito sin criterio de aceptación; ningún criterio sin prueba que lo demuestre.
- La trazabilidad requisito → prueba → evidencia se mantiene en `docs/06-pruebas/matriz-trazabilidad.md`.

## 5. Sencillez y cero mantenimiento
- Lo más simple que funcione. Un único servicio en la nube, gratuito y gestionado.
- Dependencias mínimas y populares. Sin servidores que parchear.

## 6. Calidad verificable
- TypeScript estricto, lint y pruebas automáticas en cada cambio (integración continua).
- Las pruebas extremo a extremo se ejecutan también contra producción tras cada despliegue.

## Historial
| Versión | Fecha | Cambio |
|---|---|---|
| 1.0.0 | 2026-10-11 | Versión inicial |
| 2.0.0 | 2026-10-12 | §2: se sustituye el borrado automático por el borrado inmediato a cargo del organizador (decisión del propietario: sin procesos recurrentes) |
