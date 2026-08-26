import { describe, it, expect } from 'vitest';
import {
  isRenderable,
  renderableAccolades,
  tilesFor,
  awardLines,
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

    it('awardLines: one visible line per winner/nominee, none for ranked', () => {
      const lines = awardLines([
        make({ org_key: 'w50b', kind: 'ranked', rank: 3, score: 900 }),
        make({
          org_key: 'totc',
          org: 'Tales of the Cocktail Spirited Awards',
          kind: 'winner',
          rank: null,
          title: "World's Best Bar",
          year: 2026,
          score: 800,
        }),
        make({
          org_key: 'bca',
          org: "Bartenders' Choice Awards",
          kind: 'nominee',
          rank: null,
          title: 'Best Cocktail Bar (Slovakia)',
          year: 2026,
          score: 400,
        }),
      ]);
      expect(lines).toEqual([
        "Tales of the Cocktail Spirited Awards 2026 — World's Best Bar",
        "Bartenders' Choice Awards 2026 — Best Cocktail Bar (Slovakia)",
      ]);
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

    it('winner/nominee with rank null render exactly like ranked entries', () => {
      // Same renderability rules: year + source + known org is all it takes.
      const winner = make({ org_key: 'totc', kind: 'winner', rank: null, title: 'Best Bar' });
      expect(isRenderable(winner)).toBe(true);
      // And they compete in the same top-3-by-score ordering.
      const mixed = [
        make({ org_key: 'w50b', kind: 'ranked', score: 500 }),
        make({ org_key: 'totc', kind: 'winner', rank: null, score: 900 }),
        make({ org_key: 'totc', kind: 'nominee', rank: null, score: 100, year: 2025 }),
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
});
