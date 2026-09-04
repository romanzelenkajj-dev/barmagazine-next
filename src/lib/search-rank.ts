import { asciiFold } from './ascii-fold';

/**
 * Suggestion ranking for the bar search typeahead.
 *
 * The DB query matches substrings and sorts alphabetically, which buried
 * name-prefix matches under earlier-alphabet substring hits: typing "Ori"
 * filled the 7-slot dropdown with Balmori, Gorilla, Mori Bar and Victoria
 * city matches before Origin Bar ever appeared. Rank instead:
 *
 *   0. the NAME starts with the query
 *   1. any WORD in the name starts with the query
 *   2. the name merely contains the query
 *   3. only the city matches
 *
 * Alphabetical within each tier (the input arrives name-sorted and the sort
 * is stable), accent-insensitive throughout via the same asciiFold the DB
 * columns use, so "factoria" finds Factoría at full rank.
 */
export interface RankableHit {
  name: string;
  city: string;
}

export function searchTier(hit: RankableHit, foldedQuery: string): number {
  const name = asciiFold(hit.name);
  if (name.startsWith(foldedQuery)) return 0;
  if (name.split(/\s+/).some(w => w.startsWith(foldedQuery))) return 1;
  if (name.includes(foldedQuery)) return 2;
  if (asciiFold(hit.city).includes(foldedQuery)) return 3;
  return 4;
}

export function rankSearchHits<T extends RankableHit>(query: unknown, hits: T[]): T[] {
  const fq = asciiFold(query);
  if (!fq) return hits;
  return hits
    .slice()
    .sort((a, b) => searchTier(a, fq) - searchTier(b, fq));
}
