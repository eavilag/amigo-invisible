import { Route, Switch } from 'wouter';
import { MessageScreen } from './components/StatusScreens';
import { ToastProvider } from './components/Toast';
import { t } from './i18n/es';
import { CreateGroup } from './pages/CreateGroup';
import { EditGroup } from './pages/EditGroup';
import { Home } from './pages/Home';
import { Ideas } from './pages/Ideas';
import { Organizer } from './pages/Organizer';
import { ParticipantHome } from './pages/ParticipantHome';
import { Reveal } from './pages/Reveal';

/** Rutas de la SPA (UX §2). La `key` fuerza un estado limpio al cambiar de grupo. */
export function App() {
  return (
    <ToastProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/nuevo" component={CreateGroup} />
        <Route path="/g/:gid/organizar/editar">{({ gid }) => <EditGroup key={gid} gid={gid} />}</Route>
        <Route path="/g/:gid/organizar">{({ gid }) => <Organizer key={gid} gid={gid} />}</Route>
        <Route path="/g/:gid/regalo">{({ gid }) => <Reveal key={gid} gid={gid} />}</Route>
        <Route path="/g/:gid/ideas">{({ gid }) => <Ideas key={gid} gid={gid} />}</Route>
        <Route path="/g/:gid">{({ gid }) => <ParticipantHome key={gid} gid={gid} />}</Route>
        <Route>
          <MessageScreen title={t.notFound.pageTitle} text={t.notFound.pageText} />
        </Route>
      </Switch>
    </ToastProvider>
  );
}
