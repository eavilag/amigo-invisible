import { useState } from 'react';
import type { AdminGroup } from '../../shared/api-types';
import { SECRET_PATTERN } from '../../shared/patterns';
import { api, ApiClientError } from '../lib/api';
import { forgetGroup, getStoredGroup, updateStoredGroup } from '../lib/storage';
import { useLoad } from './useLoad';

/**
 * Si la URL trae la clave de organizador en el fragmento (#…), la guarda y la borra de
 * la barra de direcciones para que no quede a la vista (ADR-0006).
 */
function captureAdminKey(gid: string): string | undefined {
  const fromHash = window.location.hash.slice(1);
  if (fromHash && SECRET_PATTERN.test(fromHash)) {
    updateStoredGroup(gid, { adminKey: fromHash });
    window.history.replaceState(window.history.state, '', window.location.pathname);
    return fromHash;
  }
  return getStoredGroup(gid)?.adminKey;
}

export type AdminLoadResult = { kind: 'ok'; group: AdminGroup; adminKey: string } | { kind: 'invalid' } | { kind: 'gone' };

/** Carga el panel del organizador distinguiendo clave inválida (CA-02.3) de grupo borrado (CA-16.1). */
export function useAdminGroup(gid: string) {
  const [adminKey] = useState(() => captureAdminKey(gid));
  return useLoad<AdminLoadResult>(
    async () => {
      if (!adminKey) return { kind: 'invalid' };
      try {
        const group = await api.admin(gid, adminKey);
        updateStoredGroup(gid, { name: group.name });
        return { kind: 'ok', group, adminKey };
      } catch (error) {
        if (!(error instanceof ApiClientError) || error.code !== 'UNAUTHORIZED') throw error;
        try {
          await api.getGroup(gid);
        } catch (inner) {
          if (inner instanceof ApiClientError && inner.code === 'NOT_FOUND') {
            forgetGroup(gid);
            return { kind: 'gone' };
          }
          throw inner;
        }
        updateStoredGroup(gid, { adminKey: undefined });
        return { kind: 'invalid' };
      }
    },
    `${gid}:${adminKey ?? ''}`,
  );
}
