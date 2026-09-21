/**
 * One place to send a GA4 custom event.
 *
 * WHY GA4 AND NOT VERCEL (Roman, 2026-09-20). The claim-funnel arrival count
 * we are measuring against came from Vercel Analytics. Putting the events in
 * one system and the denominator in the other compares two populations with
 * different coverage, and the ratio is then wrong in a direction nobody can
 * estimate. So the whole funnel lives in GA4, denominator included, and the
 * absolute arrival number is expected to read lower than Vercel's. We need
 * the ratio, and anything that drops a visitor drops their page view and
 * their submit together, so the ratio survives.
 *
 * WHAT ACTUALLY REDUCES COVERAGE, since it is not what you would guess:
 * consent is NOT the main gate. GoogleAnalytics.tsx sets
 * `analytics_storage: 'granted'` by default and downgrades a decline to
 * Consent Mode v2 cookieless pings, so a visitor who rejects cookies still
 * sends events, just without a persistent identifier. What does reduce
 * coverage is the production-host guard (no events on previews or local) and
 * ad blockers.
 *
 * NEVER SEND ANYTHING THAT IDENTIFIES A PERSON. A bar name typed into the
 * search box is fine; it names a business. An email address, a claimant name
 * or anything from the form is not, and must not be passed here.
 */

type GtagParams = Record<string, string | number | boolean | undefined>;

// NO `declare global` here. GoogleAnalytics.tsx already declares
// Window.gtag, and a second declaration with a different signature is a
// TS2717 conflict rather than a merge. This reads the existing one.
type GtagFn = (command: string, ...args: unknown[]) => void;

/**
 * Fire a GA4 event, or do nothing at all.
 *
 * Silent by design on every path where gtag is absent: server render, local
 * dev, a preview deploy, an ad blocker. An analytics call must never be able
 * to break the page it is measuring, so this swallows its own errors too.
 */
export function gaEvent(name: string, params: GtagParams = {}): void {
  try {
    // The window check FIRST: referencing window before it would throw a
    // ReferenceError on the server, and relying on the catch below to hide
    // that is not the same as not doing it.
    if (typeof window === 'undefined') return;
    const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
    if (typeof gtag !== 'function') return;
    const clean: GtagParams = {};
    for (const key of Object.keys(params)) {
      const v = params[key];
      if (v !== undefined) clean[key] = v;
    }
    gtag('event', name, clean);
  } catch {
    // An analytics failure is not a user-facing failure.
  }
}

/**
 * The claim-funnel event names, in one place so the report and the code
 * cannot drift. Each is prefixed so they group in the GA4 events list.
 */
export const CLAIM_EVENTS = {
  /** The denominator. Fires once per claim-page mount. */
  pageView: 'claim_page_view',
  /** A search that found nothing. `query` is a bar name, not a person. */
  searchNoResults: 'claim_search_no_results',
  /** The submit button did its work, whatever the outcome. */
  submitAttempt: 'claim_submit_attempt',
  /** How that attempt ended, so the last step is measurable in GA4 too. */
  submitResult: 'claim_submit_result',
} as const;
