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
  /**
   * Set when the entry's facts are in doubt and it must not be displayed.
   *
   * Added 2026-09-14: two automated reads of the same 30 Best Bars India
   * page returned year sets a full year apart from each other, so neither
   * could be trusted. The data and its citation are kept, the tile is not
   * drawn, and a human can clear the flag after reading the source page.
   *
   * A wrong year on an award tile is worse than no tile: the tile's whole
   * claim is that a named body ranked this bar in a stated year.
   */
  unverified?: boolean;
  /**
   * How the venue behind this entry was identified, when the source page
   * alone does not settle it. Audit-only; never rendered.
   *
   * Added 2026-09-14 for Shaker Awards' 2023 Top 30, whose page carries no
   * links: identity there is Shaker's own 2024/2025 Instagram handle for the
   * same entry name, carried across Shaker's own pages, and the citation
   * says so rather than implying the 2023 page proved it.
   */
  basis?: string;
}

export type AccoladeTier =
  | 'gold'
  | 'dark'
  | 'orange'
  | 'orange-outline'
  | 'grey'
  | 'grey-outline'
  | 'burgundy'
  | 'burgundy-outline'
  | 'navy'
  | 'navy-outline'
  | 'green'
  | 'green-outline';

interface TileDef {
  /** Small line above the bold one — carries the possessive. */
  region: string;
  /**
   * A region line computed per entry, where the small line is the grade
   * rather than a fixed name: The Pinnacle Guide's "1 PIN" / "2 PINS" /
   * "3 PINS". The bold line stays constant; only the small line varies,
   * the same way the possessive does across the 50 Best family.
   */
  regionFor?: (entry: Accolade) => string;
  /** Bold line. Constant within each award family; never vary it. */
  main: string;
  /** Fixed colour, for orgs whose entries are all one kind (the 50 Best
      lists are all `ranked`). */
  tier?: AccoladeTier;
  /** Kind-dependent colour: solid for a winner, outline for a nominee.
      Anything that is not explicitly a nominee gets the solid treatment —
      erring loud for a win, quiet only when we know it was a nomination. */
  winnerTier?: AccoladeTier;
  nomineeTier?: AccoladeTier;
}

/**
 * Wording per organisation, possessive exactly as the awarding bodies name
 * themselves. Getting another organisation's name right is part of the
 * credibility, the same principle as showing the year.
 *
 * WHAT MAY BECOME A TILE (Roman, 2026-09-14, refined the same day). A tile
 * means "a panel of this awarding body ranked this bar", and that is the only
 * reason a reader trusts the row of badges at all.
 *
 * The test is about PROCESS, not publisher. "Published by a media company"
 * cannot be the exclusion, because The World's 50 Best Bars is published by
 * William Reed, a trade media company, and would fail it. An accolade org
 * must have ALL FOUR of:
 *   1. a named jury or voting body;
 *   2. a published methodology;
 *   3. an annual cycle;
 *   4. results issued as a ranked or awarded list tied to a year.
 *
 * PASS (all four, whoever prints the result): the 50 Best lists, Tales of
 * the Cocktail Spirited Awards, Bartenders' Choice, James Beard, 30 Best
 * Bars India, Mixology Bar Awards (Mixology magazine), Top Cocktail Bars
 * Spain (Neodrinks), EXAME Casual's 100 Melhores Bares do Brasil, Shaker
 * Awards (Mexico).
 *
 * FAIL (none of the four): editorial lists from Food & Wine, Eater, Esquire,
 * Time Out, Thrillist, Architectural Digest, Bon Appetit and anything of
 * that kind. They never get an org key or a tile. Diluting the tiles with
 * editorial picks destroys the signal for the awards that earned it. This is
 * the same principle as the exact-naming rule above: the tile asserts
 * something precise, so it may only carry something precise.
 *
 * Passing the test makes a body ELIGIBLE for a tile; whether one is built
 * is a separate call based on how many rows would carry it.
 *
 * Where an editorial mention is genuinely notable, it belongs in the
 * description prose with the publication and the year attributed. That is
 * both honest and better copy than a badge could be.
 *
 * Colours: gold is reserved for the world list — if everything is gold,
 * nothing is. Orange is the Spirited Awards' own colour. Grey keeps bca
 * clearly lighter than the near-black regional tiles. Navy sits one step
 * below the near-black continental tiles, for national rankings.
 */
