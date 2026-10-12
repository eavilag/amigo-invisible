// Caracteres de control C0/C1 y separadores invisibles que no deben guardarse nunca.
// eslint-disable-next-line no-control-regex
const CONTROL_EXCEPT_NEWLINE = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2060-\u206F\uFEFF]/g;
const WHITESPACE_RUN = /\s+/g;
const DIACRITICS = /\p{Diacritic}/gu;

/** Texto de una línea: NFC, sin caracteres de control, espacios colapsados y recortado. */
export function cleanLine(value: string): string {
  return value.normalize('NFC').replace(CONTROL_EXCEPT_NEWLINE, '').replace(/\n/g, ' ').replace(WHITESPACE_RUN, ' ').trim();
}

/** Texto multilínea (lista de deseos): NFC, sin caracteres de control, saltos de línea normalizados. */
export function cleanMultiline(value: string): string {
  return value
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL_EXCEPT_NEWLINE, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Clave de comparación de nombres (CA-01.3): "María", "maria ", "MARIA" y "Maria" son iguales.
 */
export function nameKey(value: string): string {
  return cleanLine(value).normalize('NFD').replace(DIACRITICS, '').toLocaleLowerCase('es').normalize('NFC');
}

/** Devuelve el primer nombre que aparece repetido (en su forma original), o `null`. */
export function findDuplicateName(names: readonly string[]): string | null {
  const seen = new Map<string, string>();
  for (const name of names) {
    const key = nameKey(name);
    const first = seen.get(key);
    if (first !== undefined) return first;
    seen.set(key, cleanLine(name));
  }
  return null;
}
