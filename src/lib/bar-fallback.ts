import { formatBarType } from './utils';

/**
 * Composed fallback description for bars with no hand-written description,
 * used on-page, in the meta description, and in JSON-LD. Built ONLY from
 * verified structured fields we already hold: type, subtypes, city,
 * country, and the bar's best accolade - so decorated-but-bare profiles
 * carry their award language without a hand-written word. No em dashes,
 * US English (Roman, 2026-09-10).
 */

interface AccoladeRecord {
  org?: string;
  org_key?: string;
  kind?: string;
  rank?: number | null;
  year?: number | null;
  score?: number | null;
  title?: string | null;
}

/** Data titles carry suffixes like "Best U.S. Hotel Bar — Top 4"; prose
    keeps the category alone. */
function cleanTitle(title: string): string {
  return title
    .split('—')[0]
    .split(' - ')[0]
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim();
}

/** Phrase the single strongest accolade (highest score) for prose, or null. */
export function accoladeClause(accolades: unknown): string | null {
  if (!Array.isArray(accolades)) return null;
  const recs = (accolades as AccoladeRecord[]).filter(
    a => a && typeof a === 'object' && a.org_key
  );
  if (recs.length === 0) return null;
  const best = recs.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a));
  const year = best.year ? `${best.year} ` : '';

  if (best.org_key === 'totc') {
    const cat = best.title ? ` for ${cleanTitle(best.title)}` : '';
    return best.kind === 'winner'
      ? `the ${year}Spirited Awards winner${cat}`
      : `a ${year}Spirited Awards honoree${cat}`;
  }
  if (best.org_key === 'jbf') {
    const cat = best.title ? ` for ${cleanTitle(best.title)}` : '';
    return best.kind === 'winner'
      ? `the ${year}James Beard Award winner${cat}`
      : `a ${year}James Beard Award nominee${cat}`;
  }
  if (['w50b', 'na50b', 'a50b', 'e50b'].includes(best.org_key!) && best.org) {
    if (best.rank && best.rank <= 50) return `No. ${best.rank} on ${best.org} ${best.year ?? ''}`.trim();
    if (best.rank) return `on the ${best.org} ${best.year ?? ''} extended list`.replace('  ', ' ');
    return `recognized on ${best.org}`;
  }
  return null;
}

export function fallbackDescription(bar: {
  name: string;
  type: string | null;
  subtypes?: string[] | null;
  city: string;
  country: string;
  accolades?: unknown;
}): string {
  const type = formatBarType(bar.type || 'Bar').toLowerCase();
  const sub = (bar.subtypes || []).filter(s => s && s.toLowerCase() !== (bar.type || '').toLowerCase())[0];
  const what = sub ? `${type} and ${sub.toLowerCase()}` : type;
  const clause = accoladeClause(bar.accolades);
  return (
    `${bar.name} is a ${what} in ${bar.city}, ${bar.country}` +
    (clause ? ` and ${clause}` : '') +
    `. Discover it on BarMagazine, the global bar directory.`
  );
}