/**
 * The name a 50 Best record is shown under. Only the world list was
 * renamed: from 2026 it is "The 50 Best Bars"; 2025 and earlier read
 * "The World's 50 Best Bars" (the stored org lacks the article, and a line
 * such as "No. 85 on World's 50 Best Bars 2025" reads wrong without it).
 * The regional lists keep their possessive names in every year: "Asia's 50
 * Best Bars 2026", "Europe's 50 Best Bars 2026", "North America's 50 Best
 * Bars 2026" (Roman, 2026-09-23, reversing the earlier post-rebrand names).
 * Every place that prints an org name reads it through here.
 */
export const WORLD_LIST_NAME = 'The 50 Best Bars';
export function displayOrg(entry: { org?: string | null; org_key?: string | null; year?: number | null }): string {
  const org = entry.org ?? '';
  if (entry.org_key === 'w50b') {
    if ((entry.year ?? 0) >= 2026) return WORLD_LIST_NAME;
    if (/^World's 50 Best/.test(org)) return `The ${org}`;
  }
  return org;
}

const TILES: Record<string, TileDef> = {
  // The world list's small line follows the 2026 rename (displayOrg).
  w50b: { region: "WORLD'S", regionFor: e => ((e.year ?? 0) >= 2026 ? 'THE' : "WORLD'S"), main: '50 BEST', tier: 'gold' },
  a50b: { region: "ASIA'S", main: '50 BEST', tier: 'dark' },
  e50b: { region: "EUROPE'S", main: '50 BEST', tier: 'dark' },
  na50b: { region: "N. AMERICA'S", main: '50 BEST', tier: 'dark' },
  // Tales of the Cocktail Spirited Awards — kind winner|nominee, rank null,
  // `title` carries the category and surfaces on hover and in the award
  // lines, never in the tile. Top line is the abbreviation: spelling out
  // "TALES OF THE / SPIRITED" read top-to-bottom as "Tales of the Spirited",
  // which is not the award's name.
  totc: { region: 'TOTC', main: 'SPIRITED', winnerTier: 'orange', nomineeTier: 'orange-outline' },
  bca: { region: "BARTENDERS'", main: 'CHOICE', winnerTier: 'grey', nomineeTier: 'grey-outline' },
  // James Beard Awards, Outstanding Bar category. Deep burgundy keeps it
  // distinct from the Spirited orange and heavier than the bca grey. TWO
  // lines by design (empty region): the name IS the award here, and the
  // category rides hover/aria like every winner/nominee org. The tile
  // centers its lines, so this reads as a deliberate two-line tile rather
  // than a missing third line.
  jbf: { region: '', main: 'JAMES BEARD', winnerTier: 'burgundy', nomineeTier: 'burgundy-outline' },
  // 30 Best Bars India, named exactly as the body writes itself. A NATIONAL
  // ranking, so navy sits one step below the near-black continental 50 Best
  // tiles without borrowing another org's signature colour.
  //
  // The main line is "30 BEST" rather than a rank, deliberately: it mirrors
  // "50 BEST" so a reader parses the shape they already know, and it holds
  // the rule that the bold line is constant within a family and that rank is
  // never drawn on the face. Rank rides the hover text like every other org.
  // This carries ranked placings and named category wins alike: a ranked
  // entry or a category win renders solid, a nominee outlined.
  '30bbi': { region: 'INDIA', main: '30 BEST', winnerTier: 'navy', nomineeTier: 'navy-outline' },
  // Shaker Awards, Mexico's national body, named exactly as it writes itself
  // and with the accent the body itself uses on México. Same navy as 30bbi:
  // one colour per national body would not scale past three countries, and
  // the region line already says which country. A bar never carries both
  // national tiles, so the two are never side by side on one row.
  //
  // The main line is "SHAKER", the body's own name, rather than "TOP 30":
  // the bold line must stay constant within a family, and from 2026 Shaker
  // also issues an unranked Top 100 listing, so a list name on the tile
  // would be a false claim for those entries. "SHAKER AWARDS" is thirteen
  // characters against JAMES BEARD's eleven, which is already the widest
  // line that fits 74px. Top 30 placings are `ranked` with the rank on the
  // entry, Top 100 listings are `listed`; both render solid, as with 30bbi.
  shaker: { region: 'MÉXICO', main: 'SHAKER', winnerTier: 'navy', nomineeTier: 'navy-outline' },
  // The Pinnacle Guide (Roman, 2026-09-15): a 1, 2 and 3 Pin recognition
  // system, self-application then anonymous in-bar assessment against
  // published modules. The grade is the small line ("2 PINS", from the
  // entry's title), the bold line is the constant "PINNACLE" (the full name
  // is 14 characters and does not fit the tile; it rides the hover). Forest
  // green, a colour no other org uses: solid for 2 and 3 Pins (kind winner),
  // outline for 1 Pin (kind nominee). The year is the ANNOUNCEMENT year: the
  // Guide prints no award year, so the entry carries the date its page was
  // published, and the accolade record says so.
  pinnacle: {
    region: 'PINS',
    regionFor: entry => (entry.title || 'Pins').toUpperCase(),
    main: 'PINNACLE',
    winnerTier: 'green',
    nomineeTier: 'green-outline',
  },
};

function tierFor(def: TileDef, kind: AccoladeKind): AccoladeTier {
  if (def.tier) return def.tier;
  return kind === 'nominee' ? def.nomineeTier! : def.winnerTier!;
}

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
 *
 * So is anything flagged `unverified`: an entry whose facts are in doubt is
 * held back rather than shown, because a wrong year on a tile is worse than
 * an absent tile.
 */
export function isRenderable(entry: unknown): entry is Accolade {
  if (!entry || typeof entry !== 'object') return false;
  const a = entry as Record<string, unknown>;
  const hasYear = typeof a.year === 'number' && Number.isFinite(a.year);
  const hasSource = typeof a.source === 'string' && a.source.trim().length > 0;
  const known = typeof a.org_key === 'string' && Object.prototype.hasOwnProperty.call(TILES, a.org_key);
  // An entry held for verification never renders, whatever else is right
  // about it. See `unverified` on the Accolade interface.
  if (a.unverified === true) return false;
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
  /** The awarding body's full name, for title/aria — the tile lines are
      abbreviations, and "TOTC SPIRITED 2026" is not a name to announce. */
  org: string;
  /** The award category ("World's Best Bar") — hover/aria only, never drawn
      in the tile. */
  title: string | null;
  /**
   * The placing, hover/aria only. INVARIANT (Roman, 2026-09-14): rank is
   * never drawn on the tile face, because the bold line must stay constant
   * within a family; but it IS present in the hover text for every org,
   * alongside org, year and source. "Unexposed" used to mean both, and that
   * was an early decision taken with the tile shape, not a licensing
   * constraint from any awarding body. Do not reverse the hover part.
   */
  rank: number | null;
  /** Kept for auditability — surfaced as a title attribute, not shown. */
  source: string | null;
}

/**
 * Stage order within one org and year, for the one-tile rule below and for
 * the prose. The kind carries most of it (a win outranks a placing outranks
 * a listing outranks a nomination); within nominations the parenthetical on
 * the title separates the Spirited Awards' ladder, Top 4 over Top 10 over
 * regional honoree over a plain nomination. Higher is further along.
 */
const KIND_STAGE: Record<AccoladeKind, number> = { winner: 40, ranked: 30, listed: 20, nominee: 10 };

export function stageOf(entry: Accolade): number {
  const t = entry.title || '';
  const sub = /top 4/i.test(t) ? 3 : /top 10/i.test(t) ? 2 : /regional/i.test(t) ? 1 : 0;
  return KIND_STAGE[entry.kind] + sub;
}

/**
 * The tiles to render: one per org and year, at most three, highest score
 * first.
 *
 * ONE TILE PER ORG PER YEAR (Roman, 2026-09-15): a row holding two Spirited
 * Awards categories from the same year (Pretty Penny, 2024: Best New U.S.
 * Cocktail Bar and Best U.S. Restaurant Bar) rendered two identical
 * "TOTC SPIRITED 2024" tiles, which reads as a duplicate rather than as two
 * honors. The face says "this body, this year"; it cannot say which
 * category, so a second tile adds nothing a reader can see. Both entries
 * stay on the row, in the prose and in the schema.org award strings; only
 * the face dedupes. The entry that carries the tile is the higher-scored
 * one (the calibration has already ranked a win over a nomination, a No. 2
 * placing over a category win), and where the scores tie, which is the
 * whole Spirited Awards ladder at 590, the further stage wins: Top 4 over
 * Top 10 over regional honoree. So a win always outranks a nomination for
 * the tile and its tier colour, and a same-year Top 10 nomination outranks
 * the regional one. A full tie keeps stored order.
 *
 * The top-three rule applies AFTER the dedupe, so a row with four honors
 * across two years shows two tiles, not three.
 *
 * The array arrives sorted, but sorting a copy costs nothing and makes the
 * "top 3 by score" rule hold even if an unsorted array ever reaches us. This
 * reads `score`; it never recomputes it.
 */
/**
 * The entries the tiles render, in tile order: renderable, one per org and
 * year (score first, stage on ties), score descending, capped at `limit`.
 * The accolade prose reads the same set, so a reader never sees a sentence
 * about an honor that has no tile, or a tile with no sentence.
 */
export function tileEntries(accolades: unknown, limit: number = MAX_TILES): Accolade[] {
  const sorted = renderableAccolades(accolades)
    .slice()
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || stageOf(b) - stageOf(a));
  // `sorted` is score desc, then stage desc, so the first entry seen for a
  // key is the one that carries the tile.
  const onePerOrgYear = new Map<string, Accolade>();
  for (const entry of sorted) {
    const k = `${entry.org_key}-${entry.year}`;
    if (!onePerOrgYear.has(k)) onePerOrgYear.set(k, entry);
  }
  return Array.from(onePerOrgYear.values())
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
}

