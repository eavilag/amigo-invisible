import { z } from 'zod';
import { isValidIsoDate } from './dates';
import { LIMITS } from './limits';
import { cleanLine, cleanMultiline, findDuplicateName } from './normalize';
import { ID_PATTERN, SECRET_PATTERN } from './patterns';

/**
 * Esquemas de validación compartidos por cliente y servidor (ADR-0005).
 * Las longitudes se comprueban DESPUÉS de limpiar el texto. Un límite previo
 * generoso evita procesar cadenas enormes.
 */

const RAW_MAX = 2000;

const line = (max: number, min = 1) => z.string().max(RAW_MAX).transform(cleanLine).pipe(z.string().min(min).max(max));

export const idSchema = z.string().regex(ID_PATTERN);
export const secretSchema = z.string().regex(SECRET_PATTERN);

export const groupNameSchema = line(LIMITS.groupNameMax);
export const personNameSchema = line(LIMITS.personNameMax);

/** Opcional: vacío o ausente equivale a `null`. */
export const budgetSchema = z
  .string()
  .max(RAW_MAX)
  .transform(cleanLine)
  .pipe(z.string().max(LIMITS.budgetMax))
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional()
  .transform((v) => v ?? null);

export const deliveryDateSchema = z
  .union([z.literal(''), z.string().refine(isValidIsoDate, { message: 'invalid_date' })])
  .nullable()
  .optional()
  .transform((v) => (v ? v : null));

export const wishlistSchema = z
  .string()
  .max(RAW_MAX * 2)
  .transform(cleanMultiline)
  .pipe(z.string().max(LIMITS.wishlistMax));

const participantsArray = <T extends z.ZodType>(item: T) => z.array(item).min(LIMITS.participantsMin).max(LIMITS.participantsMax);

function rejectDuplicates(names: readonly string[], ctx: z.RefinementCtx, path: (string | number)[]) {
  const duplicate = findDuplicateName(names);
  if (duplicate !== null) {
    ctx.addIssue({ code: 'custom', path, message: 'duplicate_name', params: { apiCode: 'DUPLICATE_NAME', name: duplicate } });
  }
}

export const createGroupRequestSchema = z
  .strictObject({
    name: groupNameSchema,
    deliveryDate: deliveryDateSchema,
    budget: budgetSchema,
    participants: participantsArray(personNameSchema),
  })
  .superRefine((value, ctx) => rejectDuplicates(value.participants, ctx, ['participants']));

export const participantEditSchema = z.strictObject({ id: idSchema.optional(), name: personNameSchema });

export const patchGroupRequestSchema = z
  .strictObject({
    name: groupNameSchema.optional(),
    deliveryDate: z
      .union([z.literal(''), z.string().refine(isValidIsoDate)])
      .nullable()
      .optional(),
    budget: budgetSchema.optional(),
    participants: participantsArray(participantEditSchema).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.participants) return;
    rejectDuplicates(
      value.participants.map((p) => p.name),
      ctx,
      ['participants'],
    );
    const ids = value.participants.flatMap((p) => (p.id ? [p.id] : []));
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: 'custom', path: ['participants'], message: 'duplicate_id' });
    }
  });

export const claimRequestSchema = z.strictObject({ participantId: idSchema });
export const wishlistRequestSchema = z.strictObject({ wishlist: wishlistSchema });
export const drawRequestSchema = z.strictObject({ redo: z.boolean().optional().default(false) });

export type CreateGroupRequest = z.input<typeof createGroupRequestSchema>;
export type PatchGroupRequest = z.input<typeof patchGroupRequestSchema>;
export type ParticipantEdit = z.input<typeof participantEditSchema>;
