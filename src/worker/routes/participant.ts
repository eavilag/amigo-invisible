import { Hono } from 'hono';
import type { MeResponse, RevealResponse } from '../../shared/api-types';
import { wishlistRequestSchema } from '../../shared/schemas';
import { findParticipant, markViewed, releaseOwnClaim, updateWishlist } from '../db/repo';
import { ApiError, parseJson } from '../http';
import { requireParticipant } from '../security/auth';
import type { AppEnv } from '../types';
import { nowIso, toGroupInfo } from './mappers';

export const participantRoutes = new Hono<AppEnv>();

participantRoutes.use('/groups/:gid/me', requireParticipant);
participantRoutes.use('/groups/:gid/me/*', requireParticipant);

/** Mi pantalla personal (RF-08). */
participantRoutes.get('/groups/:gid/me', (c) => {
  const me = c.get('participant');
  return c.json<MeResponse>({
    group: toGroupInfo(c.get('group')),
    participant: { id: me.id, name: me.name, wishlist: me.wishlist, viewed: me.viewedAt !== null },
  });
});

/** Ver a quién regalo (RF-09, RF-11). Solo la asignación propia (CA-09.3). */
participantRoutes.post('/groups/:gid/me/reveal', async (c) => {
  const group = c.get('group');
  const me = c.get('participant');
  if (group.drawnAt === null || me.receiverId === null) throw new ApiError('NOT_DRAWN');

  const receiver = await findParticipant(c.env.DB, group.id, me.receiverId);
  if (!receiver) throw new ApiError('CONFLICT');
  await markViewed(c.env.DB, me.id, nowIso());
  return c.json<RevealResponse>({ receiver: { name: receiver.name, wishlist: receiver.wishlist } });
});

/** Guardar mi lista de deseos (RF-10), antes o después del sorteo. */
participantRoutes.put('/groups/:gid/me/wishlist', async (c) => {
  const { wishlist } = await parseJson(c.req.raw, wishlistRequestSchema);
  await updateWishlist(c.env.DB, c.get('participant').id, wishlist, nowIso());
  return c.body(null, 204);
});

/** "No soy yo" (RF-15). */
participantRoutes.delete('/groups/:gid/me/claim', async (c) => {
  const released = await releaseOwnClaim(c.env.DB, c.get('participant').id, nowIso());
  if (!released) throw new ApiError('ALREADY_VIEWED');
  return c.body(null, 204);
});
