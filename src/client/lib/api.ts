import type { AdminGroup, ClaimResponse, CreateGroupResponse, MeResponse, PublicGroup, RevealResponse } from '../../shared/api-types';
import { type ApiErrorBody, type ErrorCode, isErrorCode } from '../../shared/errors';
import type { CreateGroupRequest, PatchGroupRequest } from '../../shared/schemas';

/** Error de la API ya clasificado. `NETWORK` = sin conexión (CA-20.2). */
export class ApiClientError extends Error {
  constructor(
    readonly code: ErrorCode | 'NETWORK',
    readonly details: Omit<ApiErrorBody, 'error'> = {},
  ) {
    super(code);
  }
}

async function request<T>(method: string, path: string, options: { body?: unknown; secret?: string } = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.secret) headers.Authorization = `Bearer ${options.secret}`;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: 'omit',
      cache: 'no-store',
    });
  } catch {
    throw new ApiClientError('NETWORK');
  }
  if (response.status === 204) return undefined as T;

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiClientError(response.ok ? 'INTERNAL' : 'NETWORK');
  }
  if (!response.ok) {
    const body = data as Partial<ApiErrorBody>;
    const { error, ...details } = body;
    throw new ApiClientError(isErrorCode(error) ? error : 'INTERNAL', details);
  }
  return data as T;
}

const g = (gid: string) => `/groups/${encodeURIComponent(gid)}`;

export const api = {
  createGroup: (body: CreateGroupRequest) => request<CreateGroupResponse>('POST', '/groups', { body }),
  getGroup: (gid: string) => request<PublicGroup>('GET', g(gid)),
  claim: (gid: string, participantId: string, currentToken?: string) =>
    request<ClaimResponse>('POST', `${g(gid)}/claim`, { body: { participantId }, secret: currentToken }),

  me: (gid: string, token: string) => request<MeResponse>('GET', `${g(gid)}/me`, { secret: token }),
  reveal: (gid: string, token: string) => request<RevealResponse>('POST', `${g(gid)}/me/reveal`, { secret: token }),
  saveWishlist: (gid: string, token: string, wishlist: string) =>
    request<void>('PUT', `${g(gid)}/me/wishlist`, { secret: token, body: { wishlist } }),
  releaseSelf: (gid: string, token: string) => request<void>('DELETE', `${g(gid)}/me/claim`, { secret: token }),

  admin: (gid: string, key: string) => request<AdminGroup>('GET', `${g(gid)}/admin`, { secret: key }),
  updateGroup: (gid: string, key: string, body: PatchGroupRequest) => request<void>('PATCH', `${g(gid)}/admin`, { secret: key, body }),
  draw: (gid: string, key: string, redo = false) => request<void>('POST', `${g(gid)}/admin/draw`, { secret: key, body: { redo } }),
  undoDraw: (gid: string, key: string) => request<void>('DELETE', `${g(gid)}/admin/draw`, { secret: key }),
  release: (gid: string, key: string, pid: string) =>
    request<void>('POST', `${g(gid)}/admin/participants/${encodeURIComponent(pid)}/release`, { secret: key }),
  deleteGroup: (gid: string, key: string) => request<void>('DELETE', `${g(gid)}/admin`, { secret: key }),
};
