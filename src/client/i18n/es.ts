import type { ErrorCode } from '../../shared/errors';
import { LIMITS } from '../../shared/limits';

/**
 * Todos los textos visibles de la aplicación (RNF-12).
 * Lenguaje llano: nunca "link", "token", "login" ni códigos técnicos.
 */
export const t = {
  appName: 'Amigo Invisible',
  back: '‹ Volver',
  home: '‹ Inicio',
  goHome: 'Ir al inicio',
  retry: 'Reintentar',
  loading: 'Cargando…',
  understood: 'Entendido',
  copied: 'Enlace copiado',
  copyFailed: 'No se ha podido copiar. Mantén el dedo sobre el enlace para copiarlo.',
  delivery: 'Entrega',
  budget: 'Presupuesto',

  home_: {
    subtitle: 'Haz el sorteo y compártelo por WhatsApp. Sin registrarse.',
    create: 'Crear amigo invisible',
    myGroups: 'Mis amigos invisibles',
    organizer: 'Organizas',
    participant: 'Participas',
  },

  form: {
    createTitle: 'Nuevo amigo invisible',
    editTitle: 'Cambiar nombres y datos',
    editDetailsTitle: 'Cambiar nombre, fecha o presupuesto',
    groupName: 'Nombre del grupo',
    groupNamePlaceholder: 'Por ejemplo: Navidad Familia',
    date: 'Fecha de entrega',
    budget: 'Presupuesto',
    budgetPlaceholder: 'Por ejemplo: 20 €',
    optional: '(si quieres)',
    whoTitle: '¿Quién participa?',
    whoHint: `Escribe un nombre y pulsa «Añadir». Mínimo ${LIMITS.participantsMin} personas. No olvides ponerte a ti.`,
    personPlaceholder: 'Nombre',
    personLabel: 'Nombre de la persona',
    add: 'Añadir',
    remove: 'Quitar',
    removeLabel: (name: string) => `Quitar a ${name}`,
    count: (n: number) => `${n} ${n === 1 ? 'persona' : 'personas'}`,
    privacyNote: 'Solo se guardan los nombres y las ideas de regalo. Puedes borrarlo todo cuando termine el juego.',
    create: 'Crear',
    save: 'Guardar cambios',
    lockedParticipants: 'Para cambiar las personas, primero deshaz el sorteo en «Más opciones».',
    created: '¡Creado! Ya puedes enviar el enlace.',
    saved: 'Cambios guardados',
    errors: {
      groupNameRequired: 'Escribe el nombre del grupo.',
      groupNameTooLong: `Máximo ${LIMITS.groupNameMax} letras.`,
      personRequired: 'Escribe un nombre.',
      personTooLong: `Máximo ${LIMITS.personNameMax} letras.`,
      budgetTooLong: `Máximo ${LIMITS.budgetMax} letras.`,
      tooFew: `Hacen falta al menos ${LIMITS.participantsMin} personas.`,
      tooMany: `Máximo ${LIMITS.participantsMax} personas.`,
      duplicate: (name: string) => `Hay dos nombres iguales: ${name}. Añade una inicial, por ejemplo «${name} G.»`,
      alreadyInList: (name: string) => `Ya hay alguien llamado ${name}. Añade una inicial, por ejemplo «${name} G.»`,
      dateInPast: 'La fecha ya ha pasado.',
      dateInvalid: 'La fecha no es correcta.',
    },
  },

  organizer: {
    eyebrow: 'Organizas',
    drawnBanner: '✓ Sorteo hecho. Nadie, ni siquiera tú, puede ver los resultados de los demás.',
    shareTitle: (step: boolean) => `${step ? '1 · ' : ''}Envía el enlace al grupo`,
    shareTextBefore:
      'Un solo enlace para todos. Ya puedes enviarlo: cada persona puede elegir su nombre y escribir sus ideas antes del sorteo.',
    shareTextAfter: 'Un solo enlace para todos. Cada persona elige su nombre y ve a quién regala.',
    sendWhatsApp: 'Enviar por WhatsApp',
    copyLink: 'Copiar enlace',
    drawTitle: '2 · Cuando todo esté bien, haz el sorteo',
    drawText: 'Si hay algún nombre mal escrito o alguien tocó el nombre de otro, corrígelo antes de sortear.',
    edit: 'Cambiar nombres o datos',
    draw: 'Hacer el sorteo',
    drawConfirmTitle: '¿Hacer el sorteo ahora?',
    drawConfirmText: (n: number) => `Se repartirá entre ${n} personas. Tú tampoco verás a quién le toca cada uno.`,
    drawConfirmYes: 'Sí, hacer el sorteo',
    drawConfirmNo: 'No, todavía no',
    drawDone: '¡Sorteo hecho!',
    statusTitle: '¿Quién lo ha visto ya?',
    statusSummary: (seen: number, total: number) => `${seen} de ${total} ya saben a quién regalan.`,
    status: { out: 'Sin entrar', in: 'Ha entrado', seen: '✓ Ha visto a su amigo' },
    release: 'Dejar entrar de nuevo',
    releaseTitle: (name: string) => `¿Dejar entrar de nuevo a ${name}?`,
    releaseText: 'Úsalo si ha cambiado de móvil o si otra persona eligió su nombre por error. Su amigo invisible no cambia.',
    releaseYes: 'Sí, dejar entrar',
    releaseNo: 'No',
    released: (name: string) => `${name} puede volver a elegir su nombre`,
    remind: 'Recordar por WhatsApp',
    joinMyself: 'Elegir mi nombre (si tú también participas)',
    saveLinkTitle: 'Guarda tu enlace de organizador',
    saveLinkText: 'Este móvil lo recuerda. Si cambias de móvil, lo necesitarás para volver aquí. Es secreto: no lo compartas.',
    saveLinkWhatsApp: 'Enviármelo por WhatsApp',
    saveLinkCopy: 'Copiar mi enlace de organizador',
    moreOptions: 'Más opciones',
    editDetails: 'Cambiar nombre, fecha o presupuesto',
    redraw: 'Repetir el sorteo',
    redrawTitle: '¿Repetir el sorteo?',
    redrawWarning: (n: number) =>
      `${n} ${n === 1 ? 'persona ya ha visto' : 'personas ya han visto'} a quién regalan. Si repites el sorteo, tendrán que volver a mirarlo.`,
    redrawYes: 'Sí, repetir',
    redrawNo: 'No, dejarlo como está',
    redrawn: 'Sorteo repetido',
    undo: 'Deshacer el sorteo para cambiar personas',
    undoTitle: '¿Deshacer el sorteo?',
    undoText: 'Podrás cambiar los nombres y luego sortear otra vez.',
    undoYes: 'Sí, deshacer',
    undoNo: 'No',
    undone: 'Sorteo deshecho',
    delete: 'Borrar este amigo invisible',
    deleteTitle: (name: string) => `¿Borrar «${name}»?`,
    deleteText: 'Se borrará todo y el enlace dejará de funcionar. No se puede recuperar.',
    deleteYes: 'Sí, borrar',
    deleteNo: 'No, conservarlo',
    deleted: 'Amigo invisible borrado',
    deleteHint: 'Cuando termine el juego, puedes borrarlo todo.',
    invalidLinkTitle: 'Este enlace de organizador no es válido',
    invalidLinkText: 'Revisa que el enlace esté completo. Si lo has perdido, no se puede recuperar: crea un amigo invisible nuevo.',
  },

  participant: {
    eyebrow: 'Amigo invisible',
    whoAreYou: '¿Quién eres tú? Toca tu nombre',
    taken: 'Ya ha entrado',
    takenTitle: (name: string) => `${name} ya ha entrado`,
    takenText: 'Si eres tú y has cambiado de móvil, pide a quien organiza que te deje entrar de nuevo.',
    confirmTitle: (name: string) => `¿Eres ${name}?`,
    confirmYes: (name: string) => `Sí, soy ${name}`,
    confirmNo: 'No',
    justTaken: 'Otra persona acaba de elegir ese nombre. Mira la lista otra vez.',
    hello: (name: string) => `Hola, ${name}`,
    reveal: '🎁 Ver a quién regalo',
    notDrawn: 'Todavía no se ha hecho el sorteo. Vuelve a abrir este enlace más adelante.',
    myIdeasTitle: 'Mis ideas de regalo',
    myIdeasText: 'Escribe qué te gustaría, para que quien te regale acierte.',
    writeIdeas: 'Escribir mis ideas',
    changeIdeas: 'Cambiar mis ideas',
    notMe: (name: string) => `¿No eres ${name}? Toca aquí`,
    notMeTitle: (name: string) => `¿No eres ${name}?`,
    notMeText: 'Volverás a la lista para elegir tu nombre.',
    notMeYes: 'Elegir otro nombre',
    notMeNo: (name: string) => `Sí, soy ${name}`,
    youGiveTo: 'Te ha tocado regalar a',
    ideasOf: (name: string) => `Ideas de ${name}`,
    noIdeas: 'Todavía no ha escrito ideas. Vuelve a mirar más adelante.',
    secret: 'Es un secreto: no se lo digas a nadie 🤫',
    ideasLabel: '¿Qué te gustaría?',
    ideasPlaceholder: 'Por ejemplo: un libro de cocina, una bufanda azul…',
    ideasCount: (n: number) => `${n} de ${LIMITS.wishlistMax} letras`,
    save: 'Guardar',
    saved: 'Guardado',
    ideasTooLong: `Máximo ${LIMITS.wishlistMax} letras.`,
  },

  notFound: {
    groupTitle: 'No encontramos este amigo invisible',
    groupText: 'Puede que el enlace esté incompleto o que se haya borrado. Pide a quien organiza que te lo vuelva a enviar.',
    pageTitle: 'No encontramos esta página',
    pageText: 'Revisa que el enlace esté completo.',
  },

  whatsapp: {
    invite: (group: string, url: string) =>
      `🎁 ¡Amigo invisible «${group}»! Toca este enlace, elige tu nombre y descubre a quién le haces el regalo: ${url}`,
    reminder: (group: string, url: string) =>
      `🎁 Recordatorio del amigo invisible «${group}»: si todavía no has mirado a quién regalas, toca aquí: ${url}`,
    organizerLink: (group: string, url: string) =>
      `🔒 Mi enlace de organizador del amigo invisible «${group}». Es secreto, no lo compartas: ${url}`,
  },
} as const;

/** Mensajes de error en lenguaje llano (RF-20). */
export function errorMessage(code: ErrorCode | 'NETWORK'): { title: string; text: string } {
  switch (code) {
    case 'NETWORK':
      return { title: 'No hay conexión a Internet', text: 'Revisa tu conexión y vuelve a intentarlo.' };
    case 'RATE_LIMITED':
      return { title: 'Demasiados intentos', text: 'Espera un minuto y vuelve a intentarlo.' };
    case 'NOT_FOUND':
      return { title: t.notFound.groupTitle, text: t.notFound.groupText };
    default:
      return { title: 'Algo ha fallado', text: 'Vuelve a intentarlo en un momento.' };
  }
}
