/**
 * The three page levels per city (Roman, 2026-09-17).
 *
 *   Level 1  the curated ten: the editorial article plus the tier='top10'
 *            rows. Editorial, cannot be bought, not decided here.
 *   Level 2  /best-bars/<city>, the qualified list. This page targets the
 *            head term, and its title carries the real number.
 *   Level 3  /bars/city/<slug>, every bar. Unchanged.
 *
 * Nothing falls off a page: a bar that does not qualify for Level 2 is still
 * on Level 3.
 *
 * WHY A QUALIFICATION AT ALL. Ordering by tier, then accolade score, then
 * photo, then name meant that in a city with no top-tier bar, one accolade and
 * three photos, everything from the fourth slot down was ordered by first
 * letter. Baudelaire Bar sat on /best-bars/bratislava because of the B.
 */
import type { Bar } from './supabase';
import { renderableAccolades } from './accolades';
import { strongestSource } from './editorial-sources';
import { closedLast } from './bar-status';

/** Lower is better. The order is the qualification order. */
export const enum Level2Rank {
  Accolade = 1,
  OursOrPaid = 2,
  SelectiveList = 3,
}

export interface Level2Reason {
  rank: Level2Rank;
  /** One short phrase, for the report and for any future on-page label. */
  label: string;
}

const isPaidTier = (b: Bar) => b.tier === 'featured' || b.tier === 'premium';
const isCuratedTen = (b: Bar) => b.tier === 'top10';

/**
 * Why this bar belongs on its city's best-of list, or null if it does not.
 *
 * A broad source is deliberately absent: a tourism page, a festival roster or
 * a city map is the admission floor for every bar in a city we filled from
 * local press, so it cannot rank bars inside that city.
 */
export function level2Reason(bar: Bar): Level2Reason | null {
  if (renderableAccolades(bar.accolades).length > 0) {
    return { rank: Level2Rank.Accolade, label: 'accolade' };
  }
  if (isCuratedTen(bar)) return { rank: Level2Rank.OursOrPaid, label: 'our Top 10 pick' };
  if (bar.wp_article_slug) return { rank: Level2Rank.OursOrPaid, label: 'BarMagazine article' };
  // A paying bar belongs on this list, and ranks here on merit rather than on
  // payment: below the accolade holders, alongside our own article. An
  // editorial best-of that can be bought into the top spot is worth nothing to
  // the bar that buys it. Priority placement is what /bars and Level 3 sell.
  if (isPaidTier(bar)) return { rank: Level2Rank.OursOrPaid, label: `${bar.tier} tier` };
  const sel = strongestSource(bar.editorial_sources);
  if (sel) return { rank: Level2Rank.SelectiveList, label: String(sel.source || 'editorial list') };
  return null;
}

/** The editorial override. Positive pins, -1 drops, null means the rule decides. */
const pick = (b: Bar) => (typeof b.editorial_pick === 'number' ? b.editorial_pick : null);
export const isPinned = (b: Bar) => (pick(b) ?? 0) > 0;
export const isDropped = (b: Bar) => pick(b) === -1;

export interface Level2Result {
  /** The curated ten, in tier order, always at the top. */
  curated: Bar[];
  /** Everything else that qualifies, in rank order. */
  rest: Bar[];
  /** curated + rest, which is what the page renders and counts. */
  all: Bar[];
  /** True when too few qualified and the caller should fall back. */
  fellBack: boolean;
}

export const LEVEL2_MIN = 5;

/**
 * The Level 2 list for a city.
 *
 * `fallback` is the current sortSeoBars order, used only when fewer than
 * LEVEL2_MIN bars qualify. In that case the title must not carry a number,
 * because the number would not mean anything.
 */
export function level2Bars(bars: Bar[], fallback: (b: Bar[]) => Bar[]): Level2Result {
  const live = bars.filter(b => !isDropped(b));
  const curated = live.filter(isCuratedTen);
  const qualified = live.filter(b => !isCuratedTen(b) && level2Reason(b) !== null);

  const hasPhoto = (b: Bar) => (b.photos && b.photos.length > 0 ? 0 : 1);
  const rank = (b: Bar) => level2Reason(b)?.rank ?? 99;
  const rest = qualified.slice().sort((a, b) =>
    // A pinned bar leads, then the rule, then a closed bar last, then photo.
    (isPinned(b) ? 1 : 0) - (isPinned(a) ? 1 : 0)
    || (pick(b) ?? 0) - (pick(a) ?? 0)
    || rank(a) - rank(b)
    || closedLast(a) - closedLast(b)
    || hasPhoto(a) - hasPhoto(b)
    || a.name.localeCompare(b.name));

  const all = [...curated, ...rest];
  if (all.length >= LEVEL2_MIN) return { curated, rest, all, fellBack: false };

  const filled = fallback(live).slice(0, LEVEL2_MIN);
  return { curated, rest, all: filled, fellBack: true };
}

/**
 * The Level 2 list for one TYPE inside a city.
 *
 * Derived from the city's list and then filtered, never computed separately.
 * Qualification is a property of the bar, not of the page, so the qualified
 * bars of one type are always a subset of the city's and the counts cannot
 * invert. They had: /best-bars/amsterdam listed five while
 * /best-bars/amsterdam/cocktail-bars listed twelve, and the twelve contained
 * all five.
 */
export function level2BarsForType(
  cityBars: Bar[],
  matchesType: (b: Bar) => boolean,
  fallback: (b: Bar[]) => Bar[],
): Level2Result & { sameAsCity: boolean } {
  const city = level2Bars(cityBars, fallback);
  const ofType = cityBars.filter(b => matchesType(b) && !isDropped(b));
  let all = city.all.filter(matchesType);
  // The page's EXISTENCE still keys on how many bars of the type the city has
  // (MIN_TYPE_BARS, unchanged). Only its SELECTION is the qualified subset. An
  // earlier version returned the subset alone, which 404'd Warsaw's rooftop
  // and hotel pages: they hold five and seven bars, but too few of those
  // qualify, and a live page must not vanish because the rule tightened.
  let fellBack = city.fellBack;
  if (all.length < LEVEL2_MIN) {
    all = fallback(ofType).slice(0, LEVEL2_MIN);
    fellBack = true;
  }
  const sameAsCity = all.length === city.all.length
    && city.all.every(b => matchesType(b)) && city.all.length > 0;
  return {
    curated: city.curated.filter(matchesType),
    rest: city.rest.filter(matchesType),
    all,
    fellBack,
    sameAsCity,
  };
}

/**
 * A coarse standing band, for "photos first among bars of comparable
 * standing". Roman: "the 50 best photo-less bars will drop behind the 50 best
 * bars with photos", not behind a free bar with a snapshot.
 *
 *   0  holds a renderable accolade
 *   1  qualified only by a selective editorial source
 *   2  everything else
 *
 * A bar never crosses a band because of a photo. Inside a band the photo
 * decides, which is the only thing that changes.
 */
export function meritBand(bar: Bar): 0 | 1 | 2 {
  if (renderableAccolades(bar.accolades).length > 0) return 0;
  return strongestSource(bar.editorial_sources) ? 1 : 2;
}
