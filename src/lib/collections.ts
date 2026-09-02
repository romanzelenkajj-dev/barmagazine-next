/**
 * Partner collection pages (/collections/[slug]) — the hotel-group closer.
 *
 * Config-driven on purpose: no DB migration until the model proves itself.
 * Each entry is one partner group; its roster is an explicit list of bar
 * slugs, added deal by deal — membership is never inferred. Pages render
 * noindex for now and go public per-partner when a deal signs.
 */

export interface BarCollection {
  slug: string;
  name: string;
  /** Opening paragraph under the title. Real copy lands per-deal. */
  intro: string;
  /** Optional full-width hero image URL. */
  heroImage?: string;
  /** Roster in display order. Slugs must exist in `bars`. */
  barSlugs: string[];
}

export const COLLECTIONS: BarCollection[] = [
  {
    slug: 'conrad-hotels',
    name: 'Conrad Hotels & Resorts',
    intro:
      "Conrad Singapore Orchard is home to one of Asia's most decorated " +
      'hotel bar programs. Manhattan, twice named Asia’s Best Bar, channels ' +
      'the Golden Age of cocktails with the world’s first in-hotel rickhouse ' +
      'and a Whiskey Glasshouse of more than 220 rare American whiskeys, while ' +
      'East47, its bar-in-a-bar cocktail studio, pours a progressive menu in ' +
      'the spirit of the 1960s avant-garde. This collection gathers the ' +
      'group’s bars on BarMagazine.',
    barSlugs: ['manhattan', 'east-47'],
  },
];

export function collectionBySlug(slug: string): BarCollection | null {
  return COLLECTIONS.find(c => c.slug === slug) ?? null;
}
