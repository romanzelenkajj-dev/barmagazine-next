/**
 * Field allowlist for owner-submitted edits.
 *
 * Two enforcement points, per the claiming spec:
 *   1. On submission  — `/api/owner/bars` PUT and `/api/owner/photos` filter
 *      before anything is stored in `owner_submissions.submitted_data`.
 *   2. On approval    — an approver must build its `bars.update()` payload with
 *      `buildOwnerBarUpdate()`. The approve path spreads a fields object into
 *      `bars.update()`, so an unfiltered key stored on an old row would apply
 *      on a fast approval click. Filtering only at submission would leave rows
 *      written before this shipped (or by any future writer) unguarded.
 *
 * Anything not on the allowlist is dropped, so a column added to `bars` later
 * is closed by default rather than silently editable.
 */

/** Fields a verified owner may change (subject to review before publishing). */
export const OWNER_EDITABLE_FIELDS = [
  'address',
  'phone',
  'website',
  'instagram',
  'email',
  'opening_hours',
  'reservation_url',
  'whatsapp',
  'menu_url',
  'menu_sections',
  'photos',
] as const;

/**
 * Editorial and identity fields owners must never touch. Listed explicitly so
 * a rejected key can be reported back rather than silently vanishing, and so
 * the intent is greppable — the allowlist above is what actually enforces.
 */
export const OWNER_FORBIDDEN_FIELDS = [
  'description',
  'accolades',
  'tier',
  'is_active',
  'is_verified',
  'wp_article_slug',
  'name',
  'slug',
  'city',
  'country',
  'lat',
  'lng',
] as const;

export type OwnerEditableField = (typeof OWNER_EDITABLE_FIELDS)[number];

const ALLOWED = new Set<string>(OWNER_EDITABLE_FIELDS);

/**
 * The photo upload route stores its URLs under `gallery_images`, while the
 * column on `bars` is `photos`. Map it here so approval writes the right
 * column instead of dropping the upload.
 *
 * A Map, not an object literal: a plain object would resolve inherited keys —
 * `aliases['__proto__']` returns Object.prototype, which is truthy and would
 * let a polluting key through the check below.
 */
const KEY_ALIASES = new Map<string, OwnerEditableField>([['gallery_images', 'photos']]);

export interface FilterResult {
  /** Keys that survived, ready to store or to write to `bars`. */
  allowed: Record<string, unknown>;
  /** Keys that were dropped, so the caller can tell the owner what was ignored. */
  rejected: string[];
}

/**
 * Keep only fields an owner is allowed to change.
 * Non-object input yields an empty result rather than throwing — callers get
 * request bodies straight off the wire.
 */
export function filterOwnerFields(input: unknown): FilterResult {
  const allowed: Record<string, unknown> = {};
  const rejected: string[] = [];

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { allowed, rejected };
  }

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const target = ALLOWED.has(key) ? key : KEY_ALIASES.get(key);
    if (target) {
      allowed[target] = value;
    } else {
      rejected.push(key);
    }
  }

  return { allowed, rejected };
}

/**
 * Build the `bars.update()` payload for an approved owner submission.
 * This is the ONLY supported way to turn `submitted_data` into a bar update —
 * approvers must not spread `submitted_data` directly.
 */
export function buildOwnerBarUpdate(submittedData: unknown): Record<string, unknown> {
  return filterOwnerFields(submittedData).allowed;
}
