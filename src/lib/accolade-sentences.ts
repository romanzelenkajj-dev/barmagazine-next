import { renderableAccolades, type Accolade } from './accolades';

/**
 * One sentence per accolade entry, for the short paragraph under the tiles.
 *
 * Same discipline as the tiles: the org name exactly as stored (which is
 * exactly as the body writes itself), the year, the placing or the category
 * exactly as stored, nothing invented. Reads the same renderable set as the
 * tiles, so an entry held back from a tile (no year, no source, unknown
 * org, unverified) is held back from the prose too.
 *
 * Ranked lists use "No. N", which is how the 50 Best bodies print a
 * placing. A 51 to 100 placing on the world list is still "No. 71", which
 * is what the list says; the extended list is the same list.
 */
export function accoladeSentence(a: Accolade): string {
  const year = String(a.year);
  if (a.kind === 'ranked' && a.rank != null) {
    return `${a.org} ranked it No. ${a.rank} in ${year}.`;
  }
  if (a.kind === 'winner') {
    return a.title
      ? `It won ${a.title} at the ${a.org} ${year}.`
      : `It won at the ${a.org} ${year}.`;
  }
  if (a.kind === 'nominee') {
    return a.title
      ? `It was a ${a.org} ${year} nominee for ${a.title}.`
      : `It was a ${a.org} ${year} nominee.`;
  }
  return a.title
    ? `${a.org} listed it in ${year} (${a.title}).`
    : `${a.org} listed it in ${year}.`;
}

/** Newest first, then by score, so the paragraph reads from the present back. */
export function accoladeSentences(accolades: unknown): string[] {
  return renderableAccolades(accolades)
    .slice()
    .sort((x, y) => (y.year ?? 0) - (x.year ?? 0) || (y.score ?? 0) - (x.score ?? 0))
    .map(accoladeSentence);
}
