import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ERROR_STATUS, type ErrorCode } from '../../src/shared/errors';
import { useDialog } from '../../src/client/components/Dialog';
import { errorMessage, t } from '../../src/client/i18n/es';
import { formatDate } from '../../src/client/lib/format';
import { inviteWhatsApp, organizerUrl } from '../../src/client/lib/links';
import { forgetGroup, getStoredGroup, listStoredGroups, updateStoredGroup } from '../../src/client/lib/storage';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('Almacenamiento local', () => {
  it('CP-C-01 [RF-02][RF-08][RF-18] recuerda grupos y secretos, y olvida el grupo cuando no queda ninguno', () => {
    updateStoredGroup('g1', { name: 'Navidad', adminKey: 'k' });
    updateStoredGroup('g1', { participantToken: 't', participantName: 'Paco' });
    expect(getStoredGroup('g1')).toMatchObject({ name: 'Navidad', adminKey: 'k', participantToken: 't' });
    expect(listStoredGroups().map((g) => g.gid)).toEqual(['g1']);
    updateStoredGroup('g1', { adminKey: undefined, participantToken: undefined });
    expect(getStoredGroup('g1')).toBeUndefined();
    updateStoredGroup('g2', { name: 'Otro', adminKey: 'k2' });
    forgetGroup('g2');
    expect(listStoredGroups()).toEqual([]);
  });

  it('CP-C-02 [RNF-05] si el navegador bloquea el almacenamiento (modo privado) la aplicación no falla', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => updateStoredGroup('g', { name: 'x', adminKey: 'k' })).not.toThrow();
    expect(listStoredGroups()).toEqual([]);
    expect(getStoredGroup('g')).toBeUndefined();
  });

  it('CP-C-03 [RF-18] datos corruptos en el almacenamiento se ignoran', () => {
    window.localStorage.setItem('amigo-invisible:v1', '{no es json');
    expect(listStoredGroups()).toEqual([]);
    window.localStorage.setItem('amigo-invisible:v1', '[1,2]');
    expect(listStoredGroups()).toEqual([]);
  });
});

describe('Textos y enlaces', () => {
  beforeEach(() => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, origin: 'https://amigo.example' });
  });

  it('CP-C-04 [RF-20][CA-20.1][CA-20.2][CA-20.3][CA-20.4] todos los errores tienen un mensaje llano y ninguno muestra códigos técnicos', () => {
    const codes = [...(Object.keys(ERROR_STATUS) as ErrorCode[]), 'NETWORK' as const];
    for (const code of codes) {
      const { title, text } = errorMessage(code);
      expect(title.length).toBeGreaterThan(0);
      expect(`${title} ${text}`).not.toMatch(/[A-Z]{3,}_|\b[45]\d\d\b|error/i);
    }
    expect(errorMessage('NETWORK').title).toBe('No hay conexión a Internet');
    expect(errorMessage('RATE_LIMITED').text).toBe('Espera un minuto y vuelve a intentarlo.');
    expect(errorMessage('INTERNAL')).toEqual({ title: 'Algo ha fallado', text: 'Vuelve a intentarlo en un momento.' });
  });

  it('CP-C-05 [RF-03][CA-03.1][RF-13][CA-13.1] los mensajes de WhatsApp llevan el texto acordado y el enlace codificado', () => {
    const url = inviteWhatsApp('Navidad & Reyes', 'abc');
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    expect(decodeURIComponent(url.slice('https://wa.me/?text='.length))).toBe(
      '🎁 ¡Amigo invisible «Navidad & Reyes»! Toca este enlace, elige tu nombre y descubre a quién le haces el regalo: https://amigo.example/g/abc',
    );
    expect(url).not.toContain('&R');
    expect(t.whatsapp.reminder('G', 'U')).toBe(
      '🎁 Recordatorio del amigo invisible «G»: si todavía no has mirado a quién regalas, toca aquí: U',
    );
    expect(organizerUrl('g', 'k')).toBe('https://amigo.example/g/g/organizar#k');
  });

  it('CP-C-06 [RF-09] las fechas se muestran en español sin desfase de zona horaria', () => {
    expect(formatDate('2027-12-24')).toBe('24 de diciembre de 2027');
    expect(formatDate('2028-01-01')).toBe('1 de enero de 2028');
  });
});

describe('Diálogo de confirmación', () => {
  function Harness({ onResult }: { onResult: (yes: boolean) => void }) {
    const [dialog, ask] = useDialog();
    return (
      <>
        <button onClick={async () => onResult(await ask({ title: '¿Seguro?', yesLabel: 'Sí, hacerlo', noLabel: 'No' }))}>Abrir</button>
        {dialog}
      </>
    );
  }

  it('CP-C-07 [RNF-01][RNF-02] confirma con "Sí", cancela con "No" o Escape y enfoca el primer botón', async () => {
    const onResult = vi.fn();
    render(<Harness onResult={onResult} />);
    fireEvent.click(screen.getByText('Abrir'));
    const dialog = await screen.findByRole('dialog', { name: '¿Seguro?' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement?.textContent).toBe('Sí, hacerlo');
    await act(async () => fireEvent.click(screen.getByText('Sí, hacerlo')));
    expect(onResult).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByText('Abrir'));
    await screen.findByRole('dialog');
    await act(async () => fireEvent.keyDown(document, { key: 'Escape' }));
    expect(onResult).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
