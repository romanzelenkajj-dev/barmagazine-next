import { describe, it, expect } from 'vitest';
import {
  isRenderable,
  renderableAccolades,
  tierFor,
  valueLabel,
  orgLabel,
  badgesFor,
  awardStrings,
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
    it('accepts a complete entry', () => {
      expect(isRenderable(make())).toBe(true);
    });

    it('rejects an entry with no year', () => {
      expect(isRenderable(make({ year: null }))).toBe(false);
    });

    it('rejects an entry with no source', () => {
      expect(isRenderable(make({ source: null }))).toBe(false);
      expect(isRenderable(make({ source: '   ' }))).toBe(false);
    });

    it('rejects junk', () => {
      for (const bad of [null, undefined, 'x', 42, []]) expect(isRenderable(bad)).toBe(false);
    });

    it('filters a mixed array down to what can be shown', () => {
      const list = [make(), make({ year: null }), make({ source: '' }), make({ rank: 5 })];
      expect(renderableAccolades(list)).toHaveLength(2);
    });

    it('returns empty for a non-array', () => {
      expect(renderableAccolades(null)).toEqual([]);
      expect(renderableAccolades({})).toEqual([]);
    });
  });

  describe('tierFor — data driven, never hand-tagged', () => {
    it('gold at score >= 900 regardless of kind', () => {
      expect(tierFor(make({ score: 900 }))).toBe('acc--top');
      expect(tierFor(make({ score: 1128 }))).toBe('acc--top');
      expect(tierFor(make({ score: 950, kind: 'nominee' }))).toBe('acc--top');
    });

    it('just below gold falls back to kind', () => {
      expect(tierFor(make({ score: 899, kind: 'ranked' }))).toBe('acc--rank');
      expect(tierFor(make({ score: 899, kind: 'winner' }))).toBe('acc--win');
      expect(tierFor(make({ score: 899, kind: 'nominee' }))).toBe('acc--soft');
      expect(tierFor(make({ score: 899, kind: 'listed' }))).toBe('acc--soft');
    });
  });

  describe('valueLabel', () => {
    it('ranked shows number and year', () => {
      expect(valueLabel(make({ rank: 8, year: 2025 }))).toBe('No. 8 · 2025');
    });

    it('ranked without a rank falls back to the year alone', () => {
      expect(valueLabel(make({ rank: null }))).toBe('2025');
    });

    it('winner uses the title when there is one', () => {
      expect(valueLabel(make({ kind: 'winner', title: 'Best Bar', year: 2026 })))
        .toBe('Best Bar · 2026');
      expect(valueLabel(make({ kind: 'winner', title: null, year: 2026 })))
        .toBe('Winner · 2026');
    });

    it('nominee', () => {
      expect(valueLabel(make({ kind: 'nominee', year: 2024 }))).toBe('Nominee · 2024');
    });

    it('listed omits the year even though the entry carries one', () => {
      expect(valueLabel(make({ kind: 'listed', title: 'Discovery' }))).toBe('Discovery');
      expect(valueLabel(make({ kind: 'listed', title: null }))).toBe('Listed');
    });
  });

  describe('orgLabel', () => {
    it('is full length by default — the profile has room', () => {
      expect(orgLabel(make())).toBe("World's 50 Best Bars");
    });

    it('shortens known orgs for cards', () => {
      expect(orgLabel(make(), { short: true })).toBe("World's 50 Best");
      expect(orgLabel(make({ org: "North America's 50 Best Bars" }), { short: true }))
        .toBe('NA 50 Best');
    });

    it('leaves an unknown org alone rather than truncating blindly', () => {
      expect(orgLabel(make({ org: 'Some Local Guide' }), { short: true })).toBe('Some Local Guide');
    });
  });

  describe('badgesFor', () => {
    const many = [
      make({ org_key: 'w50b', score: 1000 }),
      make({ org_key: 'a50b', score: 800 }),
      make({ org_key: 'e50b', score: 700 }),
      make({ org_key: 'na50b', score: 600 }),
    ];

    it('caps at the limit and reports the overflow', () => {
      const { badges, overflow } = badgesFor(many, { limit: 3 });
      expect(badges).toHaveLength(3);
      expect(overflow).toBe(1);
    });

    it('keeps the given order — the array arrives sorted by score', () => {
      const { badges } = badgesFor(many, { limit: 4 });
      expect(badges[0].tier).toBe('acc--top');
      expect(badges[1].tier).toBe('acc--rank');
    });

    it('counts overflow from renderable entries only', () => {
      // The dropped entry must not be promised by a "+1 more" chip.
      const { badges, overflow } = badgesFor([...many.slice(0, 3), make({ year: null })], {
        limit: 3,
      });
      expect(badges).toHaveLength(3);
      expect(overflow).toBe(0);
    });

    it('returns nothing for a bar with no accolades — no empty state', () => {
      expect(badgesFor(null, { limit: 3 })).toEqual({ badges: [], overflow: 0 });
      expect(badgesFor([], { limit: 3 })).toEqual({ badges: [], overflow: 0 });
    });

    it('keeps the source for auditability', () => {
      const { badges } = badgesFor([make()], { limit: 1 });
      expect(badges[0].source).toBe(base.source);
    });
  });

  describe('awardStrings', () => {
    it('renders award text for schema.org/award', () => {
      expect(awardStrings([make({ rank: 8 })])).toEqual([
        "World's 50 Best Bars — No. 8, 2025",
      ]);
    });

    it('excludes entries that could not be substantiated', () => {
      expect(awardStrings([make(), make({ source: null })])).toHaveLength(1);
    });
  });
});
