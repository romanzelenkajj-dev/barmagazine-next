import { describe, it, expect } from 'vitest';
import {
  isRenderable,
  renderableAccolades,
  tilesFor,
  awardStrings,
  MAX_TILES,
  type Accolade,
} from './accolades';

const base: Accolade = {
  org: "World's 50 Best Bars",
  org_key: 'w50b',
  year: 2025,
  rank: 32,
  kind: 'ranked',
  title: null,
  score: 800,
  source: 'https://www.theworlds50best.com/bars/list/1-50',
};

const make = (over: Partial<Accolade> = {}): Accolade => ({ ...base, ...over });

describe('accolades', () => {
  describe('isRenderable — the accuracy guarantee', () => {
    it('accepts a complete entry with a known org', () => {
      expect(isRenderable(make())).toBe(true);
    });

    it('rejects an entry with no year', () => {
      expect(isRenderable(make({ year: null }))).toBe(false);
    });

    it('rejects an entry with no source', () => {
      expect(isRenderable(make({ source: null }))).toBe(false);
      expect(isRenderable(make({ source: '  ' }))).toBe(false);
    });

    it('rejects an unknown org_key — there is no approved wording to show', () => {
      expect(isRenderable(make({ org_key: 'some_new_award' }))).toBe(false);
    });

    it('rejects 50 Best Discovery — a listing, not a jury ranking', () => {
      expect(isRenderable(make({ org: "World's 50 Best Bars Discovery" }))).toBe(false);
      expect(isRenderable(make({ org_key: 'w50b_discovery' }))).toBe(false);
    });

    it('rejects junk', () => {
      for (const bad of [null, undefined, 'x', 42, []]) expect(isRenderable(bad)).toBe(false);
    });

    it('returns empty for a non-array', () => {
      expect(renderableAccolades(null)).toEqual([]);
      expect(renderableAccolades({})).toEqual([]);
    });
  });

  describe('tilesFor — wording', () => {
    it('keeps the bold line constant across the whole 50 Best family', () => {
      const mains = ['w50b', 'a50b', 'e50b', 'na50b'].map(
        org_key => tilesFor([make({ org_key })])[0].main
      );
      expect(mains).toEqual(['50 BEST', '50 BEST', '50 BEST', '50 BEST']);
    });

    it('carries the possessive on the region line', () => {
      const region = (org_key: string) => tilesFor([make({ org_key })])[0].region;
      expect(region('w50b')).toBe("WORLD'S");
      expect(region('a50b')).toBe("ASIA'S");
      expect(region('e50b')).toBe("EUROPE'S");
      expect(region('na50b')).toBe("N. AMERICA'S");
    });

    it('has a bca tile ready before its data lands', () => {
      const [tile] = tilesFor([make({ org_key: 'bca', org: "Bartenders' Choice Awards", kind: 'winner' })]);
      expect(tile.region).toBe("BARTENDERS'");
      expect(tile.main).toBe('CHOICE');
      expect(tile.tier).toBe('grey');
    });

    it('totc: TOTC / SPIRITED / year — never "Tales of the Spirited"', () => {
      const [tile] = tilesFor([
        make({
          org_key: 'totc',
          org: 'Tales of the Cocktail Spirited Awards',
          kind: 'winner',
          rank: null,
          title: "World's Best Bar",
          year: 2026,
        }),
      ]);
      expect(tile.region).toBe('TOTC');
      expect(tile.main).toBe('SPIRITED');
      expect(tile.year).toBe('2026');
      expect(tile.title).toBe("World's Best Bar");
      // The full name for title/aria comes from org, not the tile lines.
      expect(tile.org).toBe('Tales of the Cocktail Spirited Awards');
    });

    it('tiles carry no caption — the award story lives in the description text', () => {
      const [tile] = tilesFor([make({ org_key: 'w50b', kind: 'ranked', rank: 1 })]);
      expect('caption' in tile).toBe(false);
    });

    it('shows the year as the third line', () => {
      expect(tilesFor([make({ year: 2024 })])[0].year).toBe('2024');
    });

    it('never exposes a rank — being on the list is the badge', () => {
      const tile = tilesFor([make({ rank: 1 })])[0];
      expect(JSON.stringify(tile)).not.toContain('No.');
      expect(JSON.stringify(tile)).not.toMatch(/"1"/);
    });
  });

  describe('tilesFor — one tile per org per year', () => {
    const totc = (year: number, kind: Accolade['kind'], title: string, score = 590) =>
      make({ org: 'Tales of the Cocktail Spirited Awards', org_key: 'totc', kind, rank: null, year, score, title });

    it('renders two same-year categories from one body as ONE tile (Pretty Penny)', () => {
      const tiles = tilesFor([
        totc(2024, 'nominee', 'Best New U.S. Cocktail Bar (Regional Honoree)'),
        totc(2024, 'nominee', 'Best U.S. Restaurant Bar (Regional Honoree)'),
        totc(2025, 'nominee', 'Best New U.S. Cocktail Bar (Regional Honoree)'),
        totc(2026, 'nominee', 'Best U.S. Restaurant Bar (Regional Honoree)'),
      ]);
      expect(tiles.map(t => t.key)).toEqual(['totc-2024', 'totc-2025', 'totc-2026']);
      // Same stage: the first stored entry carries the tile.
      expect(tiles[0].title).toBe('Best New U.S. Cocktail Bar (Regional Honoree)');
    });

    it('keeps the further stage when the two entries differ (a win over a nomination)', () => {
      const tiles = tilesFor([
        totc(2026, 'nominee', 'Best U.S. Bar Team (Regional Honoree)'),
        totc(2026, 'winner', 'Best U.S. Restaurant Bar', 810),
      ]);
      expect(tiles).toHaveLength(1);
      expect(tiles[0].tier).toBe('orange');
      expect(tiles[0].title).toBe('Best U.S. Restaurant Bar');
      // Within nominations the parenthetical is the ladder.
      const [t] = tilesFor([
        totc(2026, 'nominee', 'Best U.S. Restaurant Bar (Regional Honoree)'),
        totc(2026, 'nominee', 'Best U.S. Restaurant Bar (Top 10 Nominee)'),
      ]);
      expect(t.title).toBe('Best U.S. Restaurant Bar (Top 10 Nominee)');
    });

    it('applies the top-three rule AFTER the dedupe', () => {
      const tiles = tilesFor([
        totc(2024, 'nominee', 'A (Regional Honoree)'),
        totc(2024, 'nominee', 'B (Regional Honoree)'),
        totc(2025, 'nominee', 'A (Regional Honoree)'),
        totc(2025, 'nominee', 'B (Regional Honoree)'),
      ]);
      expect(tiles.map(t => t.key)).toEqual(['totc-2024', 'totc-2025']);
    });

    it('does not collapse different orgs or different years', () => {
      const tiles = tilesFor([
        make({ org_key: 'w50b', year: 2025, score: 1124 }),
        totc(2025, 'winner', 'Best International Cocktail Bar', 810),
        totc(2024, 'winner', 'Best International Cocktail Bar', 713),
      ]);
      expect(tiles.map(t => t.key)).toEqual(['w50b-2025', 'totc-2025', 'totc-2024']);
    });
  });

  describe('tilesFor — colour tiers', () => {
    it('reserves gold for the world list only', () => {
      expect(tilesFor([make({ org_key: 'w50b' })])[0].tier).toBe('gold');
      for (const org_key of ['a50b', 'e50b', 'na50b']) {
        expect(tilesFor([make({ org_key })])[0].tier).toBe('dark');
      }
    });

    it('totc: solid orange for winner, orange outline for nominee', () => {
      expect(tilesFor([make({ org_key: 'totc', kind: 'winner', rank: null })])[0].tier).toBe('orange');
      expect(tilesFor([make({ org_key: 'totc', kind: 'nominee', rank: null })])[0].tier).toBe('orange-outline');
    });

    it('bca: solid grey for winner, grey outline for nominee', () => {
      expect(tilesFor([make({ org_key: 'bca', kind: 'winner', rank: null })])[0].tier).toBe('grey');
      expect(tilesFor([make({ org_key: 'bca', kind: 'nominee', rank: null })])[0].tier).toBe('grey-outline');
    });

    it('jbf: solid burgundy for winner, burgundy outline for nominee', () => {
      expect(tilesFor([make({ org_key: 'jbf', kind: 'winner', rank: null })])[0].tier).toBe('burgundy');
      expect(tilesFor([make({ org_key: 'jbf', kind: 'nominee', rank: null })])[0].tier).toBe('burgundy-outline');
    });

    it('jbf: two lines only, JAMES BEARD / year, category in title', () => {
      const tile = tilesFor([make({ org_key: 'jbf', kind: 'winner', rank: null, year: 2026, title: 'Outstanding Bar' })])[0];
      expect(tile.region).toBe('');
      expect(tile.main).toBe('JAMES BEARD');
      expect(tile.year).toBe('2026');
      expect(tile.title).toBe('Outstanding Bar');
    });

    it('winner/nominee with rank null render exactly like ranked entries', () => {
      // Same renderability rules: year + source + known org is all it takes.
      const winner = make({ org_key: 'totc', kind: 'winner', rank: null, title: 'Best Bar' });
      expect(isRenderable(winner)).toBe(true);
      // And they compete in the same top-3-by-score ordering. (Different
      // years for the two totc entries: one tile per org per year.)
      const mixed = [
        make({ org_key: 'w50b', kind: 'ranked', score: 500 }),
        make({ org_key: 'totc', kind: 'winner', rank: null, score: 900 }),
        make({ org_key: 'totc', kind: 'nominee', rank: null, score: 100, year: 2024 }),
      ];
      const keys = tilesFor(mixed).map(t => t.key.split('-')[0]);
      expect(keys).toEqual(['totc', 'w50b', 'totc']);
    });

    it('tier comes from the org, not the score', () => {
      // A regional list with a huge score is still dark.
      expect(tilesFor([make({ org_key: 'a50b', score: 5000 })])[0].tier).toBe('dark');
      // The world list with a low score is still gold.
      expect(tilesFor([make({ org_key: 'w50b', score: 1 })])[0].tier).toBe('gold');
    });
  });

  describe('tilesFor — limits', () => {
    const four = [
      make({ org_key: 'w50b', score: 500 }),
      make({ org_key: 'a50b', score: 900 }),
      make({ org_key: 'e50b', score: 700 }),
      make({ org_key: 'na50b', score: 800 }),
    ];

    it('caps at three', () => {
      expect(tilesFor(four)).toHaveLength(MAX_TILES);
      expect(MAX_TILES).toBe(3);
    });

    it('keeps the top three by score, dropping the lowest', () => {
      const keys = tilesFor(four).map(t => t.key.split('-')[0]);
      expect(keys).toEqual(['a50b', 'na50b', 'e50b']);
      expect(keys).not.toContain('w50b');
    });

    it('renders nothing for a bar with no accolades', () => {
      expect(tilesFor(null)).toEqual([]);
      expect(tilesFor([])).toEqual([]);
    });

    it('keeps the source for auditability', () => {
      expect(tilesFor([make()])[0].source).toBe(base.source);
    });
  });

  describe('awardStrings', () => {
    it('includes rank for machines even though the tile hides it', () => {
      expect(awardStrings([make({ rank: 8 })])).toEqual([
        "World's 50 Best Bars 2025 — No. 8",
      ]);
    });

    it('carries the category for rankless awards', () => {
      expect(
        awardStrings([
          make({
            org: 'Tales of the Cocktail Spirited Awards',
            org_key: 'totc',
            kind: 'winner',
            rank: null,
            title: "World's Best Bar",
            year: 2026,
          }),
        ])
      ).toEqual(["Tales of the Cocktail Spirited Awards 2026 — World's Best Bar"]);
    });

    it('excludes entries that could not be substantiated', () => {
      expect(awardStrings([make(), make({ source: null })])).toHaveLength(1);
    });
  });

  describe('30 Best Bars India', () => {
    const src = 'https://www.30bestbarsindia.in/';

    it('renders a ranked placing as a national tile', () => {
      const [t] = tilesFor([
        { org: '30 Best Bars India', org_key: '30bbi', kind: 'ranked', rank: 19, year: 2025, score: 500, title: null, source: src },
      ]);
      expect(t.region).toBe('INDIA');
      expect(t.main).toBe('30 BEST');
      expect(t.year).toBe('2025');
      expect(t.tier).toBe('navy');
    });

    it('does not draw the rank, which rides the hover text like every org', () => {
      const [t] = tilesFor([
        { org: '30 Best Bars India', org_key: '30bbi', kind: 'ranked', rank: 7, year: 2024, score: 500, title: null, source: src },
      ]);
      expect(t.main).not.toMatch(/7|No\./);
      expect(t.region).not.toMatch(/7|No\./);
    });

    it('carries named category wins solid and nominees outlined', () => {
      const [win] = tilesFor([
        { org: '30 Best Bars India', org_key: '30bbi', kind: 'winner', rank: null, year: 2023, score: 500, title: 'Best Work in Sustainability', source: src },
      ]);
      expect(win.tier).toBe('navy');
      expect(win.title).toBe('Best Work in Sustainability');
      const [nom] = tilesFor([
        { org: '30 Best Bars India', org_key: '30bbi', kind: 'nominee', rank: null, year: 2023, score: 500, title: 'Best Bar Team', source: src },
      ]);
      expect(nom.tier).toBe('navy-outline');
    });
  });

  describe('Shaker Awards', () => {
    const src = 'https://shakerawards.com/top-30/top2025/';

    it('renders a Top 30 placing as a national tile with the accented region line', () => {
      const [t] = tilesFor([
        { org: 'Shaker Awards', org_key: 'shaker', kind: 'ranked', rank: 4, year: 2025, score: 576, title: 'Top 30 Bares de México', source: src },
      ]);
      expect(t.region).toBe('MÉXICO');
      expect(t.main).toBe('SHAKER');
      expect(t.year).toBe('2025');
      expect(t.tier).toBe('navy');
    });

    it('keeps the bold line constant for an unranked Top 100 listing', () => {
      // From 2026 Shaker also issues an unranked Top 100; the tile must not
      // claim "TOP 30" for it, which is why the main line is the body's name.
      const [t] = tilesFor([
        { org: 'Shaker Awards', org_key: 'shaker', kind: 'listed', rank: null, year: 2026, score: 520, title: 'Top 100 Bares de México', source: 'https://shakerawards.com/bartolome/' },
      ]);
      expect(t.main).toBe('SHAKER');
      expect(t.tier).toBe('navy');
    });

    it('does not draw the rank', () => {
      const [t] = tilesFor([
        { org: 'Shaker Awards', org_key: 'shaker', kind: 'ranked', rank: 1, year: 2025, score: 585, title: null, source: src },
      ]);
      expect(t.main).not.toMatch(/1|No\./);
      expect(t.region).not.toMatch(/1|No\./);
    });

    it('carries the rank for the hover text without drawing it', () => {
      // Rank is unexposed on the tile FACE, present on hover, for every org.
      const [t] = tilesFor([
        { org: 'Shaker Awards', org_key: 'shaker', kind: 'ranked', rank: 4, year: 2025, score: 576, title: null, source: src },
      ]);
      expect(t.rank).toBe(4);
      expect(`${t.region} ${t.main} ${t.year}`).not.toMatch(/\b4\b|No\./);
      const [w] = tilesFor([
        { org: "World's 50 Best Bars", org_key: 'w50b', kind: 'ranked', rank: 2, year: 2025, score: 1124, title: null, source: 'https://www.theworlds50best.com/bars/' },
      ]);
      expect(w.rank).toBe(2);
    });

    it('ignores the audit-only basis field', () => {
      const [t] = tilesFor([
        { org: 'Shaker Awards', org_key: 'shaker', kind: 'ranked', rank: 1, year: 2023, score: 561, title: null, source: 'https://shakerawards.com/top-30/top2023/', basis: 'name carried across Shaker 2024/2025 entries' },
      ]);
      expect(t.year).toBe('2023');
      expect(JSON.stringify(t)).not.toContain('carried');
    });
  });

  describe('editorial lists are not accolades', () => {
    it('drops magazine picks, which have no org key by design', () => {
      // Food & Wine, Eater, Esquire and their kind never get a tile: the
      // badge means an awards body ranked this bar. The test is process
      // (named jury, published methodology, annual cycle, year-tied list),
      // not publisher: a jury-voted list printed by a magazine passes, an
      // editor's pick does not. See the TILES comment in accolades.ts.
      for (const org_key of ['fw', 'eater', 'esquire', 'timeout', 'thrillist']) {
        expect(
          tilesFor([{ org: 'A magazine', org_key, kind: 'winner', rank: null, year: 2024, score: 900, title: 'Best Bars', source: 'https://example.com' }])
        ).toEqual([]);
      }
    });
  });

  describe('unverified entries', () => {
    const base = {
      org: '30 Best Bars India', org_key: '30bbi', kind: 'ranked',
      rank: 19, year: 2025, score: 500, title: null,
      source: 'https://www.30bestbarsindia.in/',
    };

    it('renders normally when not flagged', () => {
      expect(tilesFor([base])).toHaveLength(1);
    });

    it('is held back entirely when flagged, even though every field is valid', () => {
      expect(tilesFor([{ ...base, unverified: true }])).toEqual([]);
    });

    it('does not suppress its neighbours', () => {
      const ok = { ...base, year: 2024, rank: 7 };
      const held = { ...base, unverified: true };
      expect(tilesFor([held, ok])).toHaveLength(1);
    });
  });
});
