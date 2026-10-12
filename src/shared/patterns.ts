/** Formatos de identificadores y secretos (ADR-0006). Sin dependencias, para no cargar zod en el cliente. */
export const ID_PATTERN = /^[A-Za-z0-9_-]{22}$/;
export const SECRET_PATTERN = /^[A-Za-z0-9_-]{43}$/;
