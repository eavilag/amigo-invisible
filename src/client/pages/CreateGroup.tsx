import { useLocation } from 'wouter';
import { GroupForm } from '../components/GroupForm';
import { useToast } from '../components/Toast';
import { BackButton, Page } from '../components/ui';
import { t } from '../i18n/es';
import { api } from '../lib/api';
import { updateStoredGroup } from '../lib/storage';

/** Crear amigo invisible (RF-01, RF-02, CA-01.8). */
export function CreateGroup() {
  const [, navigate] = useLocation();
  const toast = useToast();

  return (
    <Page title={t.form.createTitle} back={<BackButton to="/" />}>
      <GroupForm
        initial={{ name: '', deliveryDate: '', budget: '', participants: [] }}
        submitLabel={t.form.create}
        showPrivacyNote
        onSubmit={async (values) => {
          const { groupId, adminKey } = await api.createGroup({
            name: values.name,
            deliveryDate: values.deliveryDate || null,
            budget: values.budget || null,
            participants: values.participants.map((p) => p.name),
          });
          updateStoredGroup(groupId, { name: values.name, adminKey });
          toast(t.form.created);
          navigate(`/g/${groupId}/organizar`, { replace: true });
        }}
      />
    </Page>
  );
}
