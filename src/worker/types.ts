import type { GroupRow, ParticipantRow } from './db/repo';

/** Tipos de contexto de Hono: bindings del Worker y variables por petición. */
export interface AppEnv {
  Bindings: Env;
  Variables: {
    group: GroupRow;
    participant: ParticipantRow;
  };
}
