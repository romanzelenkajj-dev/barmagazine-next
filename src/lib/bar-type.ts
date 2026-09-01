import { formatBarType } from './utils';

/**
 * The one type label a bar wears where there is room for only one pill.
 *
 * Nearly every bar in the directory is a cocktail bar, so "Cocktail Bar" is
 * the least informative label we can print. The pill therefore shows the
 * most SPECIFIC style from the union of the primary `type` and the curated
 * `subtypes`: a Cocktail Bar tagged Speakeasy reads "Speakeasy". Profiles
 * still show the full tag set; this only decides which one leads.
 *
 * Priority runs from most to least distinctive; Cocktail Bar is the
 * fallback, not a contender.
 */
const TYPE_PRIORITY = [
  'Speakeasy',
  'Rooftop Bar',
  'Tiki Bar',
  'Whiskey Bar',
  'Wine Bar',
  'Beer Bar',
  'Pub',
  'Hotel Bar',
  'Cocktail Bar',
] as const;

export function barTypeUnion(bar: { type: string | null; subtypes?: string[] | null }): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of [bar.type, ...(bar.subtypes ?? [])]) {
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

/** The highest-priority label from the bar's type union, display-formatted. */
export function displayType(bar: { type: string | null; subtypes?: string[] | null }): string {
  const union = barTypeUnion(bar);
  for (const p of TYPE_PRIORITY) {
    if (union.includes(p)) return formatBarType(p);
  }
  // Unknown custom type: show it as-is rather than hiding it.
  return union.length > 0 ? formatBarType(union[0]) : '';
}
