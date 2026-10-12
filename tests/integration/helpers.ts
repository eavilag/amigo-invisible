import { exports } from 'cloudflare:workers';
import type { AdminGroup, ClaimResponse, CreateGroupResponse, MeResponse, PublicGroup, RevealResponse } from '../../src/shared/api-types';

let ipCounter = 0;
/** IP distinta por petición para no activar los límites salvo en las pruebas que lo buscan. */
export const freshIp = () => `10.0.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`;

export interface CallOptions {
  body?: unknown;
  rawBody?: string;
  token?: string;
  ip?: string;
}

export async function call(method: string, path: string, options: CallOptions = {}): Promise<Response> {
  const headers: Record<string, string> = { 'CF-Connecting-IP': options.ip ?? freshIp() };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  let body: string | undefined;
  if (options.rawBody !== undefined) body = options.rawBody;
  else if (options.body !== undefined) body = JSON.stringify(options.body);
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return exports.default.fetch(new Request(`https://amigo.test${path}`, { method, headers, body }));
}

export async function json<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function expectError(response: Response, status: number, code: string) {
  const body = await json<{ error: string }>(response);
  return { status: response.status, body, ok: response.status === status && body.error === code };
}

export interface TestGroup {
  gid: string;
  adminKey: string;
  participants: { id: string; name: string }[];
}

export async function createGroup(names = ['Carmen', 'Paco', 'Rosa', 'Lucía'], extra: Record<string, unknown> = {}): Promise<TestGroup> {
  const res = await call('POST', '/api/groups', { body: { name: 'Navidad Familia', participants: names, ...extra } });
  if (res.status !== 201) throw new Error(`createGroup ${res.status} ${await res.text()}`);
  const { groupId, adminKey } = await json<CreateGroupResponse>(res);
  const group = await json<PublicGroup>(await call('GET', `/api/groups/${groupId}`));
  return { gid: groupId, adminKey, participants: group.participants.map(({ id, name }) => ({ id, name })) };
}

export async function claim(gid: string, participantId: string): Promise<string> {
  const res = await call('POST', `/api/groups/${gid}/claim`, { body: { participantId } });
  if (res.status !== 200) throw new Error(`claim ${res.status} ${await res.text()}`);
  return (await json<ClaimResponse>(res)).participantToken;
}

export async function claimAll(group: TestGroup): Promise<Map<string, string>> {
  const tokens = new Map<string, string>();
  for (const p of group.participants) tokens.set(p.name, await claim(group.gid, p.id));
  return tokens;
}

export const draw = (group: TestGroup, redo = false) =>
  call('POST', `/api/groups/${group.gid}/admin/draw`, { token: group.adminKey, body: { redo } });

export async function reveal(gid: string, token: string): Promise<RevealResponse['receiver']> {
  const res = await call('POST', `/api/groups/${gid}/me/reveal`, { token });
  if (res.status !== 200) throw new Error(`reveal ${res.status} ${await res.text()}`);
  return (await json<RevealResponse>(res)).receiver;
}

export const adminView = async (group: TestGroup) =>
  json<AdminGroup>(await call('GET', `/api/groups/${group.gid}/admin`, { token: group.adminKey }));

export const me = async (gid: string, token: string) => json<MeResponse>(await call('GET', `/api/groups/${gid}/me`, { token }));

/** Recorre el círculo de asignaciones (nombre → nombre) y devuelve su longitud. */
export function cycleLength(assignments: Map<string, string>): number {
  const start = assignments.keys().next().value!;
  let current = start;
  let length = 0;
  do {
    current = assignments.get(current)!;
    length++;
  } while (current !== start && length <= assignments.size);
  return length;
}
