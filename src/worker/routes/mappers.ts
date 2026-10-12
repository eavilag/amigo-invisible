import type { GroupInfo } from '../../shared/api-types';
import type { GroupRow } from '../db/repo';

export function toGroupInfo(group: GroupRow): GroupInfo {
  return {
    id: group.id,
    name: group.name,
    deliveryDate: group.deliveryDate,
    budget: group.budget,
    drawn: group.drawnAt !== null,
  };
}

export const nowIso = (): string => new Date().toISOString();
