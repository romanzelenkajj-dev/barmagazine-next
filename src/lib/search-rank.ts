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

/**
 * The tier for a query of any length.
 *
 * The query now matches word by word in any order, so the whole string is no
 * longer guaranteed to appear in the name, and `searchTier` alone would drop
 * every out-of-order hit to 4 and sort the dropdown alphabetically. "haktet
 * vanster" would find "Vänster at Häktet" and then bury it under whatever
 * starts with an A.
 *
 * Two readings, and the BETTER of them wins:
 *   - the whole query as typed, the only reading that can earn tier 0 on a
 *     phrase, so an in-order search keeps the rank it has always had;
 *   - the worst tier among the individual words, so a hit is only as good as
 *     its weakest word. "haktet vanster" against "Vänster at Häktet" scores 0
 *     on vanster and 1 on haktet, so it ranks 1: a word-prefix match, which is
 *     precisely what it is.
 *
 * FOR A SINGLE-WORD QUERY THE TWO READINGS ARE THE SAME NUMBER, so every
 * query that worked before ranks exactly as before. That is why this takes the
 * minimum of the two rather than replacing the rule.
 */
export function searchTierMulti(hit: RankableHit, foldedQuery: string): number {
  const whole = searchTier(hit, foldedQuery);
  const words = foldedQuery.split(/\s+/).filter(Boolean);
  if (words.length < 2) return whole;
  // forEach, not for...of or a spread: this tsconfig predates
  // downlevelIteration and `tsc` is stricter than vitest about iteration.
  let worst = 0;
  words.forEach(w => { worst = Math.max(worst, searchTier(hit, w)); });
  return Math.min(whole, worst);
}

export function rankSearchHits<T extends RankableHit>(query: unknown, hits: T[]): T[] {
  const fq = asciiFold(query);
  if (!fq) return hits;
  return hits
    .slice()
    .sort((a, b) => searchTierMulti(a, fq) - searchTierMulti(b, fq));
}
