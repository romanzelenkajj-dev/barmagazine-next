/**
 * Editorial sources: what admitted a bar, and whether that is selective
 * enough to qualify it for a city's best-of list.
 *
 * WHY THE DISTINCTION EXISTS. The task 50 report found that "has an editorial
 * source" cannot rank bars inside a city we filled from local press, because
 * there it is the admission floor for every bar in the city. Bratislava
 * qualified 12 of 16 that way, Baudelaire Bar included, which was the whole
 * complaint. So a source only qualifies a bar if the source itself made a
 * SELECTION: a bounded "Top N", a guide with a standard, a real award.
 *
 * A tourism board page, a festival participant roster and a broad city map do
 * not qualify. They say a bar exists and is worth knowing about. They do not
 * say it is one of the best in its city.
 *
 * NEVER AN ACCOLADE. Nothing here is written to bars.accolades, scored by
 * bestAccolade, or rendered as a tile.
 */

export interface EditorialSource {
  source?: string | null;
  url?: string | null;
  note?: string | null;
  year?: number | null;
}

/**
 * Guides and awards that select by their own standard, whatever the count.
 * Matched as a lowercase substring of the source string.
 */
const SELECTIVE_NAMES = [
  'falstaff', 'michelin', 'pinnacle',
  // NOT a bare "50 best": "the 50 best bars in Dallas right now" is a local
  // directory with a headline, not the World's 50 Best Bars.
  "world's 50 best", "asia's 50 best", "europe's 50 best", "north america's 50 best",
  'james beard', 'spirited awards', 'tales of the cocktail',
  'imbibe 75', 'punch', 'esquire', 'speed rack',
  'bartenders choice', "bartenders' choice",
  'best of warsaw', 'best of the best',
];

/**
 * Sources that are explicitly NOT a selection, whatever else their name says.
 * Checked first, so "Go To Warsaw ... Sky-high bars" cannot pass on the word
 * "bars" and a festival roster cannot pass on its city's name.
 */
const BROAD_NAMES = [
  'tourism', 'tourist board', 'poi listing', 'venue listing',
  'participant list', 'participant roster', 'festival',
  'going out', 'city map',
];

/** Numbers a list might spell out in its own title. */
const WORD_NUMBERS: Record<string, number> = {
  three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20,
};

/**
 * A "Top N" is a selection while N is small. "The 19 Best Bars in Atlanta" is
 * a pick; "57 Best Bars in Atlanta" is a directory with a headline. 25 is the
 * line, which is roughly where a city list stops being an opinion.
 */
const MAX_SELECTIVE_N = 25;

function countedSelection(text: string): boolean {
  const digits = text.match(/\b(\d{1,3})\b(?=[^.]{0,28}\b(best|essential|top|greatest|finest)\b)/i)
    || text.match(/\b(?:top|best)\b[^.]{0,12}?\b(\d{1,3})\b/i);
  if (digits) {
    const n = parseInt(digits[1], 10);
    if (n > 0 && n <= MAX_SELECTIVE_N) return true;
    if (n > MAX_SELECTIVE_N) return false;
  }
  for (const [word, n] of Object.entries(WORD_NUMBERS)) {
    if (n <= MAX_SELECTIVE_N && new RegExp(`\\b${word}\\b[^.]{0,24}\\bbest\\b`, 'i').test(text)) return true;
  }
  return false;
}

/** True when this one source made a selection rather than a listing. */
export function isSelectiveSource(entry: EditorialSource | null | undefined): boolean {
  const text = String(entry?.source || '').toLowerCase().trim();
  if (!text) return false;
  if (BROAD_NAMES.some(b => text.includes(b))) return false;
  if (SELECTIVE_NAMES.some(s => text.includes(s))) return true;
  return countedSelection(text);
}

/** True when ANY of a bar's sources is selective. */
export function hasSelectiveSource(sources: unknown): boolean {
  return toSources(sources).some(isSelectiveSource);
}

/** The stored value, defensively: the column is jsonb and may be null. */
export function toSources(sources: unknown): EditorialSource[] {
  return Array.isArray(sources) ? (sources as EditorialSource[]).filter(Boolean) : [];
}

/** The selective source to name as a bar's reason, or null. */
export function strongestSource(sources: unknown): EditorialSource | null {
  return toSources(sources).find(isSelectiveSource) ?? null;
}
