import { t, errorMessage } from '../i18n/es';
import type { ApiClientError } from '../lib/api';
import { GiftIcon } from './Icons';
import { Button, NavButton, Page } from './ui';

export function LoadingScreen() {
  return (
    <main className="page page-center" aria-busy="true">
      <GiftIcon className="hero-gift pulse" />
      <p className="muted">{t.loading}</p>
    </main>
  );
}

/** Pantalla de error con una única salida clara (RF-20). */
export function ErrorScreen({ error, onRetry }: { error: ApiClientError; onRetry?: () => void }) {
  const { title, text } = errorMessage(error.code);
  const canRetry = onRetry && error.code !== 'NOT_FOUND';
  return (
    <Page title={title} back={<GiftIcon />}>
      <p>{text}</p>
      {canRetry ? (
        <Button variant="primary" onClick={onRetry}>
          {t.retry}
        </Button>
      ) : (
        <NavButton to="/" variant="primary">
          {t.goHome}
        </NavButton>
      )}
    </Page>
  );
}

export function MessageScreen({ title, text }: { title: string; text: string }) {
  return (
    <Page title={title} back={<GiftIcon />}>
      <p>{text}</p>
      <NavButton to="/" variant="primary">
        {t.goHome}
      </NavButton>
    </Page>
  );
}
