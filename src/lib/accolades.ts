/**
 * Accolade badge logic.
 *
 * Display-only. `score` is rewritten monthly by a scheduled task with a
 * recency decay, so nothing here recomputes it, caches a derived ranking, or
 * assumes today's numbers hold tomorrow. Tier is read off the data every time.
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

/** Tier classes from the approved mockup. */
export type AccoladeTier = 'acc--top' | 'acc--rank' | 'acc--win' | 'acc--soft';

/** Score at or above which an entry is gold, whatever its kind. */
export const GOLD_SCORE = 900;

/**
 * An entry without a year or a source is not renderable.
 *
 * This is the accuracy guarantee for the whole system: every badge on the site
 * can be traced to a dated, cited award. A badge we cannot substantiate is
 * worse than no badge, so these are dropped rather than shown partially.
 */
export function isRenderable(entry: unknown): entry is Accolade {
  if (!entry || typeof entry !== 'object') return false;
  const a = entry as Record<string, unknown>;
  const hasYear = typeof a.year === 'number' && Number.isFinite(a.year);
  const hasSource = typeof a.source === 'string' && a.source.trim().length > 0;
  const hasOrg = typeof a.org === 'string' && a.org.trim().length > 0;
  return hasYear && hasSource && hasOrg;
}

/** Renderable entries only, order preserved (the array arrives sorted by score). */
export function renderableAccolades(accolades: unknown): Accolade[] {
  if (!Array.isArray(accolades)) return [];
  return accolades.filter(isRenderable);
}

/**
 * Visual tier, driven entirely by the data.
 *
 * Gold wins over kind: a high enough score is the headline whether it came
 * from a ranking or a win. Never hand-tag a tier.
 */
export function tierFor(entry: Accolade): AccoladeTier {
  const score = typeof entry.score === 'number' ? entry.score : 0;
  if (score >= GOLD_SCORE) return 'acc--top';
  if (entry.kind === 'winner') return 'acc--win';
  if (entry.kind === 'ranked') return 'acc--rank';
  return 'acc--soft';
}

/**
 * Shortened org names — cards only, where horizontal space is scarce. The
 * profile shows the full name, because that is where the credential is being
 * read rather than glanced at.
 */
const SHORT_ORG: Record<string, string> = {
  "World's 50 Best Bars": "World's 50 Best",
  "North America's 50 Best Bars": 'NA 50 Best',
  "Asia's 50 Best Bars": "Asia's 50 Best",
  "Europe's 50 Best Bars": "Europe's 50 Best",
};

export function orgLabel(entry: Accolade, opts: { short?: boolean } = {}): string {
  if (!opts.short) return entry.org;
  return SHORT_ORG[entry.org] ?? entry.org;
}

/**
 * The value half of the chip.
 *
 * `listed` deliberately omits the year — those come from undated discovery
 * lists — but the entry still had to carry one to be renderable at all.
 */
export function valueLabel(entry: Accolade): string {
  switch (entry.kind) {
    case 'ranked':
      return entry.rank != null ? `No. ${entry.rank} · ${entry.year}` : `${entry.year}`;
    case 'winner':
      return `${entry.title || 'Winner'} · ${entry.year}`;
    case 'nominee':
      return `Nominee · ${entry.year}`;
    case 'listed':
      return entry.title || 'Listed';
    default:
      return `${entry.year}`;
  }
}

export interface BadgeView {
  key: string;
  tier: AccoladeTier;
  org: string;
  value: string;
  /** Kept for auditability — surfaced as a title attribute, not shown. */
  source: string | null;
}

/**
 * Build the badges to render.
 *
 * `limit` caps what is shown; `overflow` is how many renderable entries were
 * left out, for the `+N more` chip. Counting overflow from renderable entries
 * only means the chip never promises badges that would be dropped for missing
 * data.
 */
export function badgesFor(
  accolades: unknown,
  opts: { limit: number; short?: boolean } = { limit: 3 }
): { badges: BadgeView[]; overflow: number } {
  const usable = renderableAccolades(accolades);
  const shown = usable.slice(0, opts.limit);
  return {
    badges: shown.map(entry => ({
      key: `${entry.org_key || entry.org}-${entry.year}`,
      tier: tierFor(entry),
      org: orgLabel(entry, { short: opts.short }),
      value: valueLabel(entry),
      source: entry.source,
    })),
    overflow: Math.max(0, usable.length - shown.length),
  };
}

/**
 * Award strings for schema.org/award on the bar entity.
 *
 * Deliberately NOT aggregateRating or Review: Google's review-snippet
 * guidelines forbid marking up ratings aggregated from other sites, and an
 * award is not a rating.
 */
export function awardStrings(accolades: unknown): string[] {
  return renderableAccolades(accolades).map(entry => {
    const value = valueLabel(entry).replace(' · ', ', ');
    return `${entry.org} — ${value}`;
  });
}
