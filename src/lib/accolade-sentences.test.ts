import { describe, it, expect } from 'vitest';
import { accoladeSentences, orgSentence } from './accolade-sentences';
import type { Accolade } from './accolades';

const src = 'https://example.com/list';
const TOTC = 'Tales of the Cocktail Spirited Awards';
const totc = (year: number, kind: Accolade['kind'], title: string, score = 590): Accolade =>
  ({ org: TOTC, org_key: 'totc', kind, rank: null, year, score, title, source: src });

describe('accoladeSentences', () => {
  it('composes ONE sentence per org, grouping years and categories (Pretty Penny)', () => {
    const out = accoladeSentences([
      totc(2024, 'nominee', 'Best New U.S. Cocktail Bar (Regional Honoree)'),
      totc(2024, 'nominee', 'Best U.S. Restaurant Bar (Regional Honoree)'),
      totc(2025, 'nominee', 'Best New U.S. Cocktail Bar (Regional Honoree)'),
      totc(2026, 'nominee', 'Best U.S. Restaurant Bar (Regional Honoree)'),
    ]);
    expect(out).toEqual([
      'The Spirited Awards named it a regional honoree for Best New U.S. Cocktail Bar in 2024 and 2025 and for Best U.S. Restaurant Bar in 2024 and 2026.',
    ]);
  });

  it('never writes "nominee" for a regional honoree; the stage word comes from the entry', () => {
    const regional = orgSentence([totc(2026, 'nominee', 'Best U.S. Hotel Bar (Regional Honoree)')]);
    expect(regional).toBe('The Spirited Awards named it a regional honoree for Best U.S. Hotel Bar in 2026.');
    expect(regional).not.toMatch(/nominee/);
    expect(orgSentence([totc(2026, 'nominee', 'Best U.S. Restaurant Bar (Top 10 Nominee)')]))
      .toBe('The Spirited Awards named it a Top 10 nominee for Best U.S. Restaurant Bar in 2026.');
    expect(orgSentence([totc(2026, 'nominee', 'Best U.S. Cocktail Bar (Top 4)')]))
      .toBe('The Spirited Awards named it a Top 4 finalist for Best U.S. Cocktail Bar in 2026.');
    expect(orgSentence([
      { org: 'James Beard Awards', org_key: 'jbf', kind: 'nominee', rank: null, year: 2024, score: 200, title: 'Outstanding Bar (Semifinalist)', source: src },
    ])).toBe('The James Beard Awards named it a semifinalist for Outstanding Bar in 2024.');
    expect(orgSentence([
      { org: 'James Beard Awards', org_key: 'jbf', kind: 'nominee', rank: null, year: 2026, score: 200, title: 'Outstanding Bar', source: src },
    ])).toBe('The James Beard Awards named it a nominee for Outstanding Bar in 2026.');
  });

  it('a win and a nomination from the same body share one sentence, the win first (Cobra)', () => {
    expect(orgSentence([
      totc(2026, 'winner', 'Best U.S. Restaurant Bar', 810),
      totc(2026, 'nominee', 'Best U.S. Bar Team (Top 10 Nominee)'),
      totc(2026, 'nominee', 'Best U.S. Bar Team (Regional Honoree)'),
    ])).toBe(
      'The Spirited Awards named it Best U.S. Restaurant Bar in 2026, a Top 10 nominee for Best U.S. Bar Team in 2026 and a regional honoree for Best U.S. Bar Team in 2026.'
    );
  });

  it('ranked, listed and named honors from one body read as one sentence (Cobbler & Crew)', () => {
    const b = (over: Partial<Accolade>): Accolade =>
      ({ org: '30 Best Bars India', org_key: '30bbi', kind: 'ranked', rank: null, year: 2023, score: 500, title: null, source: src, ...over });
    expect(accoladeSentences([
      b({ kind: 'ranked', rank: 2, year: 2023 }),
      b({ kind: 'ranked', rank: 7, year: 2024 }),
      b({ kind: 'ranked', rank: 19, year: 2025 }),
      b({ kind: 'listed', year: 2022 }),
      b({ kind: 'winner', year: 2023, title: 'Highest New Entry' }),
      b({ kind: 'winner', year: 2023, title: 'Best Bar Team' }),
      b({ kind: 'winner', year: 2023, title: 'Best Work in Sustainability' }),
      b({ kind: 'winner', year: 2022, title: 'Best Work in Sustainability' }),
    ])).toEqual([
      '30 Best Bars India ranked it No. 2 in 2023, No. 7 in 2024 and No. 19 in 2025, listed it in 2022 and named it Best Work in Sustainability in 2022 and 2023, Highest New Entry in 2023 and Best Bar Team in 2023.',
    ]);
  });

  it('orders the bodies newest first, then by score (Handshake)', () => {
    const out = accoladeSentences([
      { org: "World's 50 Best Bars", org_key: 'w50b', kind: 'ranked', rank: 2, year: 2025, score: 1124, title: null, source: src },
      { org: "North America's 50 Best Bars", org_key: 'na50b', kind: 'ranked', rank: 12, year: 2026, score: 856, title: null, source: src },
      totc(2024, 'winner', "World's Best Cocktail Menu", 713),
      { org: 'Shaker Awards', org_key: 'shaker', kind: 'ranked', rank: 3, year: 2025, score: 579, title: 'Top 30 Bares de México', source: src },
      { org: 'Shaker Awards', org_key: 'shaker', kind: 'ranked', rank: 1, year: 2024, score: 573, title: 'Top 30 Bares de México', source: src },
      { org: 'Shaker Awards', org_key: 'shaker', kind: 'ranked', rank: 1, year: 2023, score: 561, title: 'Top 30 Bares de México', source: src },
    ]);
    expect(out).toEqual([
      "North America's 50 Best Bars ranked it No. 12 in 2026.",
      "World's 50 Best Bars ranked it No. 2 in 2025.",
      'Shaker Awards ranked it No. 1 in 2023 and 2024 and No. 3 in 2025.',
      "The Spirited Awards named it World's Best Cocktail Menu in 2024.",
    ]);
  });

  it('The Pinnacle Guide awards a grade: "awarded it 2 Pins in 2024", singular for 1 Pin', () => {
    const pin = (year: number, title: string, kind: Accolade['kind']): Accolade =>
      ({ org: 'The Pinnacle Guide', org_key: 'pinnacle', kind, rank: null, year, score: 546, title, source: src });
    expect(orgSentence([pin(2024, '2 Pins', 'winner')])).toBe('The Pinnacle Guide awarded it 2 Pins in 2024.');
    expect(orgSentence([pin(2025, '1 Pin', 'nominee')])).toBe('The Pinnacle Guide awarded it 1 Pin in 2025.');
    expect(orgSentence([pin(2024, '1 Pin', 'nominee'), pin(2026, '2 Pins', 'winner')]))
      .toBe('The Pinnacle Guide awarded it 1 Pin in 2024 and 2 Pins in 2026.');
  });

  it('holds back exactly what the tiles hold back', () => {
    expect(accoladeSentences([
      { org: 'Eater', org_key: 'eater', kind: 'winner', rank: null, year: 2024, score: 900, title: 'Best Bars', source: src },
      { org: "World's 50 Best Bars", org_key: 'w50b', kind: 'ranked', rank: 9, year: null, score: 900, title: null, source: src },
      { org: '30 Best Bars India', org_key: '30bbi', kind: 'ranked', rank: 2, year: 2023, score: 558, title: null, source: src, unverified: true },
    ])).toEqual([]);
    expect(accoladeSentences(null)).toEqual([]);
  });

  it('uses no em dash anywhere in the copy', () => {
    const out = accoladeSentences([
      { org: 'James Beard Foundation Awards', org_key: 'jbf', kind: 'nominee', rank: null, year: 2026, score: 500, title: 'Outstanding Bar', source: src },
      totc(2024, 'winner', "World's Best Cocktail Menu", 713),
    ]);
    expect(out.join(' ')).not.toContain('—');
  });
});
