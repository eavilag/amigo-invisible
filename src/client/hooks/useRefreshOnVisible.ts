import { useEffect } from 'react';

/** Recarga en silencio al volver a la pestaña (p. ej. desde WhatsApp), para ver el estado actual. */
export function useRefreshOnVisible(reload: (options: { silent: boolean }) => Promise<void>) {
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reload({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [reload]);
}
