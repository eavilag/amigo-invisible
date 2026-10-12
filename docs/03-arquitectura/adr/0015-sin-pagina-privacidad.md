# ADR-0015: Sin página de privacidad dedicada

**Estado:** Aceptado · **Fecha:** 2026-10-12 · **Decide:** Propietario · **Tipo:** Privacidad · **Requisitos:** RF-19 (eliminado), CA-01.8, RNF-09

## Contexto
SPEC 0.1 incluía páginas "¿Cómo funciona?" y "Privacidad". El propietario las consideró innecesarias.

## Decisión
No hay página de privacidad. La información esencial se da en una línea en la pantalla de crear: qué se guarda y que se puede borrar todo (CA-01.8).

## Compromisos
- El RGPD (art. 13) exige informar a los interesados cuando se tratan datos personales. Para un uso doméstico entre familiares puede aplicar la exención de actividades exclusivamente personales (art. 2.2.c), pero **si la aplicación se abre al público general, convendría añadir un aviso de privacidad completo**. Se registra como riesgo conocido.
- Mitigaciones: minimización extrema (solo nombres de pila e ideas), sin cookies ni analítica (no requiere banner), borrado inmediato a petición del organizador.

## Consecuencias
- Reabrir esta decisión solo requiere una ruta estática nueva; no afecta a la arquitectura.
