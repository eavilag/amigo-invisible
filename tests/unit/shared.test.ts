import { describe, expect, it } from 'vitest';
import { isPastDate, isValidIsoDate, todayIso } from '../../src/shared/dates';
import { cleanLine, cleanMultiline, findDuplicateName, nameKey } from '../../src/shared/normalize';
import { createGroupRequestSchema, drawRequestSchema, patchGroupRequestSchema, wishlistRequestSchema } from '../../src/shared/schemas';
import { participantStatus } from '../../src/worker/domain/status';
import { fromZodError } from '../../src/worker/http';

const errorCodeOf = (data: unknown) => {
  const result = createGroupRequestSchema.safeParse(data);
  return result.success ? null : fromZodError(result.error).toBody();
};

describe('Normalización de textos', () => {
  it('CP-U-10 [RF-01][CA-01.3] los nombres se comparan sin mayúsculas, acentos ni espacios sobrantes', () => {
    expect(nameKey('María')).toBe(nameKey('maria '));
    expect(nameKey('MARIA')).toBe(nameKey('Maria'));
    expect(nameKey('  José   Luis ')).toBe(nameKey('jose luis'));
    expect(nameKey('Ana')).not.toBe(nameKey('Ana G.'));
    expect(findDuplicateName(['María', 'Pepe', 'maria '])).toBe('María');
    expect(findDuplicateName(['Ana', 'Ana G.', 'Luis'])).toBeNull();
  });

  it('CP-U-11 [RF-01][CA-01.7][AME-08] se eliminan caracteres de control y el HTML se conserva como texto literal', () => {
    expect(cleanLine('<script>alert(1)</script>')).toBe('<script>alert(1)</script>');
    expect(cleanLine('Pe\u0000pe\u200B \t\n Luis')).toBe('Pepe Luis');
    expect(cleanLine('\u202Eabc')).toBe('abc');
  });

  it('CP-U-12 [RF-10] la lista de deseos conserva saltos de línea y limpia el resto', () => {
    expect(cleanMultiline('Libro\r\nBufanda  \n\n\n\nGuantes\u0007')).toBe('Libro\nBufanda\n\nGuantes');
    expect(cleanMultiline('   ')).toBe('');
  });
});

