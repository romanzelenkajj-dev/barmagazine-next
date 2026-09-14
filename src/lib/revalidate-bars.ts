import { revalidatePath } from 'next/cache';

/**
 * Revalidate the public surfaces that render bar directory data, so admin
 * edits and submission approvals show up on the live site immediately instead
 * of waiting out each route's own window. Call after any write to the `bars`
 * table.
 *
 * A bar's name, city, type, tier and photo appear on CARDS, not just on its
 * profile, so every surface that renders a card has to be listed here. The
 * ones with hour-long windows are the reason: before they were added, a
 * rename could sit corrected on the profile and stale in the city guides for
 * an hour, which is exactly how it looks to a reader who followed a link.
 *
 * Known residual: /api/bars serves filtered and paginated results keyed by
 * query string, and revalidatePath cannot purge every variant, so a
 * "load more" or a filtered grid can still show an old value for up to its
 * 5 minute window.
 */
export function revalidateBarPages(slugs: string[] = []) {
  // Homepage: renders the top 10 band straight from `bars` (300s).
  revalidatePath('/');

  // The directory proper (300s each).
  revalidatePath('/bars');
  revalidatePath('/bars-map');
  revalidatePath('/bars/city/[city]', 'page');
  revalidatePath('/bars/country/[country]', 'page');

  // SEO city guides and partner collections. These render the same cards on
  // a 3600s window, so they are the slowest to self-correct and the most
  // important to purge here.
  revalidatePath('/best-bars/[city]', 'page');
  revalidatePath('/best-bars/[city]/[type]', 'page');
  revalidatePath('/collections/[slug]', 'page');

  // Cached route handlers backing the map and the grid. The map endpoint
  // carries bar names into its markers and sits on a 600s window of its own.
  revalidatePath('/api/bars/map');
  revalidatePath('/api/bars');

  // The bar's own profile.
  for (const slug of slugs) {
    if (slug) revalidatePath(`/bars/${slug}`);
  }
}