export function tilesFor(accolades: unknown, limit: number = MAX_TILES): TileView[] {
  return tileEntries(accolades, limit)
    .map(entry => {
      const def = TILES[entry.org_key];
      return {
        key: `${entry.org_key}-${entry.year}`,
        tier: tierFor(def, entry.kind),
        region: def.regionFor ? def.regionFor(entry) : def.region,
        main: def.main,
        year: String(entry.year),
        org: displayOrg(entry),
        title: entry.title ?? null,
        rank: entry.rank ?? null,
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
      ? `${displayOrg(entry)} ${entry.year}, No. ${entry.rank}`
      : entry.title
        ? `${displayOrg(entry)} ${entry.year}, ${entry.title}`
        : `${displayOrg(entry)} ${entry.year}`
  );
}

/**
 * The card pill's wording per org (task 135): the award's own name, short
 * enough for one pill. The world list reads plain "50 BEST", the regional
 * lists keep their possessive, the others use the bold line of their tile
 * or, where that line alone is not the name, the name in full.
 */
const PILL_LABEL: Record<string, string> = {
  w50b: '50 BEST',
  a50b: "ASIA'S 50 BEST",
  e50b: "EUROPE'S 50 BEST",
  na50b: "NORTH AMERICA'S 50 BEST",
  totc: 'SPIRITED',
  bca: "BARTENDERS' CHOICE",
  jbf: 'JAMES BEARD',
  '30bbi': '30 BEST BARS INDIA',
  shaker: 'SHAKER AWARDS',
  pinnacle: 'PINNACLE',
};

/**
 * The one award a best-bars card shows as a pill (task 135): the bar's
 * strongest renderable honor by stored score, stage breaking ties as on the
 * tiles. A nomination is not an award, so nominee entries are skipped and a
 * bar whose honors are all nominations gets no pill. The Pinnacle Guide is
 * the exception: its "nominee" kind only draws the 1 Pin tile outlined, and
 * 1 Pin is a grade the bar holds, not a nomination. Null when there is
 * nothing to show.
 */
export function cardAwardLabel(accolades: unknown): string | null {
  const best = renderableAccolades(accolades)
    .filter(e => e.kind !== 'nominee' || e.org_key === 'pinnacle')
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || stageOf(b) - stageOf(a))[0];
  return best ? PILL_LABEL[best.org_key] ?? null : null;
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
