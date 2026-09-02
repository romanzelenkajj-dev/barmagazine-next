import { supabase } from './supabase';
import { renderableAccolades, type Accolade } from './accolades';

/**
 * Data layer for the award hub pages (/awards/[program]).
 *
 * Everything comes from bars.accolades jsonb; no new tables, no writes.
 * A program page exists only when at least one active bar holds a
 * renderable accolade from it, so the Bartenders' Choice hub appears
 * automatically the moment its data lands and never ships empty before
 * that.
 */

export interface AwardProgram {
  slug: string;
  name: string;
  orgKeys: string[];
  /** Short positioning line under the title. */
  tagline: string;
}

export const AWARD_PROGRAMS: AwardProgram[] = [
  {
    slug: 'worlds-50-best',
    name: "The World's 50 Best Bars",
    orgKeys: ['w50b', 'a50b', 'e50b', 'na50b'],
    tagline:
      "The 50 Best family: the world list and its Asia, Europe and North America editions, voted by the academy of bartenders, writers and drinks experts.",
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

export interface HonoredBar {
  name: string;
  slug: string;
  city: string;
  country: string;
  entry: Accolade;
}

export interface YearGroup {
  year: number;
  /** Grouping label inside a year: the list name for 50 Best, the category
      for winner/nominee awards. */
  sections: { label: string; bars: HonoredBar[] }[];
}

/** All honored bars for a program, grouped year desc then list/category. */
export async function getProgramYears(program: AwardProgram): Promise<YearGroup[]> {
  const { data, error } = await supabase
    .from('bars')
    .select('name, slug, city, country, accolades')
    .eq('is_active', true)
    .not('accolades', 'is', null);
  if (error || !data) return [];

  const rows: HonoredBar[] = [];
  for (const bar of data) {
    for (const entry of renderableAccolades(bar.accolades)) {
      if (program.orgKeys.includes(entry.org_key)) {
        rows.push({ name: bar.name, slug: bar.slug, city: bar.city, country: bar.country, entry });
      }
    }
  }

  const byYear = new Map<number, HonoredBar[]>();
  for (const r of rows) {
    const y = r.entry.year as number;
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(r);
  }

  const sectionLabel = (r: HonoredBar): string => {
    if (r.entry.kind === 'winner' || r.entry.kind === 'nominee') {
      const category = r.entry.title || 'Honored';
      return r.entry.kind === 'winner' ? `Winner: ${category}` : `Nominee: ${category}`;
    }
    return r.entry.org;
  };

  return Array.from(byYear.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, bars]) => {
      const bySection = new Map<string, HonoredBar[]>();
      for (const b of bars) {
        const label = sectionLabel(b);
        if (!bySection.has(label)) bySection.set(label, []);
        bySection.get(label)!.push(b);
      }
      return {
        year,
        sections: Array.from(bySection.entries())
          .sort((a, b) => {
            // Winners lead nominees; 50 Best lists sort by list name.
            const aw = a[0].startsWith('Winner') ? 0 : a[0].startsWith('Nominee') ? 1 : 2;
            const bw = b[0].startsWith('Winner') ? 0 : b[0].startsWith('Nominee') ? 1 : 2;
            return aw - bw || a[0].localeCompare(b[0]);
          })
          .map(([label, sectionBars]) => ({
            label,
            bars: sectionBars.sort(
              (a, b) => (a.entry.rank ?? 999) - (b.entry.rank ?? 999) || a.name.localeCompare(b.name)
            ),
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
