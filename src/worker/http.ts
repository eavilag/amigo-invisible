import type { z } from 'zod';
import { type ApiErrorBody, type ErrorCode, ERROR_STATUS, isErrorCode } from '../shared/errors';
import { LIMITS } from '../shared/limits';

/** Error de dominio que se traduce a una respuesta JSON con código (RF-20). */
export class ApiError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly details: Omit<ApiErrorBody, 'error'> = {},
  ) {
    super(code);
  }

  get status(): number {
    return ERROR_STATUS[this.code];
  }

  toBody(): ApiErrorBody {
    return { error: this.code, ...this.details };
  }
}

/** Traduce un error de zod al código de API más específico posible. */
export function fromZodError(error: z.ZodError): ApiError {
  const issue = error.issues[0];
  if (!issue) return new ApiError('VALIDATION');
  const field = issue.path.join('.') || undefined;

  if (issue.code === 'custom') {
    const params = (issue as { params?: { apiCode?: unknown; name?: unknown } }).params;
    if (params && isErrorCode(params.apiCode)) {
      return new ApiError(params.apiCode, typeof params.name === 'string' ? { name: params.name } : {});
    }
  }
  if (issue.path.length === 1 && issue.path[0] === 'participants') {
    if (issue.code === 'too_small') return new ApiError('TOO_FEW');
    if (issue.code === 'too_big') return new ApiError('TOO_MANY');
  }
  return new ApiError('VALIDATION', field ? { field } : {});
}

/** Lee y valida el cuerpo JSON; un cuerpo vacío se trata como `{}`. */
export async function parseJson<S extends z.ZodType>(request: Request, schema: S): Promise<z.output<S>> {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > LIMITS.bodyBytesMax) throw new ApiError('PAYLOAD_TOO_LARGE');

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > LIMITS.bodyBytesMax) throw new ApiError('PAYLOAD_TOO_LARGE');

  let data: unknown = {};
  if (text.trim() !== '') {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError('VALIDATION');
    }
  }
  const result = schema.safeParse(data);
  if (!result.success) throw fromZodError(result.error);
  return result.data;
}
