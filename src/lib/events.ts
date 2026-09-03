/**
 * Promoted events on /events — the landing surface for the paid Event
 * Promotion package. Config-driven like collections.ts: no DB migration,
 * entries added deal by deal.
 */

export interface PromotedEvent {
  slug: string;
  title: string;
  city: string;
  /** Display string, exactly as it should read on the card. */
  dateRange: string;
  /** ISO date (YYYY-MM-DD). The card drops off automatically once this day
      has ended everywhere on earth (UTC+14 cutoff). */
  endDate: string;
  /** One line on the card. */
  blurb: string;
  /** The full story, usually a magazine article. */
  articleUrl: string;
  /** Optional card image (a /public path or absolute URL). */
  image?: string;
}

export const EVENTS: PromotedEvent[] = [
  {
    slug: 'margarita-mile-hong-kong-2026',
    title: 'Margarita Mile 2026',
    city: 'Hong Kong',
    dateRange: 'September 1-16, 2026',
    endDate: '2026-09-16',
    blurb:
      'Ten bars, one passport, and a grand prize trip to Tequila, Mexico. ' +
      'Closing party September 16 at Honky Tonks Tavern.',
    articleUrl: '/margarita-mile-hong-kong-2026',
  },
];

/**
 * Events still running or upcoming, soonest ending first. An event stays
 * listed through the whole of its end date in every timezone, then drops off
 * on the next ISR pass.
 */
export function upcomingEvents(now: Date = new Date()): PromotedEvent[] {
  // UTC-12 is the LAST timezone to finish a calendar day, so this keeps the
  // event live until its end date is over everywhere. (+14:00 would be the
  // first, dropping events a day early - caught by the test.)
  return EVENTS.filter(e => now.getTime() <= new Date(`${e.endDate}T23:59:59-12:00`).getTime()).sort(
    (a, b) => a.endDate.localeCompare(b.endDate)
  );
}