describe('Esquemas de validación', () => {
  const valid = { name: 'Navidad Familia 2027', participants: ['Carmen', 'Paco', 'Rosa'] };

  it('CP-U-20 [RF-01][CA-01.1] acepta un grupo válido y normaliza los opcionales', () => {
    const parsed = createGroupRequestSchema.parse({ ...valid, budget: '  ', deliveryDate: '' });
    expect(parsed).toEqual({ name: 'Navidad Familia 2027', participants: ['Carmen', 'Paco', 'Rosa'], budget: null, deliveryDate: null });
    expect(createGroupRequestSchema.parse({ ...valid, budget: '20 €', deliveryDate: '2099-12-24' })).toMatchObject({
      budget: '20 €',
      deliveryDate: '2099-12-24',
    });
  });

  it('CP-U-21 [RF-01][CA-01.2] con menos de 3 personas el error es TOO_FEW', () => {
    expect(errorCodeOf({ ...valid, participants: ['A', 'B'] })).toEqual({ error: 'TOO_FEW' });
  });

  it('CP-U-22 [RF-01][CA-01.4] con más de 40 personas el error es TOO_MANY', () => {
    const many = Array.from({ length: 41 }, (_, i) => `Persona ${i}`);
    expect(errorCodeOf({ ...valid, participants: many })).toEqual({ error: 'TOO_MANY' });
    expect(errorCodeOf({ ...valid, participants: many.slice(0, 40) })).toBeNull();
  });

  it('CP-U-23 [RF-01][CA-01.6] nombres vacíos o demasiado largos se rechazan indicando el campo', () => {
    expect(errorCodeOf({ ...valid, name: '   ' })).toEqual({ error: 'VALIDATION', field: 'name' });
    expect(errorCodeOf({ ...valid, name: 'x'.repeat(61) })).toEqual({ error: 'VALIDATION', field: 'name' });
    expect(errorCodeOf({ ...valid, name: 'x'.repeat(60) })).toBeNull();
    expect(errorCodeOf({ ...valid, participants: ['A', '', 'C'] })).toEqual({ error: 'VALIDATION', field: 'participants.1' });
    expect(errorCodeOf({ ...valid, participants: ['A', 'B', 'x'.repeat(31)] })).toEqual({ error: 'VALIDATION', field: 'participants.2' });
    expect(errorCodeOf({ ...valid, budget: 'x'.repeat(31) })).toEqual({ error: 'VALIDATION', field: 'budget' });
  });

  it('CP-U-24 [RF-01][CA-01.3] nombres repetidos devuelven DUPLICATE_NAME con el nombre', () => {
    expect(errorCodeOf({ ...valid, participants: ['María', 'Pepe', 'MARIA'] })).toEqual({ error: 'DUPLICATE_NAME', name: 'María' });
  });

  it('CP-U-25 [RF-10][CA-10.2][CA-10.3] lista de deseos de hasta 500 caracteres, vacía permitida', () => {
    expect(wishlistRequestSchema.safeParse({ wishlist: 'x'.repeat(500) }).success).toBe(true);
    expect(wishlistRequestSchema.safeParse({ wishlist: 'x'.repeat(501) }).success).toBe(false);
    expect(wishlistRequestSchema.parse({ wishlist: '' })).toEqual({ wishlist: '' });
  });

  it('CP-U-26 [RF-01][RNF-08] rechaza fechas inexistentes, campos desconocidos y tipos incorrectos', () => {
    expect(errorCodeOf({ ...valid, deliveryDate: '2099-02-30' })?.error).toBe('VALIDATION');
    expect(errorCodeOf({ ...valid, admin: true })?.error).toBe('VALIDATION');
    expect(errorCodeOf({ ...valid, participants: 'Carmen' })?.error).toBe('VALIDATION');
    expect(errorCodeOf(null)?.error).toBe('VALIDATION');
  });

  it('CP-U-27 [RF-04] el cambio de participantes valida duplicados e identificadores repetidos', () => {
    const id = 'A'.repeat(22);
    expect(patchGroupRequestSchema.safeParse({ participants: [{ name: 'A' }, { name: 'B' }, { name: 'a' }] }).success).toBe(false);
    expect(patchGroupRequestSchema.safeParse({ participants: [{ id, name: 'A' }, { id, name: 'B' }, { name: 'C' }] }).success).toBe(false);
    expect(patchGroupRequestSchema.safeParse({ name: 'Nuevo' }).success).toBe(true);
    expect(drawRequestSchema.parse({})).toEqual({ redo: false });
  });
});

describe('Fechas', () => {
  it('CP-U-30 [RF-01][CA-01.5] una fecha anterior a hoy (hora de Madrid) se considera pasada', () => {
    // 23:30 UTC del 31-dic = 00:30 del 1-ene en Madrid.
    const now = new Date('2027-12-31T23:30:00Z');
    expect(todayIso(now)).toBe('2028-01-01');
    expect(isPastDate('2027-12-31', now)).toBe(true);
    expect(isPastDate('2028-01-01', now)).toBe(false);
    expect(isValidIsoDate('2028-02-29')).toBe(true);
    expect(isValidIsoDate('2027-02-29')).toBe(false);
    expect(isValidIsoDate('24/12/2027')).toBe(false);
  });
});

describe('Estado del participante', () => {
  it('CP-U-31 [RF-12] sin entrar → ha entrado → ha visto a su amigo', () => {
    expect(participantStatus({ tokenHash: null, viewedAt: null })).toBe('out');
    expect(participantStatus({ tokenHash: 'h', viewedAt: null })).toBe('in');
    expect(participantStatus({ tokenHash: 'h', viewedAt: '2027-01-01' })).toBe('seen');
  });
});
