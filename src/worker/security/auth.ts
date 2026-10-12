import { createMiddleware } from 'hono/factory';
import { idSchema, secretSchema } from '../../shared/schemas';
import { findGroupByAdminKeyHash, findGroup, findParticipantByTokenHash } from '../db/repo';
import { ApiError } from '../http';
import type { AppEnv } from '../types';
import { sha256Hex } from './crypto';

/** Extrae el secreto de `Authorization: Bearer …` validando su forma. */
export function bearerSecret(header: string | undefined): string | null {
  const match = /^Bearer (\S+)$/.exec(header ?? '');
  if (!match) return null;
  return secretSchema.safeParse(match[1]).success ? match[1]! : null;
}

function groupIdParam(raw: string | undefined): string {
  if (!idSchema.safeParse(raw).success) throw new ApiError('NOT_FOUND');
  return raw!;
}

/** Carga el grupo de la ruta (`:gid`) o responde NOT_FOUND. */
export const loadGroup = createMiddleware<AppEnv>(async (c, next) => {
  const group = await findGroup(c.env.DB, groupIdParam(c.req.param('gid')));
  if (!group) throw new ApiError('NOT_FOUND');
  c.set('group', group);
  await next();
});

/**
 * Exige la clave de organizador DEL GRUPO DE LA RUTA (ADR-0006, AME-02, AME-04).
 * Un grupo inexistente y una clave incorrecta responden igual (sin oráculo).
 */
export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const gid = groupIdParam(c.req.param('gid'));
  const secret = bearerSecret(c.req.header('Authorization'));
  if (!secret) throw new ApiError('UNAUTHORIZED');
  const group = await findGroupByAdminKeyHash(c.env.DB, gid, await sha256Hex(secret));
  if (!group) throw new ApiError('UNAUTHORIZED');
  c.set('group', group);
  await next();
});

/** Exige un token de participante que pertenezca al grupo de la ruta (AME-03, AME-04). */
export const requireParticipant = createMiddleware<AppEnv>(async (c, next) => {
  const gid = groupIdParam(c.req.param('gid'));
  const secret = bearerSecret(c.req.header('Authorization'));
  if (!secret) throw new ApiError('UNAUTHORIZED');
  const [group, participant] = await Promise.all([
    findGroup(c.env.DB, gid),
    findParticipantByTokenHash(c.env.DB, gid, await sha256Hex(secret)),
  ]);
  if (!group) throw new ApiError('NOT_FOUND');
  if (!participant) throw new ApiError('UNAUTHORIZED');
  c.set('group', group);
  c.set('participant', participant);
  await next();
});
