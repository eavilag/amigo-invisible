/**
 * Acceso a datos (ARQ §4). ÚNICO módulo con SQL; siempre con parámetros enlazados (AME-15).
 */

export interface GroupRow {
  id: string;
  name: string;
  deliveryDate: string | null;
  budget: string | null;
  drawVersion: number;
  drawnAt: string | null;
}

export interface ParticipantRow {
  id: string;
  groupId: string;
  name: string;
  position: number;
  tokenHash: string | null;
  receiverId: string | null;
  viewedAt: string | null;
  wishlist: string;
}

const GROUP_COLUMNS = `id, name, delivery_date AS deliveryDate, budget, draw_version AS drawVersion, drawn_at AS drawnAt`;
const PARTICIPANT_COLUMNS = `id, group_id AS groupId, name, position, token_hash AS tokenHash,
  receiver_id AS receiverId, viewed_at AS viewedAt, wishlist`;

export interface NewParticipant {
  id: string;
  name: string;
  nameKey: string;
}

export async function insertGroup(
  db: D1Database,
  group: { id: string; adminKeyHash: string; name: string; deliveryDate: string | null; budget: string | null },
  participants: readonly NewParticipant[],
  now: string,
): Promise<void> {
  await db.batch([
    db
      .prepare(
        `INSERT INTO groups (id, admin_key_hash, name, delivery_date, budget, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)`,
      )
      .bind(group.id, group.adminKeyHash, group.name, group.deliveryDate, group.budget, now),
    ...participants.map((p, position) =>
      db
        .prepare(
          `INSERT INTO participants (id, group_id, name, name_key, position, created_at, updated_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)`,
        )
        .bind(p.id, group.id, p.name, p.nameKey, position, now),
    ),
  ]);
}

export function findGroup(db: D1Database, gid: string): Promise<GroupRow | null> {
  return db.prepare(`SELECT ${GROUP_COLUMNS} FROM groups WHERE id = ?1`).bind(gid).first<GroupRow>();
}

export function findGroupByAdminKeyHash(db: D1Database, gid: string, adminKeyHash: string): Promise<GroupRow | null> {
  return db.prepare(`SELECT ${GROUP_COLUMNS} FROM groups WHERE id = ?1 AND admin_key_hash = ?2`).bind(gid, adminKeyHash).first<GroupRow>();
}

export async function listParticipants(db: D1Database, gid: string): Promise<ParticipantRow[]> {
  const { results } = await db
    .prepare(`SELECT ${PARTICIPANT_COLUMNS} FROM participants WHERE group_id = ?1 ORDER BY position, id`)
    .bind(gid)
    .all<ParticipantRow>();
  return results;
}

export function findParticipant(db: D1Database, gid: string, pid: string): Promise<ParticipantRow | null> {
  return db
    .prepare(`SELECT ${PARTICIPANT_COLUMNS} FROM participants WHERE group_id = ?1 AND id = ?2`)
    .bind(gid, pid)
    .first<ParticipantRow>();
}

export function findParticipantByTokenHash(db: D1Database, gid: string, tokenHash: string): Promise<ParticipantRow | null> {
  return db
    .prepare(`SELECT ${PARTICIPANT_COLUMNS} FROM participants WHERE group_id = ?1 AND token_hash = ?2`)
    .bind(gid, tokenHash)
    .first<ParticipantRow>();
}

/** Asocia un móvil a un nombre solo si está libre (CA-07.4). Devuelve false si ya estaba elegido. */
export async function claimParticipant(db: D1Database, gid: string, pid: string, tokenHash: string, now: string): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE participants SET token_hash = ?3, claimed_at = ?4, viewed_at = NULL, updated_at = ?4
       WHERE group_id = ?1 AND id = ?2 AND token_hash IS NULL`,
    )
    .bind(gid, pid, tokenHash, now)
    .run();
  return result.meta.changes === 1;
}

/** Libera el nombre (RF-14). La asignación del sorteo no cambia. */
export async function releaseParticipant(db: D1Database, gid: string, pid: string, now: string): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE participants SET token_hash = NULL, claimed_at = NULL, viewed_at = NULL, updated_at = ?3
       WHERE group_id = ?1 AND id = ?2`,
    )
    .bind(gid, pid, now)
    .run();
  return result.meta.changes === 1;
}

