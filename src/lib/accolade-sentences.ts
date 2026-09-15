import { renderableAccolades, stageOf, type Accolade } from './accolades';

/**
 * One sentence per awarding body, for the short paragraph under the tiles.
 *
 * Rewritten 2026-09-15 (Roman): one sentence per ORG, not per entry. A row
 * with four Spirited Awards honors across three years used to read as four
 * near-identical sentences; now years and categories group into one:
 *
 *   The Spirited Awards named it a regional honoree for Best New U.S.
 *   Cocktail Bar in 2024 and 2025 and for Best U.S. Restaurant Bar in 2024
 *   and 2026.
 *
 * Same discipline as the tiles: the year, the placing and the category
 * exactly as stored, nothing invented. Reads the same renderable set as the
 * tiles, so an entry held back from a tile (no year, no source, unknown
 * org, unverified) is held back from the prose too.
 *
 * THE STAGE WORD COMES FROM THE ENTRY, never from the kind alone. A
 * `nominee` entry titled "(Regional Honoree)" is a regional honoree; the
 * word "nominee" is never written for it, because the Spirited Awards do
 * not call the regional list nominees. The parenthetical on the title is
 * the stage: Regional Honoree, Top 10 Nominee, Top 4 (TOTC's own word for
 * that stage is finalist), Semifinalist. A nominee entry with no
 * parenthetical is a nominee, which is what the James Beard Awards call
 * their shortlist.
 *
 * Ranked lists use "No. N", which is how the 50 Best bodies print a
 * placing. A 51 to 100 placing on the world list is still "No. 71", which
 * is what the list says; the extended list is the same list.
 */

/**
 * How the body reads as the subject of a sentence. The stored `org` is the
 * body's full name as it writes itself, which is right for a tile's hover
 * text and for schema.org, but "Tales of the Cocktail Spirited Awards named
 * it" is not how anyone writes the sentence, including the venues' own
 * sites. Orgs not listed here read exactly as stored ("World's 50 Best Bars
 * ranked it", "30 Best Bars India listed it").
 */
const PROSE_SUBJECT: Record<string, string> = {
  totc: 'The Spirited Awards',
  jbf: 'The James Beard Awards',
  bca: "The Bartenders' Choice Awards",
};

/** The category with the stage parenthetical removed: "Best U.S. Bar Team". */
function categoryOf(title: string | null | undefined): string | null {
  const t = (title || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
  return t || null;
}

/** The stage word for a nominee-kind entry, read from the title's parenthetical. */
function stageWordOf(title: string | null | undefined): string {
  const m = /\(([^)]*)\)\s*$/.exec(title || '');
  const p = m ? m[1] : '';
  if (/regional/i.test(p)) return 'regional honoree';
  if (/top 4/i.test(p)) return 'Top 4 finalist';
  if (/top 10/i.test(p)) return 'Top 10 nominee';
  if (/semifinal/i.test(p)) return 'semifinalist';
  return 'nominee';
}

/** "2024", "2024 and 2025", "2023, 2024 and 2025". */
function listJoin(parts: string[]): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

function years(entries: Accolade[]): string {
  const ys = Array.from(new Set(entries.map(e => Number(e.year)))).sort((a, b) => a - b);
  return listJoin(ys.map(String));
}

/**
 * Group entries by a key, keeping first-seen order, then order the groups by
 * their earliest year so the sentence reads forward in time.
 */
function groupBy(entries: Accolade[], keyOf: (e: Accolade) => string): Accolade[][] {
  const groups = new Map<string, Accolade[]>();
  for (const e of entries) {
    const k = keyOf(e);
    const g = groups.get(k);
    if (g) g.push(e);
    else groups.set(k, [e]);
  }
  return Array.from(groups.values()).sort(
    (a, b) => Math.min(...a.map(e => Number(e.year))) - Math.min(...b.map(e => Number(e.year)))
  );
}

/** The sentence for one body's entries (all the same org_key). */
export function orgSentence(entries: Accolade[]): string {
  const subject = PROSE_SUBJECT[entries[0].org_key] || entries[0].org;
  const ranked = entries.filter(e => e.kind === 'ranked' && e.rank != null);
  const listed = entries.filter(e => e.kind === 'listed' || (e.kind === 'ranked' && e.rank == null));
  const winners = entries.filter(e => e.kind === 'winner');
  const nominees = entries.filter(e => e.kind === 'nominee');

  const clauses: string[] = [];

  // "named it" once, then the honors it named: wins first, then the
  // nomination stages furthest along first.
  const named: string[] = [];
  if (winners.length) {
    const withTitle = winners.filter(e => categoryOf(e.title));
    const bare = winners.filter(e => !categoryOf(e.title));
    for (const g of groupBy(withTitle, e => categoryOf(e.title)!)) named.push(`${categoryOf(g[0].title)} in ${years(g)}`);
    if (bare.length) named.push(`a winner in ${years(bare)}`);
  }
  const stages = groupBy(nominees, e => stageWordOf(e.title)).sort((a, b) => stageOf(b[0]) - stageOf(a[0]));
  for (const stage of stages) {
    const word = stageWordOf(stage[0].title);
    const withCat = stage.filter(e => categoryOf(e.title));
    const bare = stage.filter(e => !categoryOf(e.title));
    const fors = groupBy(withCat, e => categoryOf(e.title)!).map(g => `for ${categoryOf(g[0].title)} in ${years(g)}`);
    if (fors.length) named.push(`a ${word} ${listJoin(fors)}`);
    if (bare.length) named.push(`a ${word} in ${years(bare)}`);
  }

  if (ranked.length) {
    const byRank = groupBy(ranked, e => String(e.rank)).map(g => `No. ${g[0].rank} in ${years(g)}`);
    clauses.push(`ranked it ${listJoin(byRank)}`);
  }
  if (listed.length) clauses.push(`listed it in ${years(listed)}`);
  if (named.length) clauses.push(`named it ${listJoin(named)}`);

  return `${subject} ${listJoin(clauses)}.`;
}

/**
 * One sentence per org, the org with the newest honor first (then the
 * higher score), so the paragraph reads from the present back.
 */
export function accoladeSentences(accolades: unknown): string[] {
  const byOrg = new Map<string, Accolade[]>();
  for (const e of renderableAccolades(accolades)) {
    const g = byOrg.get(e.org_key);
    if (g) g.push(e);
    else byOrg.set(e.org_key, [e]);
  }
  const newest = (g: Accolade[]) => Math.max(...g.map(e => Number(e.year)));
  const best = (g: Accolade[]) => Math.max(...g.map(e => e.score ?? 0));
  return Array.from(byOrg.values())
    .sort((a, b) => newest(b) - newest(a) || best(b) - best(a))
    .map(orgSentence);
}
