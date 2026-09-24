import { describe, it, expect } from 'vitest';
import { buildHubPanels, defaultSelection, yearsFor, FIFTY_BEST_EDITIONS, hubEditions, qualifyingPanels, panelCoverage, HUB_YEAR_THRESHOLD } from './award-hub-model';
import type { HonoredBar, YearGroup, AwardProgram } from './honored-bars';

const SPIRITED: AwardProgram = { slug: 'spirited-awards', name: 'Tales of the Cocktail Spirited Awards', orgKeys: ['totc'], tagline: '' };

const bar = (slug: string, org_key: string, year: number, rank: number | null, kind = 'ranked', title: string | null = null): HonoredBar =>
  ({
    name: slug, slug, city: 'X', country: 'Y', state: null, photos: null, type: null, tier: null,
    wp_article_slug: null, status: null, accolades: [],
    entry: { org: org_key, org_key, year, rank, kind, title, score: 500, source: 's' },
  }) as unknown as HonoredBar;

describe('buildHubPanels', () => {
  const years: YearGroup[] = [
    {
      year: 2026,
      sections: [
        { label: "Asia's 50 Best Bars", orgKey: 'a50b', bars: [bar('a1', 'a50b', 2026, 1), bar('a2', 'a50b', 2026, 2)] },
        { label: 'The 50 Best Bars', orgKey: 'w50b', bars: [bar('w60', 'w50b', 2026, 60), bar('w52', 'w50b', 2026, 52), bar('w3', 'w50b', 2026, 3)] },
      ],
    },
    {
      year: 2025,
      sections: [{ label: "World's 50 Best Bars", orgKey: 'w50b', bars: [bar('w25', 'w50b', 2025, 25), bar('w2', 'w50b', 2025, 2)] }],
    },
  ];

  it('makes one panel per edition and year, ranked by rank, split at No. 50', () => {
    const panels = buildHubPanels(years, FIFTY_BEST_EDITIONS);
    expect(panels.map(p => `${p.edition}-${p.year}`)).toEqual(['world-2026', 'world-2025', 'asia-2026']);
    expect(panels.map(p => p.title)).toEqual(['The 50 Best Bars 2026', "The World's 50 Best Bars 2025", "Asia's 50 Best Bars 2026"]);
    expect(FIFTY_BEST_EDITIONS.map(e => e.label)).toEqual(['World', 'Asia', 'Europe', 'North America']);
    const world2026 = panels[0];
    expect(world2026.blocks.map(b => b.id)).toEqual(['1-50', '51-100']);
    expect(world2026.blocks[0].cells.map(c => c.bar.slug)).toEqual(['w3']);
    expect(world2026.blocks[1].cells.map(c => c.bar.slug)).toEqual(['w52', 'w60']);
    expect(panels[1].blocks).toHaveLength(1);
    expect(panels[1].blocks[0].cells.map(c => c.bar.slug)).toEqual(['w2', 'w25']);
    expect(world2026.blocks[0].cells[0].kicker).toBeNull();
  });

  it('defaults to the world list in its most recent year', () => {
    const panels = buildHubPanels(years, FIFTY_BEST_EDITIONS);
    expect(defaultSelection(panels, FIFTY_BEST_EDITIONS)).toEqual({ edition: 'world', year: 2026 });
    expect(yearsFor(panels, 'world')).toEqual([2026, 2025]);
    expect(yearsFor(panels, 'europe')).toEqual([]);
  });

  it('keeps category sections as blocks for a winner/nominee program', () => {
    const spirited = hubEditions(SPIRITED);
    const y: YearGroup[] = [{
      year: 2026,
      sections: [
        { label: 'Winner: Best U.S. Hotel Bar', orgKey: 'totc', bars: [bar('v', 'totc', 2026, null, 'winner', 'Best U.S. Hotel Bar')] },
        { label: 'Nominee: Best U.S. Hotel Bar', orgKey: 'totc', bars: [bar('n', 'totc', 2026, null, 'nominee', 'Best U.S. Hotel Bar')] },
      ],
    }];
    const panels = buildHubPanels(y, spirited);
    expect(panels).toHaveLength(1);
    // Two one-bar categories flow into one block, the category on the card.
    expect(panels[0].blocks.map(b => b.id)).toEqual(['honored-1']);
    expect(panels[0].blocks[0].cells.map(c => `${c.bar.slug}:${c.kicker}`)).toEqual(['v:Winner: Best U.S. Hotel Bar', 'n:Nominee: Best U.S. Hotel Bar']);
    expect(spirited[0].slug).toBe('spirited-awards');
  });

  it('keeps a special award beside a ranked list as its own block after the placings', () => {
    const y: YearGroup[] = [{
      year: 2025,
      sections: [
        { label: "Winner: Best New Opening", orgKey: 'w50b', bars: [bar('newbie', 'w50b', 2025, null, 'winner', 'Best New Opening')] },
        { label: "World's 50 Best Bars", orgKey: 'w50b', bars: [bar('w1', 'w50b', 2025, 1), bar('w77', 'w50b', 2025, 77)] },
      ],
    }];
    const panels = buildHubPanels(y, FIFTY_BEST_EDITIONS);
    expect(panels[0].blocks.map(b => `${b.id}:${b.label}:${b.cells.length}`)).toEqual(['1-50:No. 1 to 50:1', '51-100:No. 51 to 100:1', 'honored-3:Winners:1']);
  });

  it('gives a category with four or more bars its own block', () => {
    const spirited = hubEditions(SPIRITED);
    const y: YearGroup[] = [{
      year: 2026,
      sections: [
        { label: 'Nominee: Best U.S. Cocktail Bar', orgKey: 'totc', bars: ['a', 'b', 'c', 'd'].map(s => bar(s, 'totc', 2026, null, 'nominee', 'Best U.S. Cocktail Bar')) },
        { label: 'Winner: Best U.S. Hotel Bar', orgKey: 'totc', bars: [bar('v', 'totc', 2026, null, 'winner', 'Best U.S. Hotel Bar')] },
      ],
    }];
    const panels = buildHubPanels(y, spirited);
    expect(panels[0].blocks.map(b => `${b.id}:${b.cells.length}`)).toEqual(['nominee-best-u-s-cocktail-bar:4', 'honored-2:1']);
  });
});

