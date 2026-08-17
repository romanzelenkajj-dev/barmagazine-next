// Shared data — no 'use client' directive so this can be imported by both
// server components (e.g. Top10FooterBlock, page.tsx) and client components
// (e.g. Top10CityPicker).
//
// articleSlug points at the "Top 10 Bars in <city>" editorial article; cities
// without one yet fall back to the directory's top-10 view. Use top10Href()
// so every "Top 10 Bars" link on the site resolves the same way.
export const TOP10_CITIES = [
  { label: 'Dubai',      dirSlug: 'dubai',     articleSlug: null },
  { label: 'Hong Kong',  dirSlug: 'hong-kong', articleSlug: 'top-10-bars-in-hong-kong-for-2026' },
  { label: 'London',     dirSlug: 'london',    articleSlug: 'top-10-bars-in-london-2026' },
  { label: 'New York',   dirSlug: 'new-york',  articleSlug: 'top-10-bars-in-new-york-2026' },
  { label: 'Singapore',  dirSlug: 'singapore', articleSlug: 'top-10-bars-in-singapore-2026' },
  { label: 'Tokyo',      dirSlug: 'tokyo',     articleSlug: null },
] as const;

export function top10Href(c: { dirSlug: string; articleSlug: string | null }): string {
  return c.articleSlug ? `/${c.articleSlug}` : `/bars/city/${c.dirSlug}?view=top10`;
}
