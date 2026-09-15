import { describe, it, expect } from 'vitest';
import { accoladeSentences } from './accolade-sentences';

const src = 'https://example.com/list';

describe('accoladeSentences', () => {
  it('composes one sentence per entry from the stored fields only, newest first', () => {
    const out = accoladeSentences([
      { org: "World's 50 Best Bars", org_key: 'w50b', kind: 'ranked', rank: 2, year: 2025, score: 1124, title: null, source: src },
      { org: 'Tales of the Cocktail Spirited Awards', org_key: 'totc', kind: 'winner', rank: null, year: 2024, score: 713, title: "World's Best Cocktail Menu", source: src },
      { org: 'Shaker Awards', org_key: 'shaker', kind: 'ranked', rank: 3, year: 2025, score: 579, title: 'Top 30 Bares de México', source: src },
      { org: '30 Best Bars India', org_key: '30bbi', kind: 'listed', rank: null, year: 2022, score: 472, title: null, source: src },
      { org: 'Tales of the Cocktail Spirited Awards', org_key: 'totc', kind: 'nominee', rank: null, year: 2026, score: 590, title: 'Best International Bar Team (Top 4)', source: src },
    ]);
    expect(out).toEqual([
      'It was a Tales of the Cocktail Spirited Awards 2026 nominee for Best International Bar Team (Top 4).',
      "World's 50 Best Bars ranked it No. 2 in 2025.",
      'Shaker Awards ranked it No. 3 in 2025.',
      "It won World's Best Cocktail Menu at the Tales of the Cocktail Spirited Awards 2024.",
      '30 Best Bars India listed it in 2022.',
    ]);
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
    ]);
    expect(out.join(' ')).not.toContain('—');
  });
});
