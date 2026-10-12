import { REFERENCE_TIME_ZONE } from './limits';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria de referencia. */
export function todayIso(now: Date = new Date(), timeZone: string = REFERENCE_TIME_ZONE): string {
  // en-CA formatea como YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** true si la cadena es una fecha de calendario real con formato YYYY-MM-DD. */
export function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** true si la fecha es anterior a hoy (CA-01.5). Las cadenas ISO se comparan lexicográficamente. */
export function isPastDate(value: string, now: Date = new Date()): boolean {
  return value < todayIso(now);
}
