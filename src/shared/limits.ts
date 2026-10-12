/** Límites de negocio (SPEC RF-01, RF-10). Única fuente de verdad para cliente y servidor. */
export const LIMITS = {
  groupNameMax: 60,
  personNameMax: 30,
  budgetMax: 30,
  wishlistMax: 500,
  participantsMin: 3,
  participantsMax: 40,
  /** Tamaño máximo del cuerpo de una petición (ADR-0012). */
  bodyBytesMax: 16 * 1024,
} as const;

/** Zona horaria de referencia para decidir si una fecha "ya ha pasado" (CA-01.5). */
export const REFERENCE_TIME_ZONE = 'Europe/Madrid';
