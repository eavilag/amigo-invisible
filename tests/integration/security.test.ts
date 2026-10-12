import { describe, expect, it } from 'vitest';
import { call, expectError } from './helpers';

describe('Seguridad de la API', () => {
  it('CP-I-34 [RF-20][CA-20.3][RNF-08][AME-11][AME-12] superar el límite de creación por IP responde RATE_LIMITED', async () => {
    const ip = '203.0.113.7';
    const body = { name: 'G', participants: ['A', 'B', 'C'] };
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await call('POST', '/api/groups', { ip, body })).status);
    expect(statuses.slice(0, 5)).toEqual([201, 201, 201, 201, 201]);
    expect(statuses.at(-1)).toBe(429);
    const limited = await call('POST', '/api/groups', { ip, body });
    expect((await expectError(limited, 429, 'RATE_LIMITED')).ok).toBe(true);
    // Otra IP no se ve afectada.
    expect((await call('POST', '/api/groups', { body })).status).toBe(201);
  });

  it('CP-I-35 [RNF-08][AME-15] JSON mal formado, campos desconocidos y cuerpos de más de 16 KB se rechazan', async () => {
    expect((await expectError(await call('POST', '/api/groups', { rawBody: '{"name":' }), 400, 'VALIDATION')).ok).toBe(true);
    expect(
      (
        await expectError(
          await call('POST', '/api/groups', { body: { name: 'G', participants: ['A', 'B', 'C'], isAdmin: true } }),
          400,
          'VALIDATION',
        )
      ).ok,
    ).toBe(true);
    const huge = { name: 'G', participants: ['A', 'B', 'C'], budget: 'x'.repeat(17 * 1024) };
    expect((await expectError(await call('POST', '/api/groups', { body: huge }), 413, 'PAYLOAD_TOO_LARGE')).ok).toBe(true);
    // Intento de inyección SQL tratado como texto.
    const res = await call('POST', '/api/groups', { body: { name: "x'); DROP TABLE groups;--", participants: ['A', 'B', 'C'] } });
    expect(res.status).toBe(201);
    expect((await call('GET', '/api/health')).status).toBe(200);
  });

  it('CP-I-36 [RNF-08][ADR-0011][AME-09][AME-10] las respuestas de la API llevan cabeceras de seguridad y no se cachean', async () => {
    for (const res of [await call('GET', '/api/health'), await call('GET', '/api/groups/AAAAAAAAAAAAAAAAAAAAAA')]) {
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'none'");
      expect(res.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
      expect(res.headers.get('Strict-Transport-Security')).toContain('max-age=63072000');
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('Referrer-Policy')).toBe('no-referrer');
      expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
      expect(res.headers.get('Cache-Control')).toBe('no-store');
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
    }
  });
});
