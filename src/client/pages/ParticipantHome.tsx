import { useState } from 'react';
import type { PublicGroup } from '../../shared/api-types';
import { useDialog } from '../components/Dialog';
import { ErrorScreen, LoadingScreen } from '../components/StatusScreens';
import { useToast } from '../components/Toast';
import { Button, Card, Facts, NavButton, Notice, Page } from '../components/ui';
import { dropToken, loadParticipant, storedToken } from '../hooks/useParticipant';
import { useLoad } from '../hooks/useLoad';
import { useRefreshOnVisible } from '../hooks/useRefreshOnVisible';
import { errorMessage, t } from '../i18n/es';
import { api, ApiClientError } from '../lib/api';
import { updateStoredGroup } from '../lib/storage';

/** Enlace del grupo: elegir nombre (RF-07) o mi pantalla personal (RF-08, RF-09, RF-10, RF-15). */
export function ParticipantHome({ gid }: { gid: string }) {
  const [state, reload] = useLoad(() => loadParticipant(gid), gid);
  useRefreshOnVisible(reload);

  if (state.status === 'loading') return <LoadingScreen />;
  if (state.status === 'error') return <ErrorScreen error={state.error} onRetry={() => void reload()} />;
  const { group, me } = state.data;
  if (!me) return <ChooseName gid={gid} group={group} onClaimed={() => reload({ silent: true })} />;
  return <Personal gid={gid} data={me} onReleased={() => reload({ silent: true })} />;
}

function ChooseName({ gid, group, onClaimed }: { gid: string; group: PublicGroup; onClaimed: () => Promise<void> }) {
  const [dialog, ask] = useDialog();
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const p = t.participant;

  const choose = async (participant: PublicGroup['participants'][number]) => {
    if (participant.claimed) {
      await ask({ title: p.takenTitle(participant.name), text: p.takenText, noLabel: t.understood });
      return;
    }
    if (!(await ask({ title: p.confirmTitle(participant.name), yesLabel: p.confirmYes(participant.name), noLabel: p.confirmNo }))) return;
    setBusy(true);
    try {
      const { participantToken } = await api.claim(gid, participant.id, storedToken(gid));
      updateStoredGroup(gid, { name: group.name, participantToken, participantName: participant.name });
    } catch (error) {
      const code = error instanceof ApiClientError ? error.code : 'INTERNAL';
      if (code === 'ALREADY_CLAIMED' || code === 'NOT_FOUND') toast(p.justTaken);
      else toast(`${errorMessage(code).title}. ${errorMessage(code).text}`);
    }
    await onClaimed();
    setBusy(false);
  };

  return (
    <Page title={group.name} eyebrow={p.eyebrow}>
      <Facts deliveryDate={group.deliveryDate} budget={group.budget} />
      <h2>{p.whoAreYou}</h2>
      <ul className="names">
        {group.participants.map((participant) => (
          <li key={participant.id}>
            <Button
              className={participant.claimed ? 'name-btn name-btn-taken' : 'name-btn'}
              disabled={busy}
              onClick={() => void choose(participant)}
            >
              <span>{participant.name}</span>
              {participant.claimed && <em>{p.taken}</em>}
            </Button>
          </li>
        ))}
      </ul>
      {dialog}
    </Page>
  );
}

function Personal({
  gid,
  data,
  onReleased,
}: {
  gid: string;
  data: NonNullable<Awaited<ReturnType<typeof loadParticipant>>['me']>;
  onReleased: () => Promise<void>;
}) {
  const [dialog, ask] = useDialog();
  const toast = useToast();
  const { group, participant } = data;
  const p = t.participant;

  const notMe = async () => {
    if (
      !(await ask({ title: p.notMeTitle(participant.name), text: p.notMeText, yesLabel: p.notMeYes, noLabel: p.notMeNo(participant.name) }))
    )
      return;
    try {
      await api.releaseSelf(gid, storedToken(gid) ?? '');
      dropToken(gid);
    } catch (error) {
      const code = error instanceof ApiClientError ? error.code : 'INTERNAL';
      if (code === 'UNAUTHORIZED') dropToken(gid);
      else toast(`${errorMessage(code).title}. ${errorMessage(code).text}`);
    }
    await onReleased();
  };

  return (
    <Page title={p.hello(participant.name)} eyebrow={group.name}>
      <Facts deliveryDate={group.deliveryDate} budget={group.budget} />
      {group.drawn ? (
        <NavButton to={`/g/${gid}/regalo`} variant="primary">
          {p.reveal}
        </NavButton>
      ) : (
        <Notice>{p.notDrawn}</Notice>
      )}
      <Card title={p.myIdeasTitle}>
        {participant.wishlist ? <p className="wish">{participant.wishlist}</p> : <p>{p.myIdeasText}</p>}
        <NavButton to={`/g/${gid}/ideas`}>{participant.wishlist ? p.changeIdeas : p.writeIdeas}</NavButton>
      </Card>
      {!participant.viewed && (
        <Button variant="link" onClick={() => void notMe()}>
          {p.notMe(participant.name)}
        </Button>
      )}
      {dialog}
    </Page>
  );
}
