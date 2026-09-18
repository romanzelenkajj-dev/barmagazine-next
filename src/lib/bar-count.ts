import { unstable_cache } from 'next/cache';
import { getBarStats } from './supabase';

/**
 * Directory stats for marketing copy, from the same getBarStats() the /bars
 * hero already renders: one definition of "how many cities", not two that
 * disagree (the hardcoded copy claimed 140 cities while the hero showed the
 * live count beside it).
 *
 * Bars are rounded DOWN to the nearest hundred because the copy appends "+",
 * and rounding down is what keeps the "+" honest. Cities and countries are
 * exact.
 *
 * WHY THIS IS CACHED (2026-09-18). The comment here used to say "callers are
 * ISR pages, so the numbers refresh on their own revalidate schedule". That
 * stopped being true when /feature-your-bar became a dynamic route: it reads
 * cookies() for currency, so it is server-rendered on EVERY request, and so
 * is the root layout above it. Both call this function and neither call was
 * memoised.
 *
 * getBarStats() is not one cheap query. It is a count, then a paginated scan
 * that pulls every active bar's city and country: about 1,470 rows today, and
 * a further page for every 1,000 bars we add. Measured 2026-09-18 it costs
 * roughly 1,100ms cold and 530ms warm, so a single visit to the pricing page
 * was spending about 1.7 seconds and 2,900 rows on two counters in marketing
 * copy. Under any Supabase slowness that is what pushes the function past its
 * limit and returns the 502 and blank "client-side exception" Roman saw.
 *
 * Two defences, because they fail differently:
 *   unstable_cache  so almost no request queries at all, and the layout and
 *                   the page share one result instead of doing it twice.
 *   STATS_TIMEOUT   so a hang degrades to the fallbacks quickly. A try/catch
 *                   cannot catch a query that never returns, and that is the
 *                   case that actually took the page down.
 *
 * The numbers are rounded-down marketing counters with hardcoded fallbacks,
 * so minutes of staleness costs nothing and a blank pricing page costs a sale.
 */
export interface DirectoryStats {
  barsRounded: number;
  cities: number;
  countries: number;
}

/** Long enough that the scan is rare, short enough that a wave shows up the same day. */
const STATS_TTL_SECONDS = 600;
/** Well inside the function limit, so we fall back rather than time out. */
const STATS_TIMEOUT_MS = 2500;

const FALLBACK: DirectoryStats = { barsRounded: 1000, cities: 140, countries: 58 };

const loadStats = unstable_cache(
  async (): Promise<DirectoryStats> => {
    const { totalBars, totalCities, totalCountries } = await getBarStats();
    return {
      barsRounded: totalBars ? Math.floor(totalBars / 100) * 100 : FALLBACK.barsRounded,
      cities: totalCities || FALLBACK.cities,
      countries: totalCountries || FALLBACK.countries,
    };
  },
  ['directory-stats'],
  { revalidate: STATS_TTL_SECONDS, tags: ['directory-stats'] },
);

export async function getDirectoryStats(): Promise<DirectoryStats> {
  try {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<DirectoryStats>((resolve) => {
      timer = setTimeout(() => resolve(FALLBACK), STATS_TIMEOUT_MS);
    });
    const stats = await Promise.race([loadStats(), timeout]);
    if (timer) clearTimeout(timer);
    return stats;
  } catch {
    return FALLBACK;
  }
}

export async function getBarCountRounded(): Promise<number> {
  return (await getDirectoryStats()).barsRounded;
}
