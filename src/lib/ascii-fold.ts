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
 * Build the PostgREST `.or()` filter for a bar search.
 *
 * Matches the folded query against the generated columns and the raw query
 * against the originals, so a name the generated columns fold incorrectly is
 * still reachable by typing it as written.
 */
export function searchOrFilter(query: unknown, extraColumns: string[] = []): string {
  const folded = foldQueryForIlike(query);
  const raw = escapeIlike(typeof query === 'string' ? query : '');
  const clauses = [`name_ascii.ilike.%${folded}%`, `city_ascii.ilike.%${folded}%`];
  if (raw && raw.toLowerCase() !== folded) {
    clauses.push(`name.ilike.%${raw}%`, `city.ilike.%${raw}%`);
  }
  for (const col of extraColumns) clauses.push(`${col}.ilike.%${raw || folded}%`);
  return clauses.join(',');
}
