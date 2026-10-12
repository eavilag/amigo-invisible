import { Hono } from 'hono';
import type { ClaimResponse, CreateGroupResponse, PublicGroup } from '../../shared/api-types';
import { isPastDate } from '../../shared/dates';
import { nameKey } from '../../shared/normalize';
import { claimRequestSchema, createGroupRequestSchema } from '../../shared/schemas';
import { claimParticipant, findParticipant, findParticipantByTokenHash, insertGroup, listParticipants } from '../db/repo';
import { ApiError, parseJson } from '../http';
import { bearerSecret, loadGroup } from '../security/auth';
import { newId, newSecret, sha256Hex } from '../security/crypto';
import type { AppEnv } from '../types';
import { nowIso, toGroupInfo } from './mappers';

export const publicRoutes = new Hono<AppEnv>();

/** Crear grupo (RF-01, RF-02). La clave de organizador solo se devuelve aquí. */
publicRoutes.post('/groups', async (c) => {
  const body = await parseJson(c.req.raw, createGroupRequestSchema);
  if (body.deliveryDate && isPastDate(body.deliveryDate)) throw new ApiError('DATE_IN_PAST');

  const groupId = newId();
  const adminKey = newSecret();
  await insertGroup(
    c.env.DB,
    { id: groupId, adminKeyHash: await sha256Hex(adminKey), name: body.name, deliveryDate: body.deliveryDate, budget: body.budget },
    body.participants.map((name) => ({ id: newId(), name, nameKey: nameKey(name) })),
    nowIso(),
  );
  return c.json<CreateGroupResponse>({ groupId, adminKey }, 201);
});

/** Datos para elegir nombre (RF-07). Nunca incluye asignaciones ni listas de deseos (AME-03). */
publicRoutes.get('/groups/:gid', loadGroup, async (c) => {
  const group = c.get('group');
  const participants = await listParticipants(c.env.DB, group.id);
  return c.json<PublicGroup>({
    ...toGroupInfo(group),
    participants: participants.map((p) => ({ id: p.id, name: p.name, claimed: p.tokenHash !== null })),
  });
});

/** Elegir mi nombre (RF-07, CA-07.3–5). */
publicRoutes.post('/groups/:gid/claim', loadGroup, async (c) => {
  const group = c.get('group');
  const { participantId } = await parseJson(c.req.raw, claimRequestSchema);

  const existing = bearerSecret(c.req.header('Authorization'));
  if (existing && (await findParticipantByTokenHash(c.env.DB, group.id, await sha256Hex(existing)))) {
    throw new ApiError('DEVICE_HAS_NAME');
  }
  if (!(await findParticipant(c.env.DB, group.id, participantId))) throw new ApiError('NOT_FOUND');

  const participantToken = newSecret();
  const claimed = await claimParticipant(c.env.DB, group.id, participantId, await sha256Hex(participantToken), nowIso());
  if (!claimed) throw new ApiError('ALREADY_CLAIMED');
  return c.json<ClaimResponse>({ participantToken, participantId });
});
