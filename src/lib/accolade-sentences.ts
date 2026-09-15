import { tileEntries, type Accolade } from './accolades';

/**
 * The accolade sentence under the tiles: ONE sentence, the bar's name as
 * the subject, one clause per tile in tile order (Roman, 2026-09-15,
 * superseding the one-sentence-per-org form of the same morning):
 *
 *   Bitter & Twisted Cocktail Parlour holds 2 Pins from The Pinnacle
 *   Guide (2024) and was listed on North America's 50 Best Bars in 2022.
 *
 * It reads exactly the set the tiles render (tileEntries: renderable, one
 * per org and year, score order, at most three), so the prose and the
 * face never disagree. Two clauses join with " and ", three with ", " and
 * ", and ". Every year, category, placing and grade is the stored value;
 * nothing is invented, and nothing is written for an entry the tiles hold
 * back.
 */

/**
 * The newest edition of each list, for tense: a placing on the current
 * edition "ranks", an older one "ranked". These are the newest years the
 * data carries per list today; bump when a body publishes its next list
 * (the World's 50 Best Bars 2026 lands in October).
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

/** "won the Timeless U.S. Award" but "won Best U.S. Hotel Bar". */
function withArticle(category: string): string {
  return /\baward\b/i.test(category) && !/^the\b/i.test(category) ? `the ${category}` : category;
}

/** The clause for one entry, a verb phrase without the subject. */
export function accoladeClause(a: Accolade): string {
  const year = String(a.year);
  const key = a.org_key;

  if (FIFTY_BEST.has(key) || key === '30bbi') {
    if (a.kind === 'winner' && categoryOf(a.title)) {
      return `won ${withArticle(categoryOf(a.title)!)} at the ${year} ${a.org}`;
    }
    if (a.rank != null) {
      const current = (a.year ?? 0) >= (LATEST_EDITION[key] ?? Infinity);
      return `${current ? 'ranks' : 'ranked'} No. ${a.rank} on ${a.org} ${year}`;
    }
    return `was listed on ${a.org} in ${year}`;
  }

  if (key === 'totc') {
    const cat = categoryOf(a.title);
    if (a.kind === 'winner') return cat ? `won ${withArticle(cat)} at the ${year} Spirited Awards` : `won at the ${year} Spirited Awards`;
    const stage = stageOf(a.title);
    const what = /top 4/.test(stage) ? 'a Top 4 finalist' : /top 10/.test(stage) ? 'a Top 10 nominee' : /regional/.test(stage) ? 'a regional honoree' : 'a nominee';
    return cat ? `was ${what} for ${cat} at the ${year} Spirited Awards` : `was ${what} at the ${year} Spirited Awards`;
  }

  if (key === 'jbf') {
    const cat = categoryOf(a.title) || 'Outstanding Bar';
    if (a.kind === 'winner') return `won the James Beard Award for ${cat} in ${year}`;
    const stage = /semifinal/.test(stageOf(a.title)) ? 'semifinalist' : 'finalist';
    return `was a James Beard Award ${stage} for ${cat} in ${year}`;
  }

  if (key === 'bca' || key === 'shaker') {
    const body = key === 'bca' ? "Bartenders' Choice Awards" : 'Shaker Awards';
    if (a.kind === 'ranked' && a.rank != null) {
      const current = (a.year ?? 0) >= (LATEST_EDITION[key] ?? Infinity);
      const list = a.title ? ` ${a.title}` : '';
      return `${current ? 'ranks' : 'ranked'} No. ${a.rank} on the ${year} ${body}${list}`;
    }
    if (a.kind === 'listed') return `was listed on the ${year} ${body}${a.title ? ` ${a.title}` : ''}`;
    const cat = categoryOf(a.title);
    if (a.kind === 'winner') return cat ? `won ${withArticle(cat)} at the ${year} ${body}` : `won at the ${year} ${body}`;
    return cat ? `was nominated for ${cat} at the ${year} ${body}` : `was nominated at the ${year} ${body}`;
  }

  if (key === 'pinnacle') {
    return `holds ${a.title || 'a Pin'} from The Pinnacle Guide (${year})`;
  }

  // An org with a tile but no phrasing here: say only what is stored.
  if (a.rank != null) return `ranked No. ${a.rank} on ${a.org} ${year}`;
  if (a.kind === 'winner') return categoryOf(a.title) ? `won ${categoryOf(a.title)} at the ${year} ${a.org}` : `won at the ${year} ${a.org}`;
  return `was listed on ${a.org} in ${year}`;
}

/** "a", "a and b", "a, b, and c". */
function joinClauses(parts: string[]): string {
  if (parts.length <= 1) return parts.join('');
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

/**
 * The sentence, or an empty string when the tiles render nothing. The
 * subject is the stored name exactly once, no article added.
 */
export function accoladeSentence(name: string, accolades: unknown): string {
  const entries = tileEntries(accolades);
  if (entries.length === 0) return '';
  return `${name} ${joinClauses(entries.map(accoladeClause))}.`;
}
