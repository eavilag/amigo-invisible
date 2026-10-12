import { describe, expect, it } from 'vitest';
import type { PublicGroup } from '../../src/shared/api-types';
import { adminView, call, claim, claimAll, createGroup, cycleLength, draw, expectError, json, me, reveal, type TestGroup } from './helpers';

const patch = (group: { gid: string; adminKey: string }, body: unknown) =>
  call('PATCH', `/api/groups/${group.gid}/admin`, { token: group.adminKey, body });

describe('API del organizador', () => {
  it('CP-I-08 [RF-02][CA-02.2][CA-02.3][CA-02.4] la clave de organizador da acceso desde cualquier móvil; sin ella o incorrecta, no', async () => {
    const group = await createGroup();
    expect((await call('GET', `/api/groups/${group.gid}/admin`, { token: group.adminKey })).status).toBe(200);
    expect((await expectError(await call('GET', `/api/groups/${group.gid}/admin`), 401, 'UNAUTHORIZED')).ok).toBe(true);
    expect((await call('GET', `/api/groups/${group.gid}/admin`, { token: 'B'.repeat(43) })).status).toBe(401);
    const other = await createGroup();
    expect((await call('GET', `/api/groups/${group.gid}/admin`, { token: other.adminKey })).status).toBe(401);
    expect((await call('POST', `/api/groups/${group.gid}/admin/draw`, { token: other.adminKey })).status).toBe(401);
  });

  it('CP-I-09 [RF-04][CA-04.1] antes del sorteo se puede renombrar y todos ven el nombre nuevo', async () => {
    const group = await createGroup(['Carmen', 'Pepe', 'Rosa']);
    const participants = group.participants.map((p) => (p.name === 'Pepe' ? { id: p.id, name: 'José' } : p));
    expect((await patch(group, { participants, name: 'Navidad 2027', budget: '25 €' })).status).toBe(204);
    const view = await json<PublicGroup>(await call('GET', `/api/groups/${group.gid}`));
    expect(view.participants.map((p) => p.name)).toEqual(['Carmen', 'José', 'Rosa']);
    expect(view).toMatchObject({ name: 'Navidad 2027', budget: '25 €' });
    expect(view.participants[1]!.id).toBe(group.participants[1]!.id);
  });

  it('CP-I-10 [RF-04][CA-04.2] no se puede dejar el grupo con menos de 3 personas', async () => {
    const group = await createGroup(['A', 'B', 'C']);
    const res = await patch(group, { participants: group.participants.slice(0, 2) });
    expect((await expectError(res, 400, 'TOO_FEW')).ok).toBe(true);
  });

  it('CP-I-11 [RF-04][CA-04.3] quitar a alguien que ya eligió su nombre desasocia su móvil', async () => {
    const group = await createGroup();
    const token = await claim(group.gid, group.participants[3]!.id);
    expect((await patch(group, { participants: group.participants.slice(0, 3) })).status).toBe(204);
    expect((await call('GET', `/api/groups/${group.gid}/me`, { token })).status).toBe(401);
    expect((await adminView(group)).participants).toHaveLength(3);
  });

  it('CP-I-12 [RF-04][CA-04.4] antes del sorteo se pueden añadir personas e intercambiar nombres sin efectos secundarios', async () => {
    const group = await createGroup(['Ana', 'Luis', 'Eva']);
    const [ana, luis, eva] = group.participants as [
      TestGroup['participants'][number],
      TestGroup['participants'][number],
      TestGroup['participants'][number],
    ];
    const res = await patch(group, {
      participants: [{ id: ana.id, name: 'Luis' }, { id: luis.id, name: 'Ana' }, { id: eva.id, name: 'Eva' }, { name: 'Tía Luisa' }],
    });
    expect(res.status).toBe(204);
    const view = await adminView(group);
    expect(view.participants.map((p) => p.name)).toEqual(['Luis', 'Ana', 'Eva', 'Tía Luisa']);
    expect(view.participants[0]!.id).toBe(ana.id);
    // Identificadores de otro grupo se rechazan.
    const other = await createGroup();
    const bad = await patch(group, { participants: [...view.participants.slice(0, 3), { id: other.participants[0]!.id, name: 'X' }] });
    expect((await expectError(bad, 400, 'VALIDATION')).ok).toBe(true);
  });

  it('CP-I-14 [RF-05][CA-05.3][CA-12.3][CA-11.2][AME-03] ni el panel del organizador ni la vista pública revelan asignaciones ni listas de deseos', async () => {
    const group = await createGroup(['Carmen', 'Paco', 'Rosa']);
    const tokens = await claimAll(group);
    for (const token of tokens.values()) {
      await call('PUT', `/api/groups/${group.gid}/me/wishlist`, { token, body: { wishlist: 'SECRETO-DESEO' } });
    }
    await draw(group);
    const receiverNames = new Set<string>();
    for (const token of tokens.values()) receiverNames.add((await reveal(group.gid, token)).name);

    for (const res of [
      await call('GET', `/api/groups/${group.gid}/admin`, { token: group.adminKey }),
      await call('GET', `/api/groups/${group.gid}`),
    ]) {
      const text = await res.text();
      expect(text).not.toMatch(/receiver|wishlist|SECRETO-DESEO|token/i);
      expect(JSON.parse(text).drawn).toBe(true);
    }
  });

  it('CP-I-15 [RF-05][CA-05.4] tras el sorteo no se cambian participantes pero sí nombre, fecha y presupuesto', async () => {
    const group = await createGroup();
    await draw(group);
    const res = await patch(group, { participants: [...group.participants, { name: 'Nuevo' }] });
    expect((await expectError(res, 409, 'ALREADY_DRAWN')).ok).toBe(true);
    expect((await patch(group, { name: 'Nuevo nombre', deliveryDate: '2099-01-06', budget: '' })).status).toBe(204);
    expect(await adminView(group)).toMatchObject({ name: 'Nuevo nombre', deliveryDate: '2099-01-06', budget: null, drawn: true });
    expect((await patch(group, { deliveryDate: '2020-01-01' })).status).toBe(400);
  });

  it('CP-I-16 [RF-05][CA-05.5][AME-14] dos sorteos simultáneos producen un único resultado válido', async () => {
    const group = await createGroup(Array.from({ length: 8 }, (_, i) => `P${i}`));
    const tokens = await claimAll(group);
    const results = await Promise.all([draw(group), draw(group), draw(group)]);
    const statuses = results.map((r) => r.status);
    expect(statuses.filter((s) => s === 204)).toHaveLength(1);
    expect(statuses.filter((s) => s === 409)).toHaveLength(2);
    const assignments = new Map<string, string>();
    for (const [name, token] of tokens) assignments.set(name, (await reveal(group.gid, token)).name);
    expect(cycleLength(assignments)).toBe(8);
  });

  it('CP-I-17 [RF-06][CA-06.1] repetir el sorteo crea asignaciones nuevas válidas y reinicia los "ha visto"', async () => {
    const group = await createGroup(Array.from({ length: 6 }, (_, i) => `P${i}`));
    const tokens = await claimAll(group);
    await draw(group);
    expect((await expectError(await draw(group), 409, 'ALREADY_DRAWN')).ok).toBe(true);
    for (const token of tokens.values()) await reveal(group.gid, token);
    expect((await adminView(group)).participants.every((p) => p.status === 'seen')).toBe(true);

    expect((await draw(group, true)).status).toBe(204);
    expect((await adminView(group)).participants.every((p) => p.status === 'in')).toBe(true);
    const assignments = new Map<string, string>();
    for (const [name, token] of tokens) assignments.set(name, (await reveal(group.gid, token)).name);
    expect(cycleLength(assignments)).toBe(6);
  });

  it('CP-I-18 [RF-06][CA-06.2] deshacer el sorteo permite editar y los participantes ven que no hay sorteo', async () => {
    const group = await createGroup();
    const token = await claim(group.gid, group.participants[0]!.id);
    expect(
      (await expectError(await call('DELETE', `/api/groups/${group.gid}/admin/draw`, { token: group.adminKey }), 409, 'NOT_DRAWN')).ok,
    ).toBe(true);
    await draw(group);
    expect((await call('DELETE', `/api/groups/${group.gid}/admin/draw`, { token: group.adminKey })).status).toBe(204);
    expect((await me(group.gid, token)).group.drawn).toBe(false);
    expect((await call('POST', `/api/groups/${group.gid}/me/reveal`, { token })).status).toBe(409);
    expect((await patch(group, { participants: [...group.participants, { name: 'Nuevo' }] })).status).toBe(204);
  });

  it('CP-I-29 [RF-12][CA-12.1][CA-12.2] el estado pasa de "sin entrar" a "ha entrado" y a "ha visto a su amigo"', async () => {
    const group = await createGroup();
    expect((await adminView(group)).participants.map((p) => p.status)).toEqual(['out', 'out', 'out', 'out']);
    const token = await claim(group.gid, group.participants[1]!.id);
    expect((await adminView(group)).participants.map((p) => p.status)).toEqual(['out', 'in', 'out', 'out']);
    await draw(group);
    await reveal(group.gid, token);
    expect((await adminView(group)).participants.map((p) => p.status)).toEqual(['out', 'seen', 'out', 'out']);
  });

  it('CP-I-30 [RF-14][CA-14.1][CA-14.2] dejar entrar de nuevo libera el nombre sin cambiar la asignación', async () => {
    const group = await createGroup();
    const pid = group.participants[0]!.id;
    const oldToken = await claim(group.gid, pid);
    await draw(group);
    const before = await reveal(group.gid, oldToken);

    const release = await call('POST', `/api/groups/${group.gid}/admin/participants/${pid}/release`, { token: group.adminKey });
    expect(release.status).toBe(204);
    expect((await adminView(group)).participants[0]!.status).toBe('out');
    expect((await call('GET', `/api/groups/${group.gid}/me`, { token: oldToken })).status).toBe(401);

    const newToken = await claim(group.gid, pid);
    expect((await reveal(group.gid, newToken)).name).toBe(before.name);
    const missing = await call('POST', `/api/groups/${group.gid}/admin/participants/AAAAAAAAAAAAAAAAAAAAAA/release`, {
      token: group.adminKey,
    });
    expect(missing.status).toBe(404);
  });

  it('CP-I-32 [RF-16][CA-16.1] borrar el grupo elimina todo y el enlace deja de funcionar', async () => {
    const group = await createGroup();
    const token = await claim(group.gid, group.participants[0]!.id);
    await draw(group);
    expect((await call('DELETE', `/api/groups/${group.gid}/admin`, { token: group.adminKey })).status).toBe(204);
    expect((await expectError(await call('GET', `/api/groups/${group.gid}`), 404, 'NOT_FOUND')).ok).toBe(true);
    expect((await call('GET', `/api/groups/${group.gid}/admin`, { token: group.adminKey })).status).toBe(401);
    expect((await call('GET', `/api/groups/${group.gid}/me`, { token })).status).toBe(404);
  });
});
