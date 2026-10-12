/**
 * Recuerdo local de grupos y secretos (ADR-0006, RF-02, RF-08, RF-18).
 * localStorage puede no existir o fallar (modo privado): todo va envuelto en try/catch
 * y la aplicación sigue funcionando, aunque sin recordar.
 */

const KEY = 'amigo-invisible:v1';

export interface StoredGroup {
  name: string;
  adminKey?: string;
  participantToken?: string;
  participantName?: string;
  updatedAt: number;
}

type Store = Record<string, StoredGroup>;

function read(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Sin almacenamiento disponible: se ignora.
  }
}

export function getStoredGroup(gid: string): StoredGroup | undefined {
  return read()[gid];
}

export function listStoredGroups(): (StoredGroup & { gid: string })[] {
  return Object.entries(read())
    .map(([gid, group]) => ({ gid, ...group }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Mezcla los campos dados; `undefined` borra el campo. Si no queda ningún secreto, se olvida el grupo. */
export function updateStoredGroup(gid: string, patch: Partial<Omit<StoredGroup, 'updatedAt'>>): void {
  const store = read();
  const next: StoredGroup = { name: '', ...store[gid], updatedAt: Date.now() };
  for (const [field, value] of Object.entries(patch) as [keyof StoredGroup, string | undefined][]) {
    if (value === undefined) delete next[field];
    else (next as unknown as Record<string, string>)[field] = value;
  }
  if (!next.adminKey && !next.participantToken) delete store[gid];
  else store[gid] = next;
  write(store);
}

export function forgetGroup(gid: string): void {
  const store = read();
  delete store[gid];
  write(store);
}
