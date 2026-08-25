import { getBarStats } from './supabase';

/**
 * Directory stats for marketing copy, from the same getBarStats() the /bars
 * hero already renders — one definition of "how many cities", not two that
 * disagree (the hardcoded copy claimed 140 cities while the hero showed the
 * live count beside it).
 *
 * Bars are rounded DOWN to the nearest hundred because the copy appends "+",
 * and rounding down is what keeps the "+" honest. Cities and countries are
 * exact. Callers are ISR pages, so the numbers refresh on their own
 * revalidate schedule.
 *
 * Fallbacks are the last hardcoded values — a transient query failure must
 * never render "0+ bars in 0 cities".
 */
export interface DirectoryStats {
  barsRounded: number;
  cities: number;
  countries: number;
}

export async function getDirectoryStats(): Promise<DirectoryStats> {
  try {
    const { totalBars, totalCities, totalCountries } = await getBarStats();
    return {
      barsRounded: totalBars ? Math.floor(totalBars / 100) * 100 : 1000,
      cities: totalCities || 140,
      countries: totalCountries || 58,
    };
  } catch {
    return { barsRounded: 1000, cities: 140, countries: 58 };
  }
}

export async function getBarCountRounded(): Promise<number> {
  return (await getDirectoryStats()).barsRounded;
}
