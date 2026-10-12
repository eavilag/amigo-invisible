import { Hono } from 'hono';
import type { AdminGroup } from '../../shared/api-types';
import { isPastDate } from '../../shared/dates';
import { nameKey } from '../../shared/normalize';
import { drawRequestSchema, idSchema, patchGroupRequestSchema } from '../../shared/schemas';
import { clearDraw, deleteGroup, listParticipants, releaseParticipant, replaceParticipants, saveDraw, updateGroupFields } from '../db/repo';
import { drawCircle } from '../domain/draw';
import { participantStatus } from '../domain/status';
import { ApiError, parseJson } from '../http';
import { requireAdmin } from '../security/auth';
import { newId } from '../security/crypto';
import type { AppEnv } from '../types';
import { nowIso, toGroupInfo } from './mappers';

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.use('/groups/:gid/admin', requireAdmin);
adminRoutes.use('/groups/:gid/admin/*', requireAdmin);

/** Panel del organizador (RF-12). Nunca incluye asignaciones ni listas de deseos (CA-12.3). */
adminRoutes.get('/groups/:gid/admin', async (c) => {
  const group = c.get('group');
  const participants = await listParticipants(c.env.DB, group.id);
  return c.json<AdminGroup>({
    ...toGroupInfo(group),
    participants: participants.map((p) => ({ id: p.id, name: p.name, status: participantStatus(p) })),
  });
});

/** Cambiar datos y participantes (RF-04, CA-05.4). */
adminRoutes.patch('/groups/:gid/admin', async (c) => {
  const group = c.get('group');
  const body = await parseJson(c.req.raw, patchGroupRequestSchema);
  const now = nowIso();

  const deliveryDate = body.deliveryDate === undefined ? undefined : body.deliveryDate || null;
  if (deliveryDate && deliveryDate !== group.deliveryDate && isPastDate(deliveryDate)) throw new ApiError('DATE_IN_PAST');

  if (body.participants) {
    if (group.drawnAt !== null) throw new ApiError('ALREADY_DRAWN');
    const currentIds = new Set((await listParticipants(c.env.DB, group.id)).map((p) => p.id));
    if (body.participants.some((p) => p.id !== undefined && !currentIds.has(p.id))) {
      throw new ApiError('VALIDATION', { field: 'participants' });
    }
    const changes = body.participants.map((p) => ({
      id: p.id ?? newId(),
      name: p.name,
      nameKey: nameKey(p.name),
      isNew: p.id === undefined,
    }));
    if (!(await replaceParticipants(c.env.DB, group.id, changes, now))) throw new ApiError('ALREADY_DRAWN');
  }

  await updateGroupFields(c.env.DB, group.id, { name: body.name, deliveryDate, budget: body.budget }, now);
  return c.body(null, 204);
});

/** Hacer el sorteo (RF-05) o repetirlo (RF-06). */
adminRoutes.post('/groups/:gid/admin/draw', async (c) => {
  const group = c.get('group');
  const { redo } = await parseJson(c.req.raw, drawRequestSchema);
  if (group.drawnAt !== null && !redo) throw new ApiError('ALREADY_DRAWN');

  const participants = await listParticipants(c.env.DB, group.id);
  if (participants.length < 3) throw new ApiError('TOO_FEW');
  const assignments = drawCircle(participants.map((p) => p.id));
  if (!(await saveDraw(c.env.DB, group.id, group.drawVersion, assignments, nowIso()))) throw new ApiError('CONFLICT');
  return c.body(null, 204);
});

/** Deshacer el sorteo para cambiar participantes (RF-06). */
adminRoutes.delete('/groups/:gid/admin/draw', async (c) => {
  if (!(await clearDraw(c.env.DB, c.get('group').id, nowIso()))) throw new ApiError('NOT_DRAWN');
  return c.body(null, 204);
});

/** Dejar entrar de nuevo (RF-14). */
adminRoutes.post('/groups/:gid/admin/participants/:pid/release', async (c) => {
  const pid = c.req.param('pid');
  if (!idSchema.safeParse(pid).success) throw new ApiError('NOT_FOUND');
  if (!(await releaseParticipant(c.env.DB, c.get('group').id, pid, nowIso()))) throw new ApiError('NOT_FOUND');
  return c.body(null, 204);
});

/** Borrar el grupo y todos sus datos (RF-16). */
adminRoutes.delete('/groups/:gid/admin', async (c) => {
  await deleteGroup(c.env.DB, c.get('group').id);
  return c.body(null, 204);
});
