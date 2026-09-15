import { distanceKm } from './geocode';

/**
 * The nearby block on a profile: the five closest active bars by
 * great-circle distance, SAME CITY ONLY.
 *
 * Same city is the guard, not a preference. Across the directory the fifth
 * nearest bar is 1.4 km away at the median, but the 90th percentile is
 * 234 km: a bar in a one-bar city would otherwise list neighbours in the
 * next country. So the candidate set is the city's own rows, and a city
 * with fewer than five others shows what exists; a city with none renders
 * no block at all rather than an empty heading.
 *
 * Distance follows the hours precedent: miles for United States rows,
 * kilometres everywhere else.
 */

export interface NearbyCandidate {
  id: string;
  slug: string;
  name: string;
  city: string;
  address: string | null;
  /** `bars.neighborhood` (column added 2026-09-15); null on most rows. */
  neighborhood?: string | null;
  lat: number | null;
  lng: number | null;
  short_excerpt: string | null;
  description: string | null;
}

export interface NearbyEntry {
  slug: string;
  name: string;
  /**
   * The place line beside the distance: the neighborhood where the row has
   * one, else the street line of the address. A neighborhood is what a
   * reader uses to place a bar ("Shaw", "Bed-Stuy"); the street is the
   * fallback, not the preference.
   */
  street: string | null;
  distance: string;
  line: string | null;
}

/** The neighborhood when stated, else the street line. */
export function placeOf(b: Pick<NearbyCandidate, 'neighborhood' | 'address' | 'city'>): string | null {
  const n = (b.neighborhood || '').trim();
  if (n && n.toLowerCase() !== b.city.toLowerCase()) return n;
  return streetOf(b.address, b.city);
}

export const NEARBY_LIMIT = 5;

/** The street line of an address: everything before the first comma. */
export function streetOf(address: string | null | undefined, city: string): string | null {
  if (!address) return null;
  const first = address.split(',')[0].trim();
  if (!first) return null;
  // An address that starts with the city itself has no street line worth
  // printing ("Cotai, Macau"), and neither does a bare district.
  if (first.toLowerCase() === city.toLowerCase()) return null;
  return first;
}

/** The one-liner: short_excerpt, else the description's first sentence. */
export function lineOf(short: string | null | undefined, description: string | null | undefined): string | null {
  const s = (short || '').trim();
  if (s) return s;
  const d = (description || '').trim();
  if (!d) return null;
  const m = /^(.+?[.!?])(\s|$)/.exec(d);
  const first = (m ? m[1] : d).trim();
  return first.length > 220 ? first.slice(0, 217).replace(/\s+\S*$/, '') + '...' : first;
}

/** "0.4 mi" for the US, "1.2 km" elsewhere; under 100 m reads "nearby". */
export function distanceLabel(km: number, country: string | null | undefined): string {
  const miles = country === 'United States';
  const v = miles ? km * 0.621371 : km;
  if (v < 0.1) return 'nearby';
  const n = v < 10 ? v.toFixed(1) : String(Math.round(v));
  return `${n} ${miles ? 'mi' : 'km'}`;
}

export function nearestBars(
  bar: { id: string; city: string; country: string; lat: number | null; lng: number | null },
  cityBars: NearbyCandidate[],
  limit: number = NEARBY_LIMIT
): NearbyEntry[] {
  if (bar.lat == null || bar.lng == null) return [];
  const scored: { km: number; b: NearbyCandidate }[] = [];
  for (const b of cityBars) {
    if (b.id === bar.id || b.city !== bar.city) continue;
    if (b.lat == null || b.lng == null || !b.slug) continue;
    scored.push({ km: distanceKm(bar.lat, bar.lng, b.lat, b.lng), b });
  }
  scored.sort((a, b) => a.km - b.km);
  return scored.slice(0, limit).map(({ km, b }) => ({
    slug: b.slug,
    name: b.name,
    street: placeOf(b),
    distance: distanceLabel(km, bar.country),
    line: lineOf(b.short_excerpt, b.description),
  }));
}
