import { useLocation } from 'wouter';
import { GroupForm } from '../components/GroupForm';
import { ErrorScreen, LoadingScreen, MessageScreen } from '../components/StatusScreens';
import { useToast } from '../components/Toast';
import { BackButton, Page } from '../components/ui';
import { useAdminGroup } from '../hooks/useAdminGroup';
import { t } from '../i18n/es';
import { api } from '../lib/api';
import { updateStoredGroup } from '../lib/storage';

/** Cambiar nombres y datos (RF-04). Tras el sorteo solo nombre, fecha y presupuesto (CA-05.4). */
export function EditGroup({ gid }: { gid: string }) {
  const [, navigate] = useLocation();
  const toast = useToast();
  const [state, reload] = useAdminGroup(gid);
  const panel = `/g/${gid}/organizar`;

  if (state.status === 'loading') return <LoadingScreen />;
  if (state.status === 'error') return <ErrorScreen error={state.error} onRetry={() => void reload()} />;
  const result = state.data;
  if (result.kind === 'invalid') return <MessageScreen title={t.organizer.invalidLinkTitle} text={t.organizer.invalidLinkText} />;
  if (result.kind === 'gone') return <MessageScreen title={t.notFound.groupTitle} text={t.notFound.groupText} />;

  const { group, adminKey } = result;
  return (
    <Page title={group.drawn ? t.form.editDetailsTitle : t.form.editTitle} back={<BackButton to={panel} />}>
      <GroupForm
        initial={{
          name: group.name,
          deliveryDate: group.deliveryDate ?? '',
          budget: group.budget ?? '',
          participants: group.participants.map(({ id, name }) => ({ id, name })),
        }}
        participantsLocked={group.drawn}
        submitLabel={t.form.save}
        onSubmit={async (values) => {
          await api.updateGroup(gid, adminKey, {
            name: values.name,
            budget: values.budget,
            ...(values.deliveryDate !== (group.deliveryDate ?? '') ? { deliveryDate: values.deliveryDate || null } : {}),
            ...(group.drawn ? {} : { participants: values.participants }),
          });
          updateStoredGroup(gid, { name: values.name });
          toast(t.form.saved);
          navigate(panel, { replace: true });
        }}
      />
    </Page>
  );
}