describe('qualifyingPanels (the hub year threshold)', () => {
  const list = (key: string, year: number, ranks: number[]) => ({ label: key, orgKey: key, bars: ranks.map(r => bar(`${key}-${year}-${r}`, key, year, r)) });
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  it('keeps a year at 45 of 50 and 90 of 100, drops one below, and lets a 51-100-only year through', () => {
    expect(HUB_YEAR_THRESHOLD).toBe(0.9);
    const years: YearGroup[] = [
      { year: 2026, sections: [list('w50b', 2026, range(51, 100))] },            // top 50 not out yet: 50 of 50
      { year: 2025, sections: [list('w50b', 2025, range(1, 100))] },             // 100 of 100
      { year: 2024, sections: [list('w50b', 2024, [1, 2, 3, 60])] },             // 4 of 100
      { year: 2023, sections: [list('w50b', 2023, range(1, 45))] },              // 45 of 50
      { year: 2022, sections: [list('w50b', 2022, range(1, 44))] },              // 44 of 50
      { year: 2021, sections: [list('w50b', 2021, [...range(1, 50), ...range(51, 89)])] }, // 89 of 100
    ];
    const kept = qualifyingPanels(buildHubPanels(years, FIFTY_BEST_EDITIONS));
    expect(kept.map(p => p.year)).toEqual([2026, 2025, 2023]);
    expect(panelCoverage(buildHubPanels(years, FIFTY_BEST_EDITIONS)[5])).toEqual({ held: 89, expected: 100 });
  });

  it('never filters a category program', () => {
    const spirited = hubEditions(SPIRITED);
    const y: YearGroup[] = [{ year: 2020, sections: [{ label: 'Winner: Best U.S. Hotel Bar', orgKey: 'totc', bars: [bar('v', 'totc', 2020, null, 'winner', 'Best U.S. Hotel Bar')] }] }];
    expect(qualifyingPanels(buildHubPanels(y, spirited))).toHaveLength(1);
  });
});
