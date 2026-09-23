/**
 * Fetch EVERY bar matching a directory filter, paging past the 1,000-row
 * cap (task 117).
 *
 * /api/bars caps perPage at 1,000 and Supabase returns at most 1,000 rows
 * per range, so a single `perPage=1000` request for the Cocktail Bar filter
 * came back with exactly 1,000 of the 1,651 matches and no error. The
 * directory then counted the rows it had ("1,000 bars found") and the grid
 * and map showed the same truncated set. This helper asks for page after
 * page until the API's own `total` is reached, so the count, the grid and
 * the map all cover the whole set.
 *
 * The API's `total` comes from the count:exact query in getBars(), so it is
 * the true total whatever the page size; the loop trusts it, and also stops
 * on a short page, so a total that is stale by a row cannot loop forever.
 */

export const FILTER_PAGE_SIZE = 1000;

export type PagedBars<T> = { bars: T[]; total?: number };

export async function fetchAllMatching<T extends { id: string }>(
  fetchPage: (page: number, perPage: number) => Promise<PagedBars<T>>
): Promise<{ bars: T[]; total: number }> {
  const first = await fetchPage(1, FILTER_PAGE_SIZE);
  const rows: T[] = [...(first.bars || [])];
  const reported = typeof first.total === 'number' ? first.total : rows.length;
  let last = rows.length;
  for (let page = 2; rows.length < reported && last === FILTER_PAGE_SIZE; page++) {
    const next = await fetchPage(page, FILTER_PAGE_SIZE);
    const got = next.bars || [];
    rows.push(...got);
    last = got.length;
  }
  // A row can move between pages while we read them; count each bar once.
  const seen = new Set<string>();
  const bars = rows.filter(b => (seen.has(b.id) ? false : (seen.add(b.id), true)));
  return { bars, total: Math.max(reported, bars.length) };
}
