import { useState } from 'react';
import { useLocation } from 'wouter';
import type { AdminGroup } from '../../shared/api-types';
import { useDialog } from '../components/Dialog';
import { ErrorScreen, LoadingScreen, MessageScreen } from '../components/StatusScreens';
import { useToast } from '../components/Toast';
import { BackButton, Button, Card, Facts, NavButton, Notice, Page, WhatsAppButton } from '../components/ui';
import { useAdminGroup } from '../hooks/useAdminGroup';
import { useRefreshOnVisible } from '../hooks/useRefreshOnVisible';
import { errorMessage, t } from '../i18n/es';
import { api, ApiClientError } from '../lib/api';
import { copyText, groupUrl, inviteWhatsApp, organizerUrl, organizerWhatsApp, reminderWhatsApp } from '../lib/links';
import { forgetGroup } from '../lib/storage';

/** Panel del organizador (RF-02, RF-03, RF-05, RF-06, RF-12, RF-13, RF-14, RF-16). */
export function Organizer({ gid }: { gid: string }) {
  const [state, reload] = useAdminGroup(gid);

  // Al volver a la pestaña (p. ej. desde WhatsApp) se refresca el seguimiento (RF-12).
  useRefreshOnVisible(reload);

  if (state.status === 'loading') return <LoadingScreen />;
  if (state.status === 'error') return <ErrorScreen error={state.error} onRetry={() => void reload()} />;
  const result = state.data;
  if (result.kind === 'invalid') return <MessageScreen title={t.organizer.invalidLinkTitle} text={t.organizer.invalidLinkText} />;
  if (result.kind === 'gone') return <MessageScreen title={t.notFound.groupTitle} text={t.notFound.groupText} />;
  return <Panel gid={gid} group={result.group} adminKey={result.adminKey} reload={() => reload({ silent: true })} />;
}

