import { describe, it, expect } from 'vitest';
import { buildHubPanels, defaultSelection, yearsFor, FIFTY_BEST_EDITIONS, hubEditions } from './award-hub-model';
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
