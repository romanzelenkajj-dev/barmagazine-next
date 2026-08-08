import { revalidatePath } from 'next/cache';

/**
 * Revalidate the public pages that render bar directory data, so admin edits
 * and submission approvals show up on the live site immediately instead of
 * waiting out the 5-minute ISR window. Call after any write to the `bars`
 * table.
 *
 * Note: the CDN cache on /api/bars responses (s-maxage=300) is not touched by
 * this, so paginated "load more" / filter results can still lag by up to
 * 5 minutes — but the initial directory grid, map, and profile pages update
 * right away.
 */
export function revalidateBarPages(slugs: string[] = []) {
  revalidatePath('/bars');
  revalidatePath('/bars-map');
  revalidatePath('/bars/city/[city]', 'page');
  revalidatePath('/bars/country/[country]', 'page');
  for (const slug of slugs) {
    if (slug) revalidatePath(`/bars/${slug}`);
  }
}
