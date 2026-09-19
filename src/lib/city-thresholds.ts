/**
 * Thin-page thresholds for the city routes.
 *
 * A leaf module on purpose: it imports nothing, so the routes, the sitemap
 * and the tests can all read the same numbers without dragging the Supabase
 * client in behind them.
 */

/** /best-bars/<city> exists only above this; below it the route 404s. */
export const MIN_CITY_BARS = 5;

/** /best-bars/<city>/<type> exists only above this. */
export const MIN_TYPE_BARS = 4;

/**
 * The directory page at /bars/city/<slug> is NOT gated: every city with a bar
 * keeps a page, because that page is how a reader and a crawler reach the
 * profiles. But 117 of 200 carry one or two bars, and "Best Cocktail Bars in
 * X" over a single row is a thin page that competes with our own stronger
 * ones. Below this count the page stays live, linked and followable, and is
 * marked noindex and kept out of the sitemap.
 *
 * Count-driven on purpose: a city that reaches four becomes indexable on the
 * next revalidate, with nothing to edit and no list to maintain.
 */
export const MIN_INDEXABLE_CITY_BARS = 4;

/**
 * The single predicate behind both the page's robots tag and the sitemap
 * filter, so the two can never drift into telling Google different things
 * about the same URL.
 */
export function isIndexableCity(count: number): boolean {
  return count >= MIN_INDEXABLE_CITY_BARS;
}

/**
 * A metro needs this many active bars to appear in the directory's city
 * dropdown by default (Roman, 2026-09-19).
 *
 * The list was 217 long and 95 of those cities had a single bar, almost none
 * of them a suburb of anything: Tirana, Sarajevo, Nairobi, Reykjavik, capital
 * cities with one bar each. Folding suburbs into their metros only took it to
 * 207, so the rollup was never the lever for this. At three the list is 91.
 *
 * NOTHING IS HIDDEN. The dropdown carries an "All cities" escape that expands
 * it to every metro, so a one-bar city is one click away rather than absent,
 * and the city page, the search and the sitemap are all untouched by this
 * number. It governs the default length of one menu.
 */
export const MIN_DROPDOWN_CITY_BARS = 3;
