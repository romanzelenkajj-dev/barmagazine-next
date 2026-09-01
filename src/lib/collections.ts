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
    // Working mock for the Conrad conversation — placeholder intro, roster of
    // the two hotel-partner bars already on the outreach track.
    slug: 'conrad-hotels',
    name: 'Conrad Hotels & Resorts',
    intro:
      'Placeholder: the bars of Conrad Hotels & Resorts on BarMagazine, from ' +
      'flagship lobby bars to rooftop destinations. Each one is independently ' +
      'listed and editorially verified in our global directory. Real ' +
      'partner copy replaces this paragraph when the page goes live.',
    barSlugs: ['manhattan', 'east-47'],
  },
];

export function collectionBySlug(slug: string): BarCollection | null {
  return COLLECTIONS.find(c => c.slug === slug) ?? null;
}
