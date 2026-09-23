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
  /** bars.search_terms: the venue's other names, "|"-separated (task 108). */
  search_terms?: string | null;
}

/**
 * The names a hit answers to: its name plus every hand-entered search term.
 * Each term ranks exactly as the name would, so a bar trading as "26" is a
 * tier-0 hit for "26" and not a tier-4 straggler at the bottom of the list.
 */
export function searchNamesOf(hit: RankableHit): string[] {
  const out = [hit.name];
  if (hit.search_terms) {
    hit.search_terms.split('|').forEach(t => { const s = t.trim(); if (s) out.push(s); });
  }
  return out;
}

export function searchTier(hit: RankableHit, foldedQuery: string): number {
  let best = 4;
  searchNamesOf(hit).forEach(candidate => {
    const name = asciiFold(candidate);
    let tier = 4;
    if (name.startsWith(foldedQuery)) tier = 0;
    else if (name.split(/\s+/).some(w => w.startsWith(foldedQuery))) tier = 1;
    else if (name.includes(foldedQuery)) tier = 2;
    if (tier < best) best = tier;
  });
  if (best < 4) return best;
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

/**
 * Every word of the query appears in at least one of these strings.
 *
 * The CLIENT-SIDE half of the rule `searchOrFilters` applies in the database.
 * The directory filters again in the browser over the rows the server
 * returned, and while that second filter still tested the whole query as one
 * contiguous string it discarded exactly the rows the new server query had
 * just gone and found: the typeahead offered "Gold Bar at EDITION" for "tokyo
 * edition" while the grid behind it read 0 bars found. Unit tests and a
 * direct API check both passed while that was true; only driving the page
 * showed it.
 *
 * Both halves have to agree, so both read this.
 */
export function matchesAllWords(query: unknown, haystacks: (string | null | undefined)[]): boolean {
  const fq = asciiFold(query);
  if (!fq) return true;
  const folded = haystacks.map(asciiFold);
  return fq
    .split(/\s+/)
    .filter(Boolean)
    .every(word => folded.some(h => h.includes(word)));
}

export function rankSearchHits<T extends RankableHit>(query: unknown, hits: T[]): T[] {
  const fq = asciiFold(query);
  if (!fq) return hits;
  return hits
    .slice()
    .sort((a, b) => searchTierMulti(a, fq) - searchTierMulti(b, fq));
}
