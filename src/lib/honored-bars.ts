import type { Accolade } from './accolades';

/**
 * The award hub's shared types and merit order, in a leaf module with no
 * Supabase import, so the pure hub model and its tests can use them.
 */

export interface AwardProgram {
  slug: string;
  name: string;
  orgKeys: string[];
  /** Short positioning line under the title. */
  tagline: string;
}

/**
 * A bar on an award hub, shaped so it can be handed straight to
 * DirectoryBarCard.
 *
 * WHY THE EXTRA FIELDS. The select used to fetch name, slug, city, country,
 * state and accolades, so the hub COULD NOT show a photo, a placeholder, a
 * tier chip or a type even though the same bar carries all of them on every
 * city guide. The page was not choosing to look like a database dump; it had
 * nothing else to render. These are the fields DirectoryCardBar reads, and
 * nothing beyond them.
 */
export interface HonoredBar {
  name: string;
  slug: string;
  city: string;
  country: string;
  /** bars.state, for the place line ("Nashville, Tennessee"). */
  state: string | null;
  photos: string[] | null;
  type: string | null;
  tier: string | null;
  wp_article_slug: string | null;
  /** Drives the "Temporarily closed" pill on the card. */
  status: string | null;
  /** Every renderable accolade the bar holds, for the card's badges. */
  accolades: unknown;
  entry: Accolade;
}

export interface YearGroup {
  year: number;
  /** Grouping label inside a year: the list name for 50 Best, the category
      for winner/nominee awards. */
  sections: { label: string; orgKey: string; bars: HonoredBar[] }[];
}

/**
 * Winners, then nominees, then everything else; rank where the program has
 * one; then the tie-breaks; then the name.
 *
 * The page used to lean on the section order alone, which was alphabetical by
 * category label, so Bartenders' Choice opened on "Best Cocktail Bar
 * (Croatia)" for no reason a reader could see.
 *
 * Exported because the hub page needs it a SECOND time. Sorting inside a
 * section is not enough on a program like Bartenders' Choice, where every
 * category holds exactly one bar: there, the bars that tie on merit sit in
 * twenty different sections, so ordering within each one can never move
 * anything. When the page flows a run of small sections into a single grid it
 * re-sorts the merged cells with this, which is where the photo-first rule
 * actually earns its keep.
 */
export function compareHonoredBars(a: HonoredBar, b: HonoredBar): number {
  const kindRank = (r: HonoredBar): number =>
    r.entry.kind === 'winner' ? 0 : r.entry.kind === 'nominee' ? 1 : 2;
  /* Photo first because a grid of cards is mostly a grid of pictures, and a
     run of placeholders across the top row makes the whole page look empty
     when only that row is. This changes nothing about WHO is on the page or
     where they placed: it orders bars the award itself has called equal. */
  const hasPhoto = (r: HonoredBar): number => (r.photos && r.photos.length > 0 ? 0 : 1);
  /* Editorial Top 10 leads; `featured` is the paid tier and never outranks
     it, because this page promises that paid listings cannot buy a place. */
  const tierRank = (r: HonoredBar): number =>
    r.tier === 'top10' ? 0 : r.tier === 'featured' ? 1 : 2;

  return (
    kindRank(a) - kindRank(b)
    || (a.entry.rank ?? 9999) - (b.entry.rank ?? 9999)
    || hasPhoto(a) - hasPhoto(b)
    || tierRank(a) - tierRank(b)
    || a.name.localeCompare(b.name)
  );
}

