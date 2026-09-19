import { toUrlSlug } from './utils';

/**
 * The city-name fold, in a leaf of its own.
 *
 * It lives here rather than in city-keys.ts because metro-rollup.ts builds
 * its lookup maps at module load and needs the fold to do it, while
 * city-keys.ts needs the rollup to group rows. Importing both ways would be
 * a cycle whose failure mode is an empty map at startup rather than an
 * error. A leaf that imports nothing but toUrlSlug cannot be in a cycle.
 *
 * city-keys.ts re-exports both, so every existing import still resolves.
 */

/** The city string without a qualifier ("Portland, Maine" -> "Portland"). */
export function bareCity(city: string): string {
  return (city || '').split(',')[0].trim();
}

/** The folded city name that groups spellings: "Kraków" and "Krakow" are one. */
export function cityBase(city: string): string {
  return toUrlSlug(bareCity(city));
}
