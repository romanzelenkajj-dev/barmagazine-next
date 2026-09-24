import { tileEntries, type Accolade, displayOrg } from './accolades';

/**
 * The credentials line under the tiles (Roman, 2026-09-15, superseding the
 * name-first sentence of the same afternoon): no subject, because the H1
 * directly above already says the name. One clause per tile in tile order,
 * each written without a subject, the line capitalised at the start and
 * closed with a period:
 *
 *   Listed on North America's 50 Best Bars in 2022 and awarded 2 Pins by
 *   The Pinnacle Guide in 2024.
 *
 * It reads exactly the set the tiles render (tileEntries: renderable, one
 * per org and year, score order, at most three), so the line and the face
 * never disagree. Two clauses join with " and ", three with ", " and
 * ", and ". Every year, category, placing and grade is the stored value.
 *
 * Off-page reuse (a meta description, JSON-LD) must prefix the bar name and
 * a colon so the line stands alone; see credentialsLineWithName. Nothing
 * reuses it today.
 */

/**
 * The newest edition of each list. Kept for callers that need the tense
 * ("ranks" vs "ranked"); the credentials line itself is tenseless. Bump when
 * a body publishes its next list (the World's 50 Best Bars 2026 lands in
 * October).
 */
export const LATEST_EDITION: Record<string, number> = {
  w50b: 2025,
  na50b: 2026,
  e50b: 2026,
  a50b: 2026,
  '30bbi': 2025,
  shaker: 2025,
};

const FIFTY_BEST = new Set(['w50b', 'a50b', 'e50b', 'na50b']);

/** The category with the stage parenthetical removed: "Best U.S. Bar Team". */
function categoryOf(title: string | null | undefined): string | null {
  const t = (title || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
  return t || null;
}

/** The stage parenthetical, lowercased for matching. */
function stageOf(title: string | null | undefined): string {
  const m = /\(([^)]*)\)\s*$/.exec(title || '');
  return (m ? m[1] : '').toLowerCase();
}

/** "winner of the Timeless U.S. Award" but "winner of Best U.S. Hotel Bar". */
function withArticle(category: string): string {
  return /\baward\b/i.test(category) && !/^the\b/i.test(category) ? `the ${category}` : category;
}

/** "the 2025 Asia's 50 Best Bars", or "The World's 50 Best Bars 2025" when the
    name already carries its article (no "at the 2025 The ..."). */
function atList(a: Accolade, year: string): string {
  const org = displayOrg(a);
  return org.startsWith('The ') ? `${org} ${year}` : `the ${year} ${org}`;
}

/** The clause for one entry: a credential without a subject, lowercase start. */
export function accoladeClause(a: Accolade): string {
  const year = String(a.year);
  const key = a.org_key;

  if (FIFTY_BEST.has(key) || key === '30bbi') {
    if (a.kind === 'winner' && categoryOf(a.title)) {
      return `winner of ${withArticle(categoryOf(a.title)!)} at ${atList(a, year)}`;
    }
    if (a.rank != null) return `No. ${a.rank} on ${displayOrg(a)} ${year}`;
    return `listed on ${displayOrg(a)} in ${year}`;
  }

  if (key === 'totc') {
    const cat = categoryOf(a.title);
    if (a.kind === 'winner') return cat ? `winner of ${withArticle(cat)} at the ${year} Spirited Awards` : `winner at the ${year} Spirited Awards`;
    const stage = stageOf(a.title);
    const what = /top 4/.test(stage) ? 'Top 4 finalist' : /top 10/.test(stage) ? 'Top 10 nominee' : /regional/.test(stage) ? 'regional honoree' : 'nominee';
    return cat ? `${what} for ${cat} at the ${year} Spirited Awards` : `${what} at the ${year} Spirited Awards`;
  }

  if (key === 'jbf') {
    const cat = categoryOf(a.title) || 'Outstanding Bar';
    if (a.kind === 'winner') return `James Beard Award winner for ${cat} in ${year}`;
    const stage = /semifinal/.test(stageOf(a.title)) ? 'semifinalist' : 'finalist';
    return `James Beard Award ${stage} for ${cat} in ${year}`;
  }

  if (key === 'bca' || key === 'shaker') {
    const body = key === 'bca' ? "Bartenders' Choice Awards" : 'Shaker Awards';
    if (a.kind === 'ranked' && a.rank != null) return `No. ${a.rank} on the ${year} ${body}${a.title ? ` ${a.title}` : ''}`;
    if (a.kind === 'listed') return `listed on the ${year} ${body}${a.title ? ` ${a.title}` : ''}`;
    const cat = categoryOf(a.title);
    if (a.kind === 'winner') return cat ? `winner of ${withArticle(cat)} at the ${year} ${body}` : `winner at the ${year} ${body}`;
    return cat ? `nominated for ${cat} at the ${year} ${body}` : `nominated at the ${year} ${body}`;
  }

  if (key === 'pinnacle') {
    return `awarded ${a.title || 'a Pin'} by The Pinnacle Guide in ${year}`;
  }

  // An org with a tile but no phrasing here: say only what is stored.
  if (a.rank != null) return `No. ${a.rank} on ${displayOrg(a)} ${year}`;
  if (a.kind === 'winner') return categoryOf(a.title) ? `winner of ${categoryOf(a.title)} at ${atList(a, year)}` : `winner at ${atList(a, year)}`;
  return `listed on ${displayOrg(a)} in ${year}`;
}

/** "a", "a and b", "a, b, and c". */
function joinClauses(parts: string[]): string {
  if (parts.length <= 1) return parts.join('');
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

/** The line, or an empty string when the tiles render nothing. */
export function credentialsLine(accolades: unknown): string {
  const entries = tileEntries(accolades);
  if (entries.length === 0) return '';
  const body = joinClauses(entries.map(accoladeClause));
  return `${body.charAt(0).toUpperCase()}${body.slice(1)}.`;
}

/** For off-page reuse only: "Bitter & Twisted Cocktail Parlour: Listed on ...". */
export function credentialsLineWithName(name: string, accolades: unknown): string {
  const line = credentialsLine(accolades);
  return line ? `${name}: ${line}` : '';
}
