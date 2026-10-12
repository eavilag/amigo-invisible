import { type FormEvent, useState } from 'react';
import { Redirect, useLocation } from 'wouter';
import { LIMITS } from '../../shared/limits';
import { cleanMultiline } from '../../shared/normalize';
import { ErrorScreen, LoadingScreen } from '../components/StatusScreens';
import { useToast } from '../components/Toast';
import { BackButton, Button, Page } from '../components/ui';
import { dropToken, handleGone, storedToken } from '../hooks/useParticipant';
import { useLoad } from '../hooks/useLoad';
import { errorMessage, t } from '../i18n/es';
import { api, ApiClientError } from '../lib/api';

/** Mis ideas de regalo (RF-10), antes o después del sorteo. */
export function Ideas({ gid }: { gid: string }) {
  const [state, reload] = useLoad(async () => {
    const token = storedToken(gid);
    if (!token) return null;
    try {
      return { token, wishlist: (await api.me(gid, token)).participant.wishlist };
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'UNAUTHORIZED') {
        dropToken(gid);
        return null;
      }
      return handleGone(gid, error);
    }
  }, gid);

  if (state.status === 'loading') return <LoadingScreen />;
  if (state.status === 'error') return <ErrorScreen error={state.error} onRetry={() => void reload()} />;
  if (!state.data) return <Redirect to={`/g/${gid}`} replace />;
  return <IdeasForm gid={gid} token={state.data.token} initial={state.data.wishlist} />;
}

function IdeasForm({ gid, token, initial }: { gid: string; token: string; initial: string }) {
  const [, navigate] = useLocation();
  const toast = useToast();
  const [text, setText] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const p = t.participant;
  const length = cleanMultiline(text).length;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (length > LIMITS.wishlistMax) return setError(p.ideasTooLong);
    setBusy(true);
    try {
      await api.saveWishlist(gid, token, text);
      toast(p.saved);
      navigate(`/g/${gid}`);
    } catch (err) {
      const code = err instanceof ApiClientError ? err.code : 'INTERNAL';
      setError(code === 'VALIDATION' ? p.ideasTooLong : `${errorMessage(code).title}. ${errorMessage(code).text}`);
      setBusy(false);
    }
  };

  return (
    <Page title={p.myIdeasTitle} back={<BackButton to={`/g/${gid}`} />}>
      <form className="stack" onSubmit={save} noValidate>
        <div className="field">
          <label htmlFor="wishlist">{p.ideasLabel}</label>
          <textarea
            id="wishlist"
            value={text}
            maxLength={LIMITS.wishlistMax}
            placeholder={p.ideasPlaceholder}
            aria-describedby="wishlist-count"
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
          />
          <p className="hint" id="wishlist-count">
            {p.ideasCount(length)}
          </p>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <Button type="submit" variant="primary" busy={busy}>
          {p.save}
        </Button>
      </form>
    </Page>
  );
}
