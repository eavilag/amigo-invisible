---
name: sdd-threat-model
description: Build or update a STRIDE threat model (assets, trust boundaries, threats AME-NN with controls, ADR and residual risk) plus OWASP Top 10 mapping for a web app exposed to the internet. Use before implementing security-relevant code and before every public deployment.
---

# SDD · Modelo de amenazas

1. Fichero `docs/04-seguridad/modelo-amenazas.md` con cabecera versionada.
2. **Activos** (qué se protege y por qué) y **fronteras de confianza** (Internet→servidor, servidor→BD, navegador, CI→nube).
3. Tabla de amenazas: `ID | STRIDE | Amenaza | Controles | ADR | Riesgo residual`. Revisa como mínimo:
   - Suplantación / robo de secretos; IDOR y control de acceso por recurso; elevación entre roles/tenants.
   - XSS almacenado, inyección SQL, clickjacking, filtración por Referer/indexación/vistas previas.
   - Condiciones de carrera en operaciones únicas; aleatoriedad predecible.
   - DoS y agotamiento de cuota gratuita; relleno de BD.
   - Cadena de suministro y secretos de CI; datos personales en logs.
4. Tabla de correspondencia OWASP Top 10.
5. Sección "Riesgos aceptados" enlazando los ADR correspondientes.
6. Cada control debe tener una prueba en la matriz de trazabilidad (pruebas negativas de autorización, cabeceras verificadas en producción).
