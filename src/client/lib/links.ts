import { t } from '../i18n/es';

/** Enlace del grupo que se comparte (ADR-0006). */
export const groupUrl = (gid: string) => `${window.location.origin}/g/${gid}`;

/** Enlace de organizador: la clave va en el fragmento, que nunca se envía al servidor. */
export const organizerUrl = (gid: string, adminKey: string) => `${window.location.origin}/g/${gid}/organizar#${adminKey}`;

/** Abre WhatsApp con el texto ya escrito; el usuario elige el chat (CA-03.1). */
export const whatsappUrl = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

export const inviteWhatsApp = (group: string, gid: string) => whatsappUrl(t.whatsapp.invite(group, groupUrl(gid)));
export const reminderWhatsApp = (group: string, gid: string) => whatsappUrl(t.whatsapp.reminder(group, groupUrl(gid)));
export const organizerWhatsApp = (group: string, gid: string, adminKey: string) =>
  whatsappUrl(t.whatsapp.organizerLink(group, organizerUrl(gid, adminKey)));

/** Copia al portapapeles. Devuelve false si el navegador no lo permite. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
