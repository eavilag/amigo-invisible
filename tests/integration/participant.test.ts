import { describe, expect, it } from 'vitest';
import { adminView, call, claim, claimAll, createGroup, cycleLength, draw, expectError, me, reveal } from './helpers';

describe('API del participante', () => {
  it('CP-I-24 [RF-08][CA-08.1][CA-08.2] el token recuerda al participante y deja de valer al liberarse', async () => {
    const group = await createGroup();
    const token = await claim(group.gid, group.participants[0]!.id);
    const view = await me(group.gid, token);
    expect(view.participant).toMatchObject({ name: 'Carmen', wishlist: '', viewed: false });
    expect(view.group).toMatchObject({ id: group.gid, drawn: false });

    await call('POST', `/api/groups/${group.gid}/admin/participants/${group.participants[0]!.id}/release`, { token: group.adminKey });
    expect((await expectError(await call('GET', `/api/groups/${group.gid}/me`, { token }), 401, 'UNAUTHORIZED')).ok).toBe(true);
  });

  it('CP-I-25 [RF-09][CA-09.1][CA-09.2] ver a quién regalo exige sorteo y marca "ha visto"', async () => {
    const group = await createGroup();
    const token = await claim(group.gid, group.participants[0]!.id);
    expect((await expectError(await call('POST', `/api/groups/${group.gid}/me/reveal`, { token }), 409, 'NOT_DRAWN')).ok).toBe(true);

    expect((await draw(group)).status).toBe(204);
    const receiver = await reveal(group.gid, token);
    expect(receiver.name).not.toBe('Carmen');
    expect(group.participants.map((p) => p.name)).toContain(receiver.name);
    expect((await me(group.gid, token)).participant.viewed).toBe(true);
    // Se puede ver tantas veces como se quiera y siempre es la misma persona.
    expect((await reveal(group.gid, token)).name).toBe(receiver.name);
  });

  it('CP-I-13 [RF-05][CA-05.1][CA-05.2] el sorteo visto desde cada participante forma un único círculo sin autoasignación', async () => {
    const names = Array.from({ length: 12 }, (_, i) => `Persona ${i + 1}`);
    const group = await createGroup(names);
    const tokens = await claimAll(group);
    expect((await draw(group)).status).toBe(204);
    const assignments = new Map<string, string>();
    for (const [name, token] of tokens) assignments.set(name, (await reveal(group.gid, token)).name);
    expect(new Set(assignments.values()).size).toBe(names.length);
    for (const [giver, receiver] of assignments) {
      expect(receiver).not.toBe(giver);
      expect(assignments.get(receiver)).not.toBe(giver);
    }
    expect(cycleLength(assignments)).toBe(names.length);
  });

  it('CP-I-26 [RF-09][CA-09.3][AME-03][AME-04] un token solo vale en su grupo y no da acceso a datos ajenos', async () => {
    const a = await createGroup();
    const b = await createGroup();
    const tokenA = await claim(a.gid, a.participants[0]!.id);
    await draw(a);
    await draw(b);
    expect((await expectError(await call('GET', `/api/groups/${b.gid}/me`, { token: tokenA }), 401, 'UNAUTHORIZED')).ok).toBe(true);
    expect((await expectError(await call('POST', `/api/groups/${b.gid}/me/reveal`, { token: tokenA }), 401, 'UNAUTHORIZED')).ok).toBe(true);
    const fake = 'A'.repeat(43);
    expect((await call('POST', `/api/groups/${a.gid}/me/reveal`, { token: fake })).status).toBe(401);
    expect((await call('POST', `/api/groups/${a.gid}/me/reveal`)).status).toBe(401);
    expect((await call('POST', `/api/groups/${a.gid}/me/reveal`, { token: 'corto' })).status).toBe(401);
    // El token de participante no abre las rutas de organizador (CA-02.4).
    expect((await call('GET', `/api/groups/${a.gid}/admin`, { token: tokenA })).status).toBe(401);
  });

  it('CP-I-27 [RF-10][RF-11][CA-10.1][CA-10.4][CA-11.1][CA-11.3] las ideas se guardan antes y después del sorteo y quien regala ve la versión actual', async () => {
    const group = await createGroup(['Carmen', 'Paco', 'Rosa']);
    const tokens = await claimAll(group);
    const put = (name: string, wishlist: string) =>
      call('PUT', `/api/groups/${group.gid}/me/wishlist`, { token: tokens.get(name)!, body: { wishlist } });

    for (const name of tokens.keys()) expect((await put(name, `Ideas de ${name}\nSegunda línea`)).status).toBe(204);
    await draw(group);

    const giverOf = new Map<string, string>();
    for (const [name, token] of tokens) giverOf.set((await reveal(group.gid, token)).name, name);
    const giverOfRosa = giverOf.get('Rosa')!;
    expect((await reveal(group.gid, tokens.get(giverOfRosa)!)).wishlist).toBe('Ideas de Rosa\nSegunda línea');

    expect((await put('Rosa', 'Unas zapatillas talla 38')).status).toBe(204);
    expect((await reveal(group.gid, tokens.get(giverOfRosa)!)).wishlist).toBe('Unas zapatillas talla 38');
    expect((await me(group.gid, tokens.get('Rosa')!)).participant.wishlist).toBe('Unas zapatillas talla 38');
  });

  it('CP-I-28 [RF-10][CA-10.2][CA-10.3] más de 500 caracteres se rechaza; vacía se permite', async () => {
    const group = await createGroup();
    const token = await claim(group.gid, group.participants[0]!.id);
    const tooLong = await call('PUT', `/api/groups/${group.gid}/me/wishlist`, { token, body: { wishlist: 'x'.repeat(501) } });
    expect((await expectError(tooLong, 400, 'VALIDATION')).ok).toBe(true);
    expect((await call('PUT', `/api/groups/${group.gid}/me/wishlist`, { token, body: { wishlist: 'x'.repeat(500) } })).status).toBe(204);
    expect((await call('PUT', `/api/groups/${group.gid}/me/wishlist`, { token, body: { wishlist: '' } })).status).toBe(204);
    expect((await me(group.gid, token)).participant.wishlist).toBe('');
  });

  it('CP-I-31 [RF-15][CA-15.1][CA-15.2] "No soy yo" libera el nombre solo antes de ver el resultado', async () => {
    const group = await createGroup();
    const token = await claim(group.gid, group.participants[0]!.id);
    expect((await call('DELETE', `/api/groups/${group.gid}/me/claim`, { token })).status).toBe(204);
    expect((await adminView(group)).participants[0]!.status).toBe('out');
    expect((await call('GET', `/api/groups/${group.gid}/me`, { token })).status).toBe(401);

    const token2 = await claim(group.gid, group.participants[0]!.id);
    await draw(group);
    await reveal(group.gid, token2);
    expect(
      (await expectError(await call('DELETE', `/api/groups/${group.gid}/me/claim`, { token: token2 }), 409, 'ALREADY_VIEWED')).ok,
    ).toBe(true);
  });
});
