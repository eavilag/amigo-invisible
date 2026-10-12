import { describe, expect, it } from 'vitest';
import { cryptoRandomInt, drawCircle, shuffle } from '../../src/worker/domain/draw';

const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i}`);

/** Recorre el círculo desde el primero y devuelve cuántas personas visita antes de volver. */
function cycleLength(assignments: Map<string, string>, start: string): number {
  let length = 0;
  let current = start;
  do {
    current = assignments.get(current)!;
    length++;
  } while (current !== start && length <= assignments.size);
  return length;
}

describe('Sorteo (ADR-0007)', () => {
  it('CP-U-01 [RF-05][CA-05.1] para N = 3…40 cada persona da y recibe exactamente un regalo y nadie se toca a sí mismo', () => {
    for (let n = 3; n <= 40; n++) {
      for (let run = 0; run < 100; run++) {
        const people = ids(n);
        const result = drawCircle(people);
        expect(result.size).toBe(n);
        expect(new Set(result.values()).size).toBe(n);
        for (const [giver, receiver] of result) {
          expect(people).toContain(receiver);
          expect(receiver).not.toBe(giver);
        }
      }
    }
  });

  it('CP-U-02 [RF-05][CA-05.2] las asignaciones forman un único círculo y no hay parejas cruzadas', () => {
    for (let n = 3; n <= 40; n++) {
      for (let run = 0; run < 50; run++) {
        const result = drawCircle(ids(n));
        expect(cycleLength(result, 'p0')).toBe(n);
        for (const [giver, receiver] of result) {
          expect(result.get(receiver)).not.toBe(giver);
        }
      }
    }
  });

  it('CP-U-03 [RF-05] rechaza menos de 3 participantes o identificadores repetidos', () => {
    expect(() => drawCircle([])).toThrow(RangeError);
    expect(() => drawCircle(ids(2))).toThrow(RangeError);
    expect(() => drawCircle(['a', 'b', 'a'])).toThrow();
  });

  it('CP-U-04 [RF-05][AME-07] los (N−1)! círculos posibles salen con la misma probabilidad (N = 4, chi-cuadrado)', () => {
    const samples = 60_000;
    const counts = new Map<string, number>();
    for (let i = 0; i < samples; i++) {
      const result = drawCircle(['a', 'b', 'c', 'd']);
      const key = ['a', 'b', 'c', 'd'].map((p) => result.get(p)).join('');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    expect(counts.size).toBe(6); // (4−1)! = 6 círculos
    const expected = samples / 6;
    const chiSquare = [...counts.values()].reduce((sum, observed) => sum + (observed - expected) ** 2 / expected, 0);
    // 5 grados de libertad: valor crítico 20.52 para p = 0.001.
    expect(chiSquare).toBeLessThan(20.52);
  });

  it('CP-U-05 [AME-07] cryptoRandomInt devuelve enteros en rango y valida la entrada', () => {
    for (let i = 0; i < 10_000; i++) {
      const value = cryptoRandomInt(7);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(7);
    }
    expect(cryptoRandomInt(1)).toBe(0);
    expect(() => cryptoRandomInt(0)).toThrow(RangeError);
    expect(() => cryptoRandomInt(1.5)).toThrow(RangeError);
    expect(() => cryptoRandomInt(2 ** 33)).toThrow(RangeError);
  });

  it('CP-U-06 [RF-05] shuffle es una permutación y no modifica la entrada', () => {
    const input = ids(10);
    const copy = [...input];
    const output = shuffle(input, () => 0);
    expect(input).toEqual(copy);
    expect([...output].sort()).toEqual([...input].sort());
    expect(shuffle([])).toEqual([]);
  });
});
