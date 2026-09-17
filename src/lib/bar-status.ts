/**
 * Whether a bar is open, and what to say when it is not.
 *
 * WHY (Roman, 2026-09-17): `bars.is_active` is a boolean and neither value
 * fitted Tayēr + Elementary, which is closed after a fire in its building with
 * no reopening date, and is also No. 5 on the World's 50 Best Bars and No. 1
 * in our own London Top 10. Deactivating it would have pulled it out of the
 * London directory, the city pages, the map and that article, and orphaned a
 * profile people are actively searching for. Leaving it active told every
 * visitor a burnt-out bar was open.
 *
 * `is_active` keeps its meaning and is NOT repurposed. A temporarily closed
 * bar stays active.
 *
 * Reads default to 'open', so this is inert until the column exists and
 * correct the moment it does. See scripts/bar-status-migration.sql.
 */

export type BarStatus = 'open' | 'temporarily_closed' | 'permanently_closed';

/** The subset this module reads, so callers need no full Bar. */
export interface BarStatusFields {
  status?: string | null;
  status_note?: string | null;
}

const KNOWN: BarStatus[] = ['open', 'temporarily_closed', 'permanently_closed'];

/** Never throws and never returns undefined: an unknown value reads as open. */
export function barStatus(bar: BarStatusFields | null | undefined): BarStatus {
  const s = String(bar?.status || '').trim().toLowerCase();
  return (KNOWN as string[]).includes(s) ? (s as BarStatus) : 'open';
}

export const isOpen = (bar: BarStatusFields | null | undefined) => barStatus(bar) === 'open';
export const isTemporarilyClosed = (bar: BarStatusFields | null | undefined) =>
  barStatus(bar) === 'temporarily_closed';
export const isPermanentlyClosed = (bar: BarStatusFields | null | undefined) =>
  barStatus(bar) === 'permanently_closed';

/** A bar that should not be emailed, suggested nearby, or sat at the top of a pick. */
export const isClosed = (bar: BarStatusFields | null | undefined) => !isOpen(bar);

/** The short label for a card pill, or "" when the bar is open. */
export function statusPill(bar: BarStatusFields | null | undefined): string {
  switch (barStatus(bar)) {
    case 'temporarily_closed': return 'Temporarily closed';
    case 'permanently_closed': return 'Permanently closed';
    default: return '';
  }
}

/**
 * The heading and body for the profile notice. The body prefers the row's own
 * `status_note`, because the reason is the thing a reader came for, and falls
 * back to a plain sentence when no note is stored.
 */
export function statusNotice(bar: BarStatusFields | null | undefined): { heading: string; body: string } | null {
  const note = String(bar?.status_note || '').trim();
  switch (barStatus(bar)) {
    case 'temporarily_closed':
      return {
        heading: 'Temporarily closed',
        body: note || 'This bar is temporarily closed. No reopening date has been announced.',
      };
    case 'permanently_closed':
      return {
        heading: 'Permanently closed',
        body: note || 'This bar has permanently closed.',
      };
    default:
      return null;
  }
}

/**
 * Sort key for the accolade picks: 0 for open, 1 for anything else, so a
 * "best bars" list leads with places a reader can go tonight. It never touches
 * the accolade score, because a bar that is shut did not stop being a 50 Best
 * bar; it only loses its position at the top of the list.
 */
export const closedLast = (bar: BarStatusFields | null | undefined) => (isOpen(bar) ? 0 : 1);
