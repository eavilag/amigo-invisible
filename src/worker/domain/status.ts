import type { ParticipantStatus } from '../../shared/api-types';

/** Estado de un participante visto por el organizador (SPEC RF-12). */
export function participantStatus(p: { tokenHash: string | null; viewedAt: string | null }): ParticipantStatus {
  if (p.tokenHash === null) return 'out';
  return p.viewedAt === null ? 'in' : 'seen';
}
