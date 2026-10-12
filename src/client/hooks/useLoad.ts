import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiClientError } from '../lib/api';

export type LoadState<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error'; error: ApiClientError };

const toClientError = (error: unknown) => (error instanceof ApiClientError ? error : new ApiClientError('INTERNAL'));

/**
 * Carga datos al montar (y cuando cambia `key`) y ofrece `reload`. Ignora respuestas de
 * cargas anteriores para que una respuesta lenta no pise a una más reciente.
 */
export function useLoad<T>(loader: () => Promise<T>, key: string): [LoadState<T>, (options?: { silent?: boolean }) => Promise<void>] {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });
  const sequence = useRef(0);
  const latestLoader = useRef(loader);
  useEffect(() => {
    latestLoader.current = loader;
  });

  /** Lanza una carga y aplica su resultado solo si sigue siendo la más reciente. */
  const fetchLatest = useCallback(async () => {
    const current = ++sequence.current;
    try {
      const data = await latestLoader.current();
      if (current === sequence.current) setState({ status: 'ready', data });
    } catch (error) {
      if (current === sequence.current) setState({ status: 'error', error: toClientError(error) });
    }
  }, []);

  useEffect(() => {
    void fetchLatest();
    // Al cambiar `key` o desmontar se invalida cualquier carga en curso (se incrementa a propósito).
    const counter = sequence;
    return () => {
      counter.current++;
    };
  }, [key, fetchLatest]);

  const reload = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setState({ status: 'loading' });
      await fetchLatest();
    },
    [fetchLatest],
  );

  return [state, reload];
}
