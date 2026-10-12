import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import type { PublicGroup } from '../../src/shared/api-types';
import { todayIso } from '../../src/shared/dates';
import { call, claim, createGroup, expectError, json, me } from './helpers';

describe('API pública', () => {
  it('CP-I-01 [RF-01][CA-01.1][RF-02] crea un grupo y devuelve identificador y clave de organizador con la entropía exigida', async () => {
    const res = await call('POST', '/api/groups', {
      body: { name: ' Navidad  Familia 2027 ', deliveryDate: '2099-12-24', budget: '20 €', participants: ['Carmen', 'Paco', 'Rosa'] },
    });
    expect(res.status).toBe(201);
    const { groupId, adminKey } = await json<{ groupId: string; adminKey: string }>(res);
    expect(groupId).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(adminKey).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const group = await json<PublicGroup>(await call('GET', `/api/groups/${groupId}`));
    expect(group).toMatchObject({ id: groupId, name: 'Navidad Familia 2027', deliveryDate: '2099-12-24', budget: '20 €', drawn: false });
    expect(group.participants.map((p) => p.name)).toEqual(['Carmen', 'Paco', 'Rosa']);
    expect(group.participants.every((p) => p.claimed === false)).toBe(true);
  });

  it('CP-I-02 [RF-01][CA-01.2] con 2 personas responde TOO_FEW', async () => {
    const r = await expectError(await call('POST', '/api/groups', { body: { name: 'G', participants: ['A', 'B'] } }), 400, 'TOO_FEW');
    expect(r.ok).toBe(true);
  });

  it('CP-I-03 [RF-01][CA-01.3] nombres iguales sin mayúsculas ni acentos responden DUPLICATE_NAME', async () => {
    const res = await call('POST', '/api/groups', { body: { name: 'G', participants: ['María', 'Pepe', 'maria '] } });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'DUPLICATE_NAME', name: 'María' });
  });

  it('CP-I-04 [RF-01][CA-01.4] con 41 personas responde TOO_MANY y con 40 se crea', async () => {
    const names = Array.from({ length: 41 }, (_, i) => `Persona ${i + 1}`);
    expect((await expectError(await call('POST', '/api/groups', { body: { name: 'G', participants: names } }), 400, 'TOO_MANY')).ok).toBe(
      true,
    );
    expect((await call('POST', '/api/groups', { body: { name: 'G', participants: names.slice(0, 40) } })).status).toBe(201);
  });

  it('CP-I-05 [RF-01][CA-01.5] una fecha pasada responde DATE_IN_PAST y la de hoy se acepta', async () => {
    const body = { name: 'G', participants: ['A', 'B', 'C'] };
    expect(
      (await expectError(await call('POST', '/api/groups', { body: { ...body, deliveryDate: '2020-01-01' } }), 400, 'DATE_IN_PAST')).ok,
    ).toBe(true);
    expect((await call('POST', '/api/groups', { body: { ...body, deliveryDate: todayIso() } })).status).toBe(201);
  });

  it('CP-I-06 [RF-01][CA-01.6] nombre vacío o largo responde VALIDATION con el campo afectado', async () => {
    const res = await call('POST', '/api/groups', { body: { name: 'G', participants: ['A', 'x'.repeat(31), 'C'] } });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'VALIDATION', field: 'participants.1' });
    const empty = await call('POST', '/api/groups', { body: { name: '', participants: ['A', 'B', 'C'] } });
    expect(await empty.json()).toEqual({ error: 'VALIDATION', field: 'name' });
  });

  it('CP-I-07 [RF-01][CA-01.7][AME-08] el HTML se guarda y devuelve como texto literal', async () => {
    const group = await createGroup(['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', 'Rosa']);
    expect(group.participants.map((p) => p.name)).toEqual(['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', 'Rosa']);
  });

  it('CP-I-19 [RF-07][CA-07.1][CA-07.6] elegir nombre antes del sorteo devuelve un token y el nombre queda ocupado', async () => {
    const group = await createGroup();
    const token = await claim(group.gid, group.participants[1]!.id);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const view = await json<PublicGroup>(await call('GET', `/api/groups/${group.gid}`));
    expect(view.participants[1]!.claimed).toBe(true);
    expect((await me(group.gid, token)).participant.name).toBe('Paco');
  });

  it('CP-I-20 [RF-07][CA-07.3] un nombre ya elegido responde ALREADY_CLAIMED', async () => {
    const group = await createGroup();
    await claim(group.gid, group.participants[0]!.id);
    const res = await call('POST', `/api/groups/${group.gid}/claim`, { body: { participantId: group.participants[0]!.id } });
    expect((await expectError(res, 409, 'ALREADY_CLAIMED')).ok).toBe(true);
  });

  it('CP-I-21 [RF-07][CA-07.4][AME-14] si dos móviles eligen el mismo nombre a la vez, solo uno lo consigue', async () => {
    const group = await createGroup();
    const pid = group.participants[2]!.id;
    const responses = await Promise.all(
      Array.from({ length: 5 }, () => call('POST', `/api/groups/${group.gid}/claim`, { body: { participantId: pid } })),
    );
    const statuses = responses.map((r) => r.status).sort();
    expect(statuses).toEqual([200, 409, 409, 409, 409]);
  });

  it('CP-I-22 [RF-07][CA-07.5] un móvil que ya tiene nombre en el grupo no puede elegir otro (DEVICE_HAS_NAME)', async () => {
    const group = await createGroup();
    const token = await claim(group.gid, group.participants[0]!.id);
    const res = await call('POST', `/api/groups/${group.gid}/claim`, { token, body: { participantId: group.participants[1]!.id } });
    expect((await expectError(res, 409, 'DEVICE_HAS_NAME')).ok).toBe(true);
  });

  it('CP-I-23 [RF-07] elegir un participante que no es del grupo responde NOT_FOUND', async () => {
    const a = await createGroup();
    const b = await createGroup();
    const res = await call('POST', `/api/groups/${a.gid}/claim`, { body: { participantId: b.participants[0]!.id } });
    expect((await expectError(res, 404, 'NOT_FOUND')).ok).toBe(true);
  });

  it('CP-I-33 [RF-20][CA-20.1] grupo inexistente, identificador mal formado o ruta desconocida responden NOT_FOUND', async () => {
    expect((await expectError(await call('GET', '/api/groups/AAAAAAAAAAAAAAAAAAAAAA'), 404, 'NOT_FOUND')).ok).toBe(true);
    expect((await expectError(await call('GET', '/api/groups/abc'), 404, 'NOT_FOUND')).ok).toBe(true);
    expect((await expectError(await call('GET', '/api/nada'), 404, 'NOT_FOUND')).ok).toBe(true);
  });

  it('CP-I-37 [RNF-08][AME-05][ADR-0008] la base de datos guarda solo el hash de los secretos', async () => {
    const group = await createGroup();
    const token = await claim(group.gid, group.participants[0]!.id);
    const row = await env.DB.prepare('SELECT admin_key_hash FROM groups WHERE id = ?').bind(group.gid).first<{ admin_key_hash: string }>();
    const p = await env.DB.prepare('SELECT token_hash FROM participants WHERE id = ?')
      .bind(group.participants[0]!.id)
      .first<{ token_hash: string }>();
    const sha = async (s: string) =>
      Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))), (b) =>
        b.toString(16).padStart(2, '0'),
      ).join('');
    expect(row!.admin_key_hash).toBe(await sha(group.adminKey));
    expect(p!.token_hash).toBe(await sha(token));
    expect(JSON.stringify([row, p])).not.toContain(group.adminKey);
  });
});