function Panel({ gid, group, adminKey, reload }: { gid: string; group: AdminGroup; adminKey: string; reload: () => Promise<void> }) {
  const [, navigate] = useLocation();
  const toast = useToast();
  const [dialog, ask] = useDialog();
  const [busy, setBusy] = useState(false);
  const total = group.participants.length;
  const seen = group.participants.filter((p) => p.status === 'seen').length;
  const o = t.organizer;

  /** Ejecuta una acción con botones bloqueados (evita dobles toques) y traduce errores. */
  const run = async (action: () => Promise<void>, done: string) => {
    setBusy(true);
    try {
      await action();
      toast(done);
    } catch (error) {
      const code = error instanceof ApiClientError ? error.code : 'INTERNAL';
      if (code === 'ALREADY_DRAWN') toast(o.drawDone);
      else toast(`${errorMessage(code).title}. ${errorMessage(code).text}`);
    } finally {
      await reload();
      setBusy(false);
    }
  };

  const copy = async (text: string) => toast((await copyText(text)) ? t.copied : t.copyFailed);

  const onDraw = async () => {
    if (await ask({ title: o.drawConfirmTitle, text: o.drawConfirmText(total), yesLabel: o.drawConfirmYes, noLabel: o.drawConfirmNo })) {
      await run(() => api.draw(gid, adminKey), o.drawDone);
    }
  };

  const onRedraw = async () => {
    if (
      await ask({ title: o.redrawTitle, warning: seen > 0 ? o.redrawWarning(seen) : undefined, yesLabel: o.redrawYes, noLabel: o.redrawNo })
    ) {
      await run(() => api.draw(gid, adminKey, true), o.redrawn);
    }
  };

  const onUndo = async () => {
    if (
      await ask({
        title: o.undoTitle,
        text: o.undoText,
        warning: seen > 0 ? o.redrawWarning(seen) : undefined,
        yesLabel: o.undoYes,
        noLabel: o.undoNo,
      })
    ) {
      await run(() => api.undoDraw(gid, adminKey), o.undone);
    }
  };

  const onRelease = async (pid: string, name: string) => {
    if (await ask({ title: o.releaseTitle(name), text: o.releaseText, yesLabel: o.releaseYes, noLabel: o.releaseNo })) {
      await run(() => api.release(gid, adminKey, pid), o.released(name));
    }
  };

  const onDelete = async () => {
    if (!(await ask({ title: o.deleteTitle(group.name), text: o.deleteText, yesLabel: o.deleteYes, noLabel: o.deleteNo }))) return;
    setBusy(true);
    try {
      await api.deleteGroup(gid, adminKey);
      forgetGroup(gid);
      toast(o.deleted);
      navigate('/', { replace: true });
    } catch (error) {
      const code = error instanceof ApiClientError ? error.code : 'INTERNAL';
      toast(`${errorMessage(code).title}. ${errorMessage(code).text}`);
      setBusy(false);
    }
  };

  return (
    <Page title={group.name} eyebrow={o.eyebrow} back={<BackButton to="/" label={t.home} />}>
      <Facts deliveryDate={group.deliveryDate} budget={group.budget} />
      {group.drawn && <Notice tone="ok">{o.drawnBanner}</Notice>}

      <Card title={o.shareTitle(!group.drawn)}>
        <p>{group.drawn ? o.shareTextAfter : o.shareTextBefore}</p>
        <WhatsAppButton href={inviteWhatsApp(group.name, gid)}>{o.sendWhatsApp}</WhatsAppButton>
        <Button onClick={() => void copy(groupUrl(gid))}>{o.copyLink}</Button>
      </Card>

      {!group.drawn && (
        <Card title={o.drawTitle}>
          <p>{o.drawText}</p>
          <NavButton to={`/g/${gid}/organizar/editar`}>{o.edit}</NavButton>
          <Button variant="primary" busy={busy} onClick={() => void onDraw()}>
            {o.draw}
          </Button>
        </Card>
      )}

      <section className="stack" aria-labelledby="status-title">
        <h2 id="status-title">{o.statusTitle}</h2>
        {group.drawn && (
          <>
            <p>
              <strong>{o.statusSummary(seen, total)}</strong>
            </p>
            <div className="progress" aria-hidden="true">
              <div style={{ width: `${(seen / total) * 100}%` }} />
            </div>
          </>
        )}
        <ul className="status-list">
          {group.participants.map((p) => (
            <li key={p.id}>
              <span className="status-name">{p.name}</span>
              <span className={`pill pill-${p.status}`}>{o.status[p.status]}</span>
              {p.status !== 'out' && (
                <Button className="btn-small" disabled={busy} onClick={() => void onRelease(p.id, p.name)}>
                  {o.release}
                </Button>
              )}
            </li>
          ))}
        </ul>
        <WhatsAppButton href={reminderWhatsApp(group.name, gid)}>{o.remind}</WhatsAppButton>
        <NavButton to={`/g/${gid}`} variant="link">
          {o.joinMyself}
        </NavButton>
      </section>

      <Card title={o.saveLinkTitle}>
        <p>{o.saveLinkText}</p>
        <WhatsAppButton href={organizerWhatsApp(group.name, gid, adminKey)}>{o.saveLinkWhatsApp}</WhatsAppButton>
        <Button onClick={() => void copy(organizerUrl(gid, adminKey))}>{o.saveLinkCopy}</Button>
      </Card>

      <details className="card more">
        <summary>{o.moreOptions}</summary>
        <div className="stack">
          {group.drawn && (
            <>
              <NavButton to={`/g/${gid}/organizar/editar`}>{o.editDetails}</NavButton>
              <Button disabled={busy} onClick={() => void onRedraw()}>
                {o.redraw}
              </Button>
              <Button disabled={busy} onClick={() => void onUndo()}>
                {o.undo}
              </Button>
            </>
          )}
          <Button disabled={busy} onClick={() => void onDelete()}>
            {o.delete}
          </Button>
          <p className="hint">{o.deleteHint}</p>
        </div>
      </details>
      {dialog}
    </Page>
  );
}
