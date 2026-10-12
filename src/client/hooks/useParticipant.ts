import type { MeResponse, PublicGroup } from '../../shared/api-types';
import { api, ApiClientError } from '../lib/api';
import { forgetGroup, getStoredGroup, updateStoredGroup } from '../lib/storage';

/** Token guardado en este móvil para el grupo, si lo hay. */
export const storedToken = (gid: string) => getStoredGroup(gid)?.participantToken;

/** Olvida el token si el servidor ya no lo reconoce (liberado o quitado, CA-08.2). */
export function dropToken(gid: string) {
  updateStoredGroup(gid, { participantToken: undefined, participantName: undefined });
}

/** Si el grupo ya no existe, se olvida localmente (CA-18.2). */
export function handleGone(gid: string, error: unknown): never {
  if (error instanceof ApiClientError && error.code === 'NOT_FOUND') forgetGroup(gid);
  throw error;
}

export interface ParticipantData {
  group: PublicGroup;
  me: MeResponse | null;
}

/** Carga el grupo y, si este móvil ya eligió nombre, sus datos personales (RF-07, RF-08). */
export async function loadParticipant(gid: string): Promise<ParticipantData> {
  let group: PublicGroup;
  try {
    group = await api.getGroup(gid);
  } catch (error) {
    handleGone(gid, error);
  }
  const token = storedToken(gid);
  if (!token) return { group, me: null };
  try {
    const me = await api.me(gid, token);
    updateStoredGroup(gid, { name: group.name, participantName: me.participant.name });
    return { group, me };
  } catch (error) {
    if (error instanceof ApiClientError && error.code === 'UNAUTHORIZED') {
      dropToken(gid);
      return { group, me: null };
    }
    throw error;
  }
}
