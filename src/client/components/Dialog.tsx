import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from './ui';

export interface DialogOptions {
  title: string;
  text?: ReactNode;
  warning?: ReactNode;
  /** Botón destacado. Si falta, el diálogo es informativo y solo muestra `noLabel`. */
  yesLabel?: string;
  noLabel: string;
}

interface DialogProps extends DialogOptions {
  onAnswer: (yes: boolean) => void;
}

/**
 * Diálogo modal accesible: foco atrapado, Escape cierra (= "No"), devuelve el foco
 * al elemento que lo abrió. Aparece abajo, al alcance del pulgar.
 */
function Dialog({ title, text, warning, yesLabel, noLabel, onAnswer }: DialogProps) {
  const titleId = useId();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    box.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onAnswer(false);
      if (event.key !== 'Tab' || !box.current) return;
      const buttons = [...box.current.querySelectorAll<HTMLButtonElement>('button')];
      const first = buttons[0];
      const last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      previous?.focus?.();
    };
  }, [onAnswer]);

  return (
    <div className="dialog-backdrop">
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={box}>
        <h2 id={titleId}>{title}</h2>
        {text && <p>{text}</p>}
        {warning && <p className="notice">{warning}</p>}
        {yesLabel && (
          <Button variant="primary" onClick={() => onAnswer(true)}>
            {yesLabel}
          </Button>
        )}
        <Button onClick={() => onAnswer(false)}>{noLabel}</Button>
      </div>
    </div>
  );
}

/** `const [dialog, ask] = useDialog(); if (await ask({...})) …` */
export function useDialog(): [ReactNode, (options: DialogOptions) => Promise<boolean>] {
  const [state, setState] = useState<(DialogOptions & { resolve: (yes: boolean) => void }) | null>(null);

  const ask = useCallback((options: DialogOptions) => new Promise<boolean>((resolve) => setState({ ...options, resolve })), []);

  const onAnswer = useCallback((yes: boolean) => {
    setState((current) => {
      current?.resolve(yes);
      return null;
    });
  }, []);

  const element = state ? <Dialog {...state} onAnswer={onAnswer} /> : null;
  return [element, ask];
}
