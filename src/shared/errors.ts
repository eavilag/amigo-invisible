/** Códigos de error de la API (contrato: docs/03-arquitectura/api/openapi.yaml). */
export const ERROR_STATUS = {
  VALIDATION: 400,
  TOO_FEW: 400,
  TOO_MANY: 400,
  DUPLICATE_NAME: 400,
  DATE_IN_PAST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  ALREADY_CLAIMED: 409,
  DEVICE_HAS_NAME: 409,
  ALREADY_DRAWN: 409,
  NOT_DRAWN: 409,
  ALREADY_VIEWED: 409,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  RATE_LIMITED: 429,
  INTERNAL: 500,
} as const;

export type ErrorCode = keyof typeof ERROR_STATUS;

export interface ApiErrorBody {
  error: ErrorCode;
  /** Campo afectado en errores de validación, p. ej. `participants.2`. */
  field?: string;
  /** Nombre afectado en DUPLICATE_NAME. */
  name?: string;
}

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && Object.hasOwn(ERROR_STATUS, value);
}
