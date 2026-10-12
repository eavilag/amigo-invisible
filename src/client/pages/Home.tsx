import { useState } from 'react';
import { GiftIcon } from '../components/Icons';
import { NavButton } from '../components/ui';
import { t } from '../i18n/es';
import { listStoredGroups } from '../lib/storage';

/** Portada y "Mis amigos invisibles" (RF-18). */
export function Home() {
  const [groups] = useState(listStoredGroups);
  const entries = groups.flatMap((g) => [
    ...(g.adminKey ? [{ key: `${g.gid}-o`, to: `/g/${g.gid}/organizar`, name: g.name, tag: t.home_.organizer }] : []),
    ...(g.participantToken ? [{ key: `${g.gid}-p`, to: `/g/${g.gid}`, name: g.name, tag: t.home_.participant }] : []),
  ]);

  return (
    <main className="page">
      <GiftIcon />
      <h1 className="center" tabIndex={-1}>
        {t.appName}
      </h1>
      <p className="center muted">{t.home_.subtitle}</p>
      <NavButton to="/nuevo" variant="primary">
        {t.home_.create}
      </NavButton>
      {entries.length > 0 && (
        <section className="stack" aria-labelledby="my-groups">
          <h2 id="my-groups">{t.home_.myGroups}</h2>
          <ul className="group-list">
            {entries.map((e) => (
              <li key={e.key}>
                <NavButton to={e.to} className="group-entry">
                  <span className="group-entry-name">{e.name || t.appName}</span>
                  <span className="tag">{e.tag}</span>
                </NavButton>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
