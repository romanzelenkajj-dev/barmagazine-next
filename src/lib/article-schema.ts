/**
 * Article schema helpers (audit item A8).
 *
 * Three concerns colocated here so vitest can test them as pure functions:
 *
 *   1. CATEGORY_DESCRIPTIONS — meta-description text for each WP category
 *      hub page. Lifts the curated copy that used to live in the per-
 *      category static pages (brands/, cocktails/, people/) before they
 *      were deleted, and adds parallel copy for the other 3 categories.
 *
 *   2. isNewsArticleCategory — Article vs NewsArticle decision. Posts in
 *      events or awards categories use schema.org/NewsArticle; everything
 *      else uses schema.org/Article. Multi-category posts: NewsArticle
 *      wins (Google prefers more specific @type per the audit's spec).
 *
 *   3. truncateHeadline — Schema.org NewsArticle headline must be ≤ 110
 *      chars per Google's structured-data guidelines. Truncates at the
 *      last word boundary before the cap so we never break mid-word.
 */

/**
 * Category-hub meta descriptions. Target shape: 130–160 chars, distinct
 * per category, BarMagazine mentioned once, keyword-rich. Used by the
 * dynamic /category/[slug] page's generateMetadata().
 *
 * Fall back to a generic description for any slug not in this map (e.g.
 * future categories before they get curated copy).
 */
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  bars: "Discover the world's best cocktail bars, speakeasies, and hotel venues — reviewed and curated by BarMagazine for industry pros and serious drinkers.",
  people: "Bartender profiles, owner interviews, and industry voices from BarMagazine — the people building the world's most influential cocktail and bar scenes.",
  cocktails: "Cocktail recipes, mixology trends, and signature drinks from BarMagazine — featuring techniques and inspiration from leading bartenders worldwide.",
  awards: "World's 50 Best Bars, Tales of the Cocktail Spirited Awards, and global cocktail competitions — full coverage of bar industry honors from BarMagazine.",
  brands: 'Spirits launches, distillery profiles, and brand stories from BarMagazine — covering whiskey, gin, mezcal, rum, and the bottles shaping bar programs.',
  events: "Cocktail weeks, bar shows, and industry gatherings — BarMagazine's coverage of the events shaping the global bar and spirits calendar.",
};

/**
 * Categories whose posts should be tagged as schema.org/NewsArticle
 * instead of schema.org/Article. Per the audit's A8 spec: events and
 * awards. Slug-based, case-insensitive.
 */
const NEWS_ARTICLE_CATEGORY_SLUGS: ReadonlySet<string> = new Set([
  'events',
  'awards',
]);

export type CategoryLike = { slug: string } | { slug?: string | null };

/**
 * True iff any category in the array is a "news"-class category.
 * Single match wins (multi-category post → NewsArticle).
 */
export function isNewsArticleCategory(
  categories: ReadonlyArray<CategoryLike>,
): boolean {
  for (const c of categories) {
    const slug = (c as { slug?: string | null }).slug;
    if (typeof slug === 'string' && NEWS_ARTICLE_CATEGORY_SLUGS.has(slug.toLowerCase())) {
      return true;
    }
  }
  return false;
}

/**
 * Truncate a string to <= max chars, breaking at the last word boundary
 * before the cap. Default max = 110 (Google's NewsArticle headline limit).
 *
 * If the string is already short enough, returns it unchanged. If a single
 * word exceeds the cap, hard-truncates at max-1 and appends '…' so we
 * never return something longer than the cap.
 */
export function truncateHeadline(s: string, max: number = 110): string {
  const trimmed = s.trim();
  if (trimmed.length <= max) return trimmed;

  // Try to break at the last whitespace within the cap, leaving room for '…'.
  const window = trimmed.slice(0, max - 1);
  const lastSpace = window.lastIndexOf(' ');
  if (lastSpace > 0) {
    return window.slice(0, lastSpace).trimEnd() + '…';
  }

  // No whitespace found — single word too long. Hard-truncate.
  return trimmed.slice(0, max - 1) + '…';
}
