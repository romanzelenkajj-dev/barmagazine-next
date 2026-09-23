/**
 * Accent folding for bar search.
 *
 * `bars.name_ascii` / `bars.city_ascii` are generated columns defined as
 * `lower(translate(col, FROM, TO))` — translate first, lower second.
 *
 * That ordering has a flaw: an uppercase accented letter is never folded,
 * because only lowercase forms appear in FROM. "Ćilim Bar" stores as
 * "ćilim bar", not "cilim bar". The map is also missing letters outright,
 * notably `ō` and `ů`, so "Saikindō" stores as "saikindō". Together those
 * affect 5 of the ~55 active bars with accented names.
 *
 * We deliberately do NOT mirror that ordering for the query side. Folding a
 * query the column's way would leave "MÚZSA" as "múzsa", which fails to match
 * the stored "muzsa" — the user's capitalisation would decide whether search
 * worked. Lowercasing first makes any capitalisation fold to the same value.
 *
 * Because the two orderings disagree on the handful of names above, callers
 * should match the folded query against `*_ascii` AND the raw query against
 * the original columns. See `searchOrFilter`.
 */

const FROM = 'áàâãäåéèêëíìîïóòôõöøúùûüñçāēūīśžčćđřšťýžłńęąż';
const TO = 'aaaaaaeeeeiiiioooooouuuuncaeuiszccdrstyzlnead';

/**
 * Postgres `translate` keeps the FIRST mapping for a repeated source
 * character. FROM contains `ž` twice, so refusing to overwrite reproduces its
 * behaviour for the characters that do get mapped.
 */
const MAP = new Map<string, string>();
for (let i = 0; i < FROM.length && i < TO.length; i++) {
  if (!MAP.has(FROM[i])) MAP.set(FROM[i], TO[i]);
}

/** Lowercase, then fold accents — the order that makes queries capitalisation-proof. */
export function asciiFold(value: unknown): string {
  if (typeof value !== 'string') return '';
  let out = '';
  for (const ch of value.toLowerCase()) out += MAP.get(ch) ?? ch;
  return out;
}

/** Escape the wildcards PostgREST treats specially, so `%` can't match every row. */
export function escapeIlike(value: string, maxLength = 80): string {
  return value.trim().slice(0, maxLength).replace(/[%_,]/g, ch => `\\${ch}`);
}

/** Folded form of a query, ready to interpolate into an `ilike` pattern. */
export function foldQueryForIlike(query: unknown, maxLength = 80): string {
  return escapeIlike(asciiFold(query), maxLength);
}

/**
 * Build the PostgREST `.or()` filter for ONE word of a bar search.
 *
 * Matches the folded query against the generated columns and the raw query
 * against the originals, so a name the generated columns fold incorrectly is
 * still reachable by typing it as written.
 *
 * Callers should use `searchOrFilters` rather than this. It stays exported
 * because it is what a single-word search needs and what the tests pin.
 */
export function searchOrFilter(query: unknown, extraColumns: string[] = []): string {
  const folded = foldQueryForIlike(query);
  const raw = escapeIlike(typeof query === 'string' ? query : '');
  // search_terms (task 108): the venue's other names, entered by hand, so a
  // bar trading as "26" or "Twenty Six Budapest" is found under the name on
  // its own door. It is plain text with no generated twin, so the folded
  // query is matched against it as well as the raw one; an alias entered with
  // accents is still reachable by typing them.
  const clauses = [`name_ascii.ilike.%${folded}%`, `city_ascii.ilike.%${folded}%`, `search_terms.ilike.%${folded}%`];
  if (raw && raw.toLowerCase() !== folded) {
    clauses.push(`name.ilike.%${raw}%`, `city.ilike.%${raw}%`, `search_terms.ilike.%${raw}%`);
  }
  for (const col of extraColumns) clauses.push(`${col}.ilike.%${raw || folded}%`);
  return clauses.join(',');
}

/**
 * How many words of a query are turned into filters. Beyond this they are
 * ignored, because each word costs a scan and nobody identifies a bar with a
 * seventh word. A long query is still capped to 80 characters first.
 */
export const MAX_QUERY_WORDS = 6;

/** The words of a query, trimmed, capped and with empties dropped. */
export function searchQueryWords(query: unknown, maxLength = 80): string[] {
  if (typeof query !== 'string') return [];
  return query.trim().slice(0, maxLength).split(/\s+/).filter(Boolean).slice(0, MAX_QUERY_WORDS);
}

/**
 * Build the filters for a bar search: EVERY word must match, in ANY order.
 *
 * WHY THIS IS A LIST AND NOT ONE STRING. A single `ilike` is a contiguous
 * substring test, so "haktet vanster" could never find a bar stored as
 * "Vänster at Häktet", and neither could "gold bar edition" find "Gold Bar at
 * EDITION". Every multi-word name typed in the wrong order failed the same
 * way, silently, and `claim_search_no_results` exists to count exactly that.
 *
 * Each returned string is a separate `.or()`. PostgREST ANDs top-level
 * filters, so applying them in turn gives "every word matches something",
 * while each word on its own may land in the name or the city. Building one
 * nested `and(or(...),or(...))` string would do the same thing with far more
 * quoting to get wrong.
 *
 * THIS ONLY EVER WIDENS THE RESULT SET. A contiguous match implies every word
 * is present, so anything the old single filter returned is still returned.
 * Nothing that used to be findable stops being findable.
 */
export function searchOrFilters(query: unknown, extraColumns: string[] = []): string[] {
  const words = searchQueryWords(query);
  // One word, or none: the exact filter the old code built, character for
  // character. A single-word search cannot change behaviour.
  if (words.length < 2) return [searchOrFilter(query, extraColumns)];
  return words.map(word => searchOrFilter(word, extraColumns));
}
