/**
 * Columns on `bars` that never leave the server.
 *
 * `admin_notes` (added 2026-09-14) holds internal editorial flags: an address
 * taken from third parties pending first-party confirmation, a handle the
 * venue does not publish, an outreach decision. It is not owner-editable
 * (owner-fields.ts) and it must not reach a rendered page, a client
 * component's props, or the public JSON API.
 *
 * The app reads with `select('*')` in several places and hands whole rows to
 * client components (`initialBars`, `bars=`), so exclusion cannot rely on
 * each caller remembering. Every public read path in supabase.ts passes its
 * rows through stripPrivate(); add a column here and it is gone everywhere
 * at once. Admin routes use their own service client and are not stripped.
 *
 * Row-level security cannot hide a column, and a column-level REVOKE from
 * the anon role would break every `select('*')` in the app, so the anon
 * REST endpoint itself can still read the column. If that matters, the
 * column moves to its own service-role-only table; this helper is the
 * application boundary until then.
 */
export const PRIVATE_BAR_COLUMNS = ['admin_notes'] as const;

/**
 * Columns added after this boundary existed that are PUBLIC by decision, so
 * the next reader does not have to wonder whether they were forgotten here.
 *
 * `neighborhood` (added 2026-09-15): editorial, renders in the nearby block
 * in place of the street line. Backfilled only where the venue's own site
 * states it; an inferred neighborhood stays in admin_notes.
 *
 * `state` (added 2026-09-15): the two-letter US state or Canadian province.
 * Renders in the location label ("Portland, Maine") and decides the city
 * slug for same-name cities (portland-me). Public, and part of the address.
 */
export const PUBLIC_EDITORIAL_COLUMNS = ['neighborhood', 'state', 'specials'] as const;

export function stripPrivate<T extends Record<string, unknown>>(row: T): T {
  let out: Record<string, unknown> | null = null;
  for (const c of PRIVATE_BAR_COLUMNS) {
    if (c in row) {
      if (!out) out = { ...row };
      delete out[c];
    }
  }
  return (out ?? row) as T;
}

export function stripPrivateAll<T extends Record<string, unknown>>(rows: T[]): T[] {
  return rows.map(stripPrivate);
}
