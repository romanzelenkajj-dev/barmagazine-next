/**
 * Accolade tiles.
 *
 * A fixed 74×44 tile with three centred lines: region, a constant bold main
 * line, year. The main line is identical on every 50 Best tile — that is what
 * makes them read as one family, so the possessive rides on the small region
 * line above it and the bold line never varies.
 *
 * Display-only. `score` is rewritten monthly by a scheduled task with a
 * recency decay, so nothing here recomputes it or caches a derived ranking.
 */

export type AccoladeKind = 'ranked' | 'winner' | 'nominee' | 'listed';

export interface Accolade {
  org: string;
  org_key: string;
  year: number | null;
  rank: number | null;
  kind: AccoladeKind;
  title: string | null;
  score: number;
  source: string | null;
}

export type AccoladeTier = 'gold' | 'dark' | 'outline';

interface TileDef {
  /** Small line above the bold one — carries the possessive. */
  region: string;
  /** Bold line. Constant across the 50 Best family; never vary it. */
  main: string;
  tier: AccoladeTier;
}

/**
 * Wording per organisation, possessive exactly as the awarding bodies name
 * themselves. Getting another organisation's name right is part of the
 * credibility, the same principle as showing the year.
 *
 * Gold is reserved for the world list. If everything is gold, nothing is.
 */
const TILES: Record<string, TileDef> = {
  w50b: { region: "WORLD'S", main: '50 BEST', tier: 'gold' },
  a50b: { region: "ASIA'S", main: '50 BEST', tier: 'dark' },
  e50b: { region: "EUROPE'S", main: '50 BEST', tier: 'dark' },
  na50b: { region: "N. AMERICA'S", main: '50 BEST', tier: 'dark' },
  // Not imported yet; the style ships ahead of the data.
  bca: { region: "BARTENDER'S", main: 'CHOICE', tier: 'outline' },
};

/** Most tiles shown anywhere. Beyond this the description carries the rest. */
export const MAX_TILES = 3;

/**
 * 50 Best Discovery is a curated listing, not a jury ranking, so it does not
 * belong beside badges that all mean "a panel voted for this bar". It stays in
 * the description text only.
 */
function isDiscovery(entry: Accolade): boolean {
  return /discovery/i.test(entry.org || '') || /discovery/i.test(entry.org_key || '');
}

/**
 * An entry without a year or a source is not renderable. This is the accuracy
 * guarantee for the whole system: every tile traces to a dated, cited award.
 *
 * An unknown `org_key` is also dropped — there is no approved wording for it,
 * and inventing one would break the exact-naming rule above.
 */
export function isRenderable(entry: unknown): entry is Accolade {
  if (!entry || typeof entry !== 'object') return false;
  const a = entry as Record<string, unknown>;
  const hasYear = typeof a.year === 'number' && Number.isFinite(a.year);
  const hasSource = typeof a.source === 'string' && a.source.trim().length > 0;
  const known = typeof a.org_key === 'string' && Object.prototype.hasOwnProperty.call(TILES, a.org_key);
  if (!hasYear || !hasSource || !known) return false;
  return !isDiscovery(a as unknown as Accolade);
}

export function renderableAccolades(accolades: unknown): Accolade[] {
  if (!Array.isArray(accolades)) return [];
  return accolades.filter(isRenderable);
}

export interface TileView {
  key: string;
  tier: AccoladeTier;
  region: string;
  main: string;
  year: string;
  /** Kept for auditability — surfaced as a title attribute, not shown. */
  source: string | null;
}

/**
 * The tiles to render: at most three, highest score first.
 *
 * The array arrives sorted, but sorting a copy costs nothing and makes the
 * "top 3 by score" rule hold even if an unsorted array ever reaches us. This
 * reads `score`; it never recomputes it.
 */
export function tilesFor(accolades: unknown, limit: number = MAX_TILES): TileView[] {
  return renderableAccolades(accolades)
    .slice()
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit)
    .map(entry => {
      const def = TILES[entry.org_key];
      return {
        key: `${entry.org_key}-${entry.year}`,
        tier: def.tier,
        region: def.region,
        main: def.main,
        year: String(entry.year),
        source: entry.source,
      };
    });
}

/**
 * Award strings for schema.org/award on the bar entity.
 *
 * Deliberately NOT aggregateRating or Review: Google's review-snippet
 * guidelines forbid marking up ratings aggregated from other sites, and an
 * award is not a rating. Rank is included here because structured data is for
 * machines — the visual deliberately omits it.
 */
export function awardStrings(accolades: unknown): string[] {
  return renderableAccolades(accolades).map(entry =>
    entry.rank != null
      ? `${entry.org} ${entry.year} — No. ${entry.rank}`
      : `${entry.org} ${entry.year}`
  );
}

/** The 50 Best family — world plus the regional lists. */
const FIFTY_BEST_KEYS = new Set(['w50b', 'a50b', 'e50b', 'na50b']);

/**
 * Does this bar hold any 50 Best accolade?
 *
 * For the card marker: a single pill that says "this bar is on a 50 Best list"
 * without the year, rank or which list — those live on the profile tiles. It
 * reads the same renderable entries as the tiles, so a bar whose only entry is
 * missing a year or a source does not get a marker either.
 *
 * This replaces the old hardcoded FIFTY_BEST_2025 name list for badging: that
 * list froze one year's results and matched on bar name.
 */
export function hasFiftyBest(accolades: unknown): boolean {
  return renderableAccolades(accolades).some(e => FIFTY_BEST_KEYS.has(e.org_key));
}
