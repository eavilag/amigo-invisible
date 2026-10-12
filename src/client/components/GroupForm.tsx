import { type FormEvent, useId, useRef, useState } from 'react';
import { todayIso, isPastDate } from '../../shared/dates';
import { LIMITS } from '../../shared/limits';
import { cleanLine, findDuplicateName, nameKey } from '../../shared/normalize';
import { errorMessage, t } from '../i18n/es';
import { ApiClientError } from '../lib/api';
import { Button } from './ui';

export interface GroupFormValues {
  name: string;
  deliveryDate: string;
  budget: string;
  participants: { id?: string; name: string }[];
}

interface Props {
  initial: GroupFormValues;
  submitLabel: string;
  showPrivacyNote?: boolean;
  /** Tras el sorteo no se pueden cambiar personas (CA-05.4). */
  participantsLocked?: boolean;
  onSubmit: (values: GroupFormValues) => Promise<void>;
}

interface Errors {
  name?: string;
  deliveryDate?: string;
  budget?: string;
  people?: string;
  add?: string;
  form?: string;
}

let rowCounter = 0;
const newRow = (p: { id?: string; name: string }) => ({ ...p, key: `row-${++rowCounter}` });

/** Formulario de crear/cambiar grupo (RF-01, RF-04). Valida igual que el servidor y traduce sus errores. */
export function GroupForm({ initial, submitLabel, showPrivacyNote = false, participantsLocked = false, onSubmit }: Props) {
  const ids = useId();
  const [name, setName] = useState(initial.name);
  const [deliveryDate, setDeliveryDate] = useState(initial.deliveryDate);
  const [budget, setBudget] = useState(initial.budget);
  const [people, setPeople] = useState(() => initial.participants.map(newRow));
  const [newName, setNewName] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const newInput = useRef<HTMLInputElement>(null);
  const full = people.length >= LIMITS.participantsMax;

  const addPerson = () => {
    const value = cleanLine(newName);
    if (!value) return setErrors((e) => ({ ...e, add: t.form.errors.personRequired }));
    if (full) return setErrors((e) => ({ ...e, add: t.form.errors.tooMany }));
    const existing = people.find((p) => nameKey(p.name) === nameKey(value));
    if (existing) return setErrors((e) => ({ ...e, add: t.form.errors.alreadyInList(cleanLine(existing.name)) }));
    setPeople((list) => [...list, newRow({ name: value })]);
    setNewName('');
    setErrors((e) => ({ ...e, add: undefined, people: undefined }));
    newInput.current?.focus();
  };

  const validate = (list: { name: string }[]): Errors => {
    const found: Errors = {};
    const groupName = cleanLine(name);
    if (!groupName) found.name = t.form.errors.groupNameRequired;
    else if (groupName.length > LIMITS.groupNameMax) found.name = t.form.errors.groupNameTooLong;
    if (deliveryDate && deliveryDate !== initial.deliveryDate && isPastDate(deliveryDate)) found.deliveryDate = t.form.errors.dateInPast;
    if (cleanLine(budget).length > LIMITS.budgetMax) found.budget = t.form.errors.budgetTooLong;
    if (!participantsLocked) {
      const names = list.map((p) => cleanLine(p.name));
      const duplicate = findDuplicateName(names);
      if (names.some((n) => !n)) found.people = t.form.errors.personRequired;
      else if (names.some((n) => n.length > LIMITS.personNameMax)) found.people = t.form.errors.personTooLong;
      else if (names.length < LIMITS.participantsMin) found.people = t.form.errors.tooFew;
      else if (names.length > LIMITS.participantsMax) found.people = t.form.errors.tooMany;
      else if (duplicate) found.people = t.form.errors.duplicate(duplicate);
    }
    return found;
  };

  const fromServer = (error: unknown): Errors => {
    if (!(error instanceof ApiClientError)) return { form: errorMessage('INTERNAL').text };
    switch (error.code) {
      case 'TOO_FEW':
        return { people: t.form.errors.tooFew };
      case 'TOO_MANY':
        return { people: t.form.errors.tooMany };
      case 'DUPLICATE_NAME':
        return { people: t.form.errors.duplicate(error.details.name ?? '') };
      case 'DATE_IN_PAST':
        return { deliveryDate: t.form.errors.dateInPast };
      case 'VALIDATION': {
        const field = error.details.field ?? '';
        if (field === 'name') return { name: t.form.errors.groupNameRequired };
        if (field === 'budget') return { budget: t.form.errors.budgetTooLong };
        if (field === 'deliveryDate') return { deliveryDate: t.form.errors.dateInvalid };
        if (field.startsWith('participants')) return { people: t.form.errors.personTooLong };
        return { form: errorMessage('INTERNAL').text };
      }
      default: {
        const message = errorMessage(error.code);
        return { form: `${message.title}. ${message.text}` };
      }
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    // Un nombre escrito sin pulsar «Añadir» se añade solo: es un despiste frecuente.
    let list = people;
    const pending = participantsLocked ? '' : cleanLine(newName);
    if (pending) {
      list = [...people, newRow({ name: pending })];
      setPeople(list);
      setNewName('');
    }
    const found = validate(list);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>('[aria-invalid="true"], .field-error')?.scrollIntoView({ block: 'center' });
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        name: cleanLine(name),
        deliveryDate,
        budget: cleanLine(budget),
        participants: list.map(({ id, name: personName }) => ({ ...(id ? { id } : {}), name: cleanLine(personName) })),
      });
    } catch (error) {
      setErrors(fromServer(error));
      setBusy(false);
    }
  };

  const fieldError = (id: string, message?: string) =>
    message ? (
      <p id={id} className="field-error" role="alert">
        {message}
      </p>
    ) : null;

  return (
    <form className="stack-lg" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor={`${ids}-name`}>{t.form.groupName}</label>
        <input
          id={`${ids}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={LIMITS.groupNameMax}
          placeholder={t.form.groupNamePlaceholder}
          autoComplete="off"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${ids}-name-error` : undefined}
        />
        {fieldError(`${ids}-name-error`, errors.name)}
      </div>

      <div className="field">
        <label htmlFor={`${ids}-date`}>
          {t.form.date} <span className="hint">{t.form.optional}</span>
        </label>
        <input
          id={`${ids}-date`}
          type="date"
          value={deliveryDate}
          min={todayIso()}
          onChange={(e) => setDeliveryDate(e.target.value)}
          aria-invalid={errors.deliveryDate ? true : undefined}
          aria-describedby={errors.deliveryDate ? `${ids}-date-error` : undefined}
        />
        {fieldError(`${ids}-date-error`, errors.deliveryDate)}
      </div>

      <div className="field">
        <label htmlFor={`${ids}-budget`}>
          {t.form.budget} <span className="hint">{t.form.optional}</span>
        </label>
        <input
          id={`${ids}-budget`}
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          maxLength={LIMITS.budgetMax}
          placeholder={t.form.budgetPlaceholder}
          autoComplete="off"
          aria-invalid={errors.budget ? true : undefined}
          aria-describedby={errors.budget ? `${ids}-budget-error` : undefined}
        />
        {fieldError(`${ids}-budget-error`, errors.budget)}
      </div>

      <fieldset className="stack" disabled={participantsLocked}>
        <legend>
          <h2>{t.form.whoTitle}</h2>
        </legend>
        {participantsLocked ? (
          <p className="hint">{t.form.lockedParticipants}</p>
        ) : (
          <p className="hint" id={`${ids}-who-hint`}>
            {t.form.whoHint}
          </p>
        )}
        <ul className="people" aria-label={t.form.count(people.length)}>
          {people.map((person, index) => (
            <li key={person.key}>
              <input
                value={person.name}
                maxLength={LIMITS.personNameMax}
                aria-label={`${t.form.personLabel} ${index + 1}`}
                autoComplete="off"
                onChange={(e) => {
                  const value = e.target.value;
                  setPeople((list) => list.map((p) => (p.key === person.key ? { ...p, name: value } : p)));
                }}
              />
              {!participantsLocked && (
                <Button
                  className="btn-small"
                  aria-label={t.form.removeLabel(person.name)}
                  onClick={() => setPeople((list) => list.filter((p) => p.key !== person.key))}
                >
                  {t.form.remove}
                </Button>
              )}
            </li>
          ))}
        </ul>
        {!participantsLocked && (
          <>
            <div className="add-row">
              <input
                ref={newInput}
                value={newName}
                maxLength={LIMITS.personNameMax}
                placeholder={t.form.personPlaceholder}
                aria-label={t.form.personLabel}
                aria-describedby={`${ids}-who-hint`}
                autoComplete="off"
                enterKeyHint="done"
                disabled={full}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (errors.add) setErrors((x) => ({ ...x, add: undefined }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPerson();
                  }
                }}
              />
              <Button onClick={addPerson} disabled={full}>
                {t.form.add}
              </Button>
            </div>
            <p className="hint">{full ? t.form.errors.tooMany : t.form.count(people.length)}</p>
            {fieldError(`${ids}-add-error`, errors.add)}
            {fieldError(`${ids}-people-error`, errors.people)}
          </>
        )}
      </fieldset>

      {showPrivacyNote && <p className="hint">{t.form.privacyNote}</p>}
      {fieldError(`${ids}-form-error`, errors.form)}
      <Button type="submit" variant="primary" busy={busy}>
        {submitLabel}
      </Button>
    </form>
  );
}
