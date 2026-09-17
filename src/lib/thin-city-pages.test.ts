import { describe, it, expect } from 'vitest';
import { isIndexableCity, MIN_INDEXABLE_CITY_BARS, MIN_CITY_BARS } from './city-thresholds';
import { buildCityEntries } from './city-keys';

describe('thin city pages', () => {
  it('noindexes a city below the threshold and indexes one at it', () => {
    expect(isIndexableCity(0)).toBe(false);
    expect(isIndexableCity(1)).toBe(false);
    expect(isIndexableCity(MIN_INDEXABLE_CITY_BARS - 1)).toBe(false);
    expect(isIndexableCity(MIN_INDEXABLE_CITY_BARS)).toBe(true);
    expect(isIndexableCity(MIN_INDEXABLE_CITY_BARS + 40)).toBe(true);
  });

  it('flips back on its own when a city fills, with nothing to edit', () => {
    const rows = (n: number) =>
      Array.from({ length: n }, () => ({ city: 'Warsaw', country: 'Poland', state: null }));
    const before = buildCityEntries(rows(MIN_INDEXABLE_CITY_BARS - 1));
    const after = buildCityEntries(rows(MIN_INDEXABLE_CITY_BARS));
    expect(isIndexableCity(before[0].count)).toBe(false);
    expect(isIndexableCity(after[0].count)).toBe(true);
  });

  it('is looser than the /best-bars/[city] gate, which 404s instead', () => {
    // A city of four gets a followable, noindexed directory page and no
    // best-bars page at all. The two thresholds are deliberately different.
    expect(MIN_INDEXABLE_CITY_BARS).toBeLessThan(MIN_CITY_BARS);
  });
});
