/**
 * Sorteo del amigo invisible (SPEC RF-05, ADR-0007).
 * Módulo puro: no conoce HTTP ni base de datos.
 */

/** Devuelve un entero uniforme en [0, maxExclusive). */
export type RandomInt = (maxExclusive: number) => number;

const UINT32_RANGE = 2 ** 32;

/**
 * Entero aleatorio criptográfico sin sesgo de módulo (muestreo por rechazo).
 */
export const cryptoRandomInt: RandomInt = (maxExclusive) => {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > UINT32_RANGE) {
    throw new RangeError(`maxExclusive fuera de rango: ${maxExclusive}`);
  }
  // Mayor múltiplo de maxExclusive que cabe en 32 bits: los valores por encima se descartan.
  const limit = UINT32_RANGE - (UINT32_RANGE % maxExclusive);
  const buffer = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buffer);
    const value = buffer[0]!;
    if (value < limit) return value % maxExclusive;
  }
};

/** Barajado de Fisher–Yates. No modifica la entrada. */
export function shuffle<T>(items: readonly T[], randomInt: RandomInt = cryptoRandomInt): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export const MIN_PARTICIPANTS_TO_DRAW = 3;

/**
 * Asigna a cada participante a quién regala formando un único círculo:
 * nadie se toca a sí mismo, no hay parejas cruzadas y todos dan y reciben uno.
 *
 * @returns Mapa `quien regala → a quien regala`.
 */
export function drawCircle(participantIds: readonly string[], randomInt: RandomInt = cryptoRandomInt): Map<string, string> {
  if (participantIds.length < MIN_PARTICIPANTS_TO_DRAW) {
    throw new RangeError(`Hacen falta al menos ${MIN_PARTICIPANTS_TO_DRAW} participantes`);
  }
  if (new Set(participantIds).size !== participantIds.length) {
    throw new Error('Identificadores de participante repetidos');
  }
  const order = shuffle(participantIds, randomInt);
  const assignments = new Map<string, string>();
  order.forEach((giver, index) => {
    assignments.set(giver, order[(index + 1) % order.length]!);
  });
  return assignments;
}