/** "No soy yo" (RF-15): solo si todavía no ha visto el resultado. */
export async function releaseOwnClaim(db: D1Database, pid: string, now: string): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE participants SET token_hash = NULL, claimed_at = NULL, updated_at = ?2
       WHERE id = ?1 AND viewed_at IS NULL`,
    )
    .bind(pid, now)
    .run();
  return result.meta.changes === 1;
}

export async function markViewed(db: D1Database, pid: string, now: string): Promise<void> {
  await db.prepare(`UPDATE participants SET viewed_at = COALESCE(viewed_at, ?2) WHERE id = ?1`).bind(pid, now).run();
}

export async function updateWishlist(db: D1Database, pid: string, wishlist: string, now: string): Promise<void> {
  await db.prepare(`UPDATE participants SET wishlist = ?2, updated_at = ?3 WHERE id = ?1`).bind(pid, wishlist, now).run();
}

export async function updateGroupFields(
  db: D1Database,
  gid: string,
  fields: { name?: string; deliveryDate?: string | null; budget?: string | null },
  now: string,
): Promise<void> {
  const sets: string[] = [];
  const values: (string | null)[] = [];
  const add = (column: string, value: string | null) => {
    values.push(value);
    sets.push(`${column} = ?${values.length + 1}`);
  };
  if (fields.name !== undefined) add('name', fields.name);
  if (fields.deliveryDate !== undefined) add('delivery_date', fields.deliveryDate);
  if (fields.budget !== undefined) add('budget', fields.budget);
  if (sets.length === 0) return;
  values.push(now);
  sets.push(`updated_at = ?${values.length + 1}`);
  // Los nombres de columna son constantes del código, nunca entrada de usuario.
  await db
    .prepare(`UPDATE groups SET ${sets.join(', ')} WHERE id = ?1`)
    .bind(gid, ...values)
    .run();
}

export interface ParticipantChange {
  id: string;
  name: string;
  nameKey: string;
  isNew: boolean;
}

/**
 * Sustituye la lista de participantes (RF-04) en una transacción, solo si no hay sorteo.
 * Devuelve false si el grupo ya estaba sorteado (ninguna sentencia aplica cambios).
 */
export async function replaceParticipants(
  db: D1Database,
  gid: string,
  desired: readonly ParticipantChange[],
  now: string,
): Promise<boolean> {
  const notDrawn = `(SELECT drawn_at FROM groups WHERE id = ?1) IS NULL`;
  const keepIds = desired.filter((p) => !p.isNew).map((p) => p.id);
  const placeholders = keepIds.map((_, i) => `?${i + 2}`).join(', ');

  const guard = db.prepare(`UPDATE groups SET updated_at = ?2 WHERE id = ?1 AND drawn_at IS NULL`).bind(gid, now);
  const remove = db
    .prepare(`DELETE FROM participants WHERE group_id = ?1 AND ${notDrawn}` + (keepIds.length ? ` AND id NOT IN (${placeholders})` : ''))
    .bind(gid, ...keepIds);
  // Dos fases para permitir intercambiar nombres sin violar UNIQUE(group_id, name_key).
  const tempKeys = desired
    .filter((p) => !p.isNew)
    .map((p) => db.prepare(`UPDATE participants SET name_key = '#' || id WHERE group_id = ?1 AND id = ?2 AND ${notDrawn}`).bind(gid, p.id));
  const upserts = desired.map((p, position) =>
    p.isNew
      ? db
          .prepare(
            `INSERT INTO participants (id, group_id, name, name_key, position, created_at, updated_at)
             SELECT ?2, ?1, ?3, ?4, ?5, ?6, ?6 WHERE ${notDrawn}`,
          )
          .bind(gid, p.id, p.name, p.nameKey, position, now)
      : db
          .prepare(
            `UPDATE participants SET name = ?3, name_key = ?4, position = ?5, updated_at = ?6
             WHERE group_id = ?1 AND id = ?2 AND ${notDrawn}`,
          )
          .bind(gid, p.id, p.name, p.nameKey, position, now),
  );
  const results = await db.batch([guard, remove, ...tempKeys, ...upserts]);
  return results[0]!.meta.changes === 1;
}

/**
 * Guarda un sorteo con control optimista (CA-05.5): las asignaciones solo se escriben si
 * `draw_version` sigue siendo la leída; después se incrementa. Todo en una transacción.
 * Devuelve false si otro sorteo se adelantó.
 */
export async function saveDraw(
  db: D1Database,
  gid: string,
  expectedVersion: number,
  assignments: ReadonlyMap<string, string>,
  now: string,
): Promise<boolean> {
  const cases: string[] = [];
  const values: string[] = [];
  for (const [giver, receiver] of assignments) {
    values.push(giver, receiver);
    // Tras el push, el par ocupa las posiciones length-1 y length de `values`, desplazadas 2 por ?1 y ?2.
    cases.push(`WHEN ?${values.length + 1} THEN ?${values.length + 2}`);
  }
  // ?1 = gid, ?2 = versión esperada, después pares (quien regala, a quien regala).
  const assign = db
    .prepare(
      `UPDATE participants SET receiver_id = CASE id ${cases.join(' ')} END, viewed_at = NULL
       WHERE group_id = ?1 AND (SELECT draw_version FROM groups WHERE id = ?1) = ?2`,
    )
    .bind(gid, expectedVersion, ...values);
  const bump = db
    .prepare(
      `UPDATE groups SET draw_version = draw_version + 1, drawn_at = ?3, updated_at = ?3
       WHERE id = ?1 AND draw_version = ?2`,
    )
    .bind(gid, expectedVersion, now);
  const [, bumped] = await db.batch([assign, bump]);
  return bumped!.meta.changes === 1;
}

/** Deshace el sorteo (RF-06). Devuelve false si no había sorteo. */
export async function clearDraw(db: D1Database, gid: string, now: string): Promise<boolean> {
  const [, cleared] = await db.batch([
    db
      .prepare(
        `UPDATE participants SET receiver_id = NULL, viewed_at = NULL
         WHERE group_id = ?1 AND (SELECT drawn_at FROM groups WHERE id = ?1) IS NOT NULL`,
      )
      .bind(gid),
    db
      .prepare(
        `UPDATE groups SET drawn_at = NULL, draw_version = draw_version + 1, updated_at = ?2
         WHERE id = ?1 AND drawn_at IS NOT NULL`,
      )
      .bind(gid, now),
  ]);
  return cleared!.meta.changes === 1;
}

/** Borra el grupo y todos sus datos (RF-16). */
export async function deleteGroup(db: D1Database, gid: string): Promise<void> {
  await db.batch([
    db.prepare(`UPDATE participants SET receiver_id = NULL WHERE group_id = ?1`).bind(gid),
    db.prepare(`DELETE FROM participants WHERE group_id = ?1`).bind(gid),
    db.prepare(`DELETE FROM groups WHERE id = ?1`).bind(gid),
  ]);
}
