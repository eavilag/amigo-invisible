# Documentación del proyecto · Amigo Invisible

Este proyecto sigue **Spec Driven Development (SDD)**: la especificación es la fuente de verdad, y el código, las pruebas y la documentación derivan de ella con trazabilidad completa.

## Mapa de artefactos

| Fase | Carpeta | Artefacto principal | ID |
|---|---|---|---|
| 0 · Principios | [00-constitucion](00-constitucion/) | Constitución del proyecto | `CONST` |
| 1 · Especificación | [01-especificacion](01-especificacion/) | Especificación de requisitos (HU, RF, RNF, CA) | `SPEC` |
| 2 · Experiencia de usuario | [02-ux](02-ux/) | Diseño UX + prototipo navegable | `UX` |
| 3 · Arquitectura | [03-arquitectura](03-arquitectura/) | Arquitectura, modelo de datos, contrato API, ADRs | `ARQ`, `ADR-NNNN` |
| 4 · Seguridad | [04-seguridad](04-seguridad/) | Modelo de amenazas y controles | `SEC` |
| 5 · Plan | [05-plan](05-plan/) | Plan técnico y tareas | `PLAN`, `TAREAS` |
| 6 · Pruebas | [06-pruebas](06-pruebas/) | Plan de pruebas, matriz de trazabilidad, evidencias | `PRU`, `TRAZ` |
| 7 · Despliegue | [07-despliegue](07-despliegue/) | Guía de despliegue y runbook | `DESP` |
| 8 · Guía de usuario | [08-guia-usuario](08-guia-usuario/) | Guía para personas mayores | `GUIA` |
| 9 · Mantenimiento | [09-mantenimiento](09-mantenimiento/) | Manual de mantenimiento | `MANT` |

## Convenciones de identificadores

| Prefijo | Significado | Ejemplo |
|---|---|---|
| `HU-NN` | Historia de usuario | `HU-03` |
| `RF-NN` | Requisito funcional | `RF-07` |
| `RNF-NN` | Requisito no funcional | `RNF-02` |
| `CA-NN.M` | Criterio de aceptación M del requisito NN | `CA-07.2` |
| `ADR-NNNN` | Registro de decisión de arquitectura/seguridad | `ADR-0004` |
| `AME-NN` | Amenaza del modelo de amenazas | `AME-05` |
| `CP-XXX-NN` | Caso de prueba (U=unitaria, I=integración, E=extremo a extremo, A=accesibilidad, P=producción) | `CP-E-04` |

## Versionado de artefactos

- Cada documento lleva una **cabecera** con `ID`, `Versión`, `Estado` y `Fecha`, y una tabla de **historial** al final.
- Versionado **SemVer** de documentos:
  - **MAYOR**: cambio de alcance aprobado (añadir/eliminar requisitos).
  - **MENOR**: ampliaciones que no cambian el alcance (aclaraciones, nuevos criterios).
  - **PARCHE**: erratas y correcciones de redacción.
- **Estados**: `Borrador` → `En revisión` → `Aprobado` → (`Obsoleto`).
- Cada hito validado (puerta de calidad) se fija con una **etiqueta Git**:
  - `spec-v1.0.0` — especificación aprobada
  - `ux-v1.0.0` — diseño UX aprobado
  - `v1.0.0` — versión de la aplicación publicada
- La aplicación sigue SemVer y su historial está en [`CHANGELOG.md`](../CHANGELOG.md).

## Puertas de validación (con el propietario del producto)

| Puerta | Qué se valida | Estado |
|---|---|---|
| P1 | Requisitos (`SPEC`) | Pendiente |
| P2 | Diseño UX y guía de usuario temprana (`UX`, `GUIA`) | Pendiente |
| P3 | Plan de despliegue y cuenta en la nube | Pendiente |
| P4 | Pruebas de aceptación en producción | Pendiente |
