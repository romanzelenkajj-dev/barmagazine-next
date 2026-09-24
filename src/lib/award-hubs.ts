import { supabase } from './supabase';
import { renderableAccolades, displayOrg } from './accolades';
import { compareHonoredBars, type AwardProgram, type HonoredBar, type YearGroup } from './honored-bars';

export { compareHonoredBars } from './honored-bars';
export type { AwardProgram, HonoredBar, YearGroup } from './honored-bars';

/**
 * Data layer for the award hub pages (/awards/[program]).
 *
 * Everything comes from bars.accolades jsonb; no new tables, no writes.
 * A program page exists only when at least one active bar holds a
 * renderable accolade from it, so the Bartenders' Choice hub appears
 * automatically the moment its data lands and never ships empty before
 * that.
 */

export const AWARD_PROGRAMS: AwardProgram[] = [
  {
    // "The 50 Best Bars" since 9 September 2026 (the organisation is now
    // "The 50"). The slug stays /awards/worlds-50-best, no redirect; the
    // intro keeps the old name once, for search (task 121).
    slug: 'worlds-50-best',
    name: 'The 50 Best Bars',
    orgKeys: ['w50b', 'a50b', 'e50b', 'na50b'],
    tagline:
      "The 50 Best Bars, formerly The World's 50 Best Bars, and its Asia, Europe and North America editions, voted by the academy of bartenders, writers and drinks experts.",
  },
  {
    slug: 'spirited-awards',
    name: 'Tales of the Cocktail Spirited Awards',
    orgKeys: ['totc'],
    tagline:
      'The Spirited Awards, presented annually by the Tales of the Cocktail Foundation, covering the best bars, bartenders and drinks writing worldwide.',
  },
  {
    slug: 'bartenders-choice',
    name: "Bartenders' Choice Awards",
    orgKeys: ['bca'],
    tagline: "The Bartenders' Choice Awards, voted by working bartenders.",
  },
  {
    slug: 'james-beard',
    name: 'James Beard Awards: Outstanding Bar',
    orgKeys: ['jbf'],
    tagline:
      "The James Beard Foundation's Outstanding Bar award, the highest US honor for a bar program, judged by the Foundation's independent voting body.",
  },
];

export function programBySlug(slug: string): AwardProgram | null {
  return AWARD_PROGRAMS.find(p => p.slug === slug) ?? null;
}

/** All honored bars for a program, grouped year desc then list/category. */
export async function getProgramYears(program: AwardProgram): Promise<YearGroup[]> {
  // Paginated for the same reason as getSeoCities: the 1000-row response
  // cap would silently drop the newest accolade-holding bars as the
  // directory grows.
  const PAGE = 1000;
  const data: {
    name: string; slug: string; city: string; country: string; state: string | null;
    photos: string[] | null; type: string | null; tier: string | null;
    wp_article_slug: string | null; status: string | null; accolades: unknown;
  }[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data: page, error } = await supabase
      .from('bars')
      .select('name, slug, city, country, state, photos, type, tier, wp_article_slug, status, accolades')
      .eq('is_active', true)
      .not('accolades', 'is', null)
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`getProgramYears failed: ${error.message}`);
    if (!page || page.length === 0) break;
    data.push(...page);
    if (page.length < PAGE) break;
  }
  if (data.length === 0) return [];

  const rows: HonoredBar[] = [];
  for (const bar of data) {
    for (const entry of renderableAccolades(bar.accolades)) {
      if (program.orgKeys.includes(entry.org_key)) {
        rows.push({
          name: bar.name, slug: bar.slug, city: bar.city, country: bar.country,
          state: bar.state ?? null, photos: bar.photos ?? null, type: bar.type ?? null,
          tier: bar.tier ?? null, wp_article_slug: bar.wp_article_slug ?? null,
          status: bar.status ?? null, accolades: bar.accolades, entry,
        });
      }
    }
  }

  const byYear = new Map<number, HonoredBar[]>();
  for (const r of rows) {
    const y = r.entry.year as number;
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(r);
  }

  const byMerit = compareHonoredBars;

  const sectionLabel = (r: HonoredBar): string => {
    if (r.entry.kind === 'winner' || r.entry.kind === 'nominee') {
      const category = r.entry.title || 'Honored';
      return r.entry.kind === 'winner' ? `Winner: ${category}` : `Nominee: ${category}`;
    }
    return displayOrg(r.entry);
  };

  return Array.from(byYear.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, bars]) => {
      // Grouped by org key AND label, so a list whose display name changed
      // between years (the world list, 2026) still forms one section per
      // year and the hub model can pick sections by key.
      const bySection = new Map<string, { label: string; orgKey: string; bars: HonoredBar[] }>();
      for (const b of bars) {
        const label = sectionLabel(b);
        const k = `${b.entry.org_key}|${label}`;
        if (!bySection.has(k)) bySection.set(k, { label, orgKey: b.entry.org_key, bars: [] });
        bySection.get(k)!.bars.push(b);
      }
      return {
        year,
        sections: Array.from(bySection.values())
          .sort((a, b) => {
            // Winners lead nominees; 50 Best lists sort by list name.
            const aw = a.label.startsWith('Winner') ? 0 : a.label.startsWith('Nominee') ? 1 : 2;
            const bw = b.label.startsWith('Winner') ? 0 : b.label.startsWith('Nominee') ? 1 : 2;
            return aw - bw || a.label.localeCompare(b.label);
          })
          .map(section => ({
            label: section.label,
            orgKey: section.orgKey,
            bars: section.bars.sort(byMerit),
          })),
      };
    });
}

/** Programs that currently have at least one honored bar. */
export async function getLiveAwardPrograms(): Promise<{ program: AwardProgram; barCount: number }[]> {
  const out: { program: AwardProgram; barCount: number }[] = [];
  for (const program of AWARD_PROGRAMS) {
    const years = await getProgramYears(program);
    const barCount = new Set(years.flatMap(y => y.sections.flatMap(s => s.bars.map(b => b.slug)))).size;
    if (barCount > 0) out.push({ program, barCount });
  }
  return out;
}
