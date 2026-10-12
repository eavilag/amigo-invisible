import { Redirect } from 'wouter';
import { ErrorScreen, LoadingScreen } from '../components/StatusScreens';
import { BackButton, Facts, Notice, Page } from '../components/ui';
import { dropToken, handleGone, storedToken } from '../hooks/useParticipant';
import { useLoad } from '../hooks/useLoad';
import { t } from '../i18n/es';
import { api, ApiClientError } from '../lib/api';

type RevealData =
  | { kind: 'ok'; group: Awaited<ReturnType<typeof api.me>>['group']; receiver: Awaited<ReturnType<typeof api.reveal>>['receiver'] }
  | { kind: 'not-drawn' }
  | { kind: 'no-token' };

/** Ver a quién regalo y sus ideas (RF-09, RF-11). */
export function Reveal({ gid }: { gid: string }) {
  const [state, reload] = useLoad<RevealData>(async () => {
    const token = storedToken(gid);
    if (!token) return { kind: 'no-token' };
    try {
      const [{ group }, { receiver }] = await Promise.all([api.me(gid, token), api.reveal(gid, token)]);
      return { kind: 'ok', group, receiver };
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'NOT_DRAWN') return { kind: 'not-drawn' };
      if (error instanceof ApiClientError && error.code === 'UNAUTHORIZED') {
        dropToken(gid);
        return { kind: 'no-token' };
      }
      return handleGone(gid, error);
    }
  }, gid);

  const back = <BackButton to={`/g/${gid}`} />;
  if (state.status === 'loading') return <LoadingScreen />;
  if (state.status === 'error') return <ErrorScreen error={state.error} onRetry={() => void reload()} />;
  const data = state.data;
  if (data.kind === 'no-token') return <Redirect to={`/g/${gid}`} replace />;
  if (data.kind === 'not-drawn') {
    return (
      <Page title={t.appName} back={back}>
        <Notice>{t.participant.notDrawn}</Notice>
      </Page>
    );
  }

  const p = t.participant;
  return (
    <Page title={p.youGiveTo} back={back}>
      <div className="reveal">
        <p className="reveal-name" data-testid="receiver-name">
          {data.receiver.name}
        </p>
      </div>
      <Facts deliveryDate={data.group.deliveryDate} budget={data.group.budget} />
      <section className="stack" aria-labelledby="ideas-title">
        <h2 id="ideas-title">{p.ideasOf(data.receiver.name)}</h2>
        {data.receiver.wishlist ? <p className="wish">{data.receiver.wishlist}</p> : <p className="muted">{p.noIdeas}</p>}
      </section>
      <p className="muted">{p.secret}</p>
    </Page>
  );
}
