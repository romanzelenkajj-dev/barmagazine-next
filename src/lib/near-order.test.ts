import { describe, it, expect } from 'vitest';
import { nearBand, compareBandAndPrecision, NEAR_BANDS_KM } from './near-order';

/** Sort a small set by the rule, returning names, so the cases read as lists. */
const order = (bars: { name: string; km: number; approx?: boolean }[]) =>
  [...bars]
    .sort((a, b) => {
      const d = compareBandAndPrecision(a.km, !!a.approx, b.km, !!b.approx);
      if (d !== 0) return d;
      return a.km - b.km;
    })
    .map(b => b.name);

describe('nearBand', () => {
  it('bands by how you would get there, not by round numbers', () => {
    expect(nearBand(0)).toBe(0);
    expect(nearBand(5)).toBe(0);
    expect(nearBand(5.1)).toBe(1);
    expect(nearBand(15)).toBe(1);
    expect(nearBand(40)).toBe(2);
    expect(nearBand(41)).toBe(NEAR_BANDS_KM.length);
    expect(nearBand(9999)).toBe(NEAR_BANDS_KM.length);
  });
});

describe('a city-centre row is ranked by its city, never ahead of a measurable bar', () => {
  it('lands directly after the measurable bars in its own band', () => {
    // The Bangkok case, which is what the browser shows: measurable bars with
    // distances, then the approximate ones, then the next band.
    expect(order([
      { name: 'Teens of Thailand', km: 2.0, approx: true },
      { name: 'Tep Bar', km: 2.0, approx: true },
      { name: 'Aqua Bar', km: 0.4 },
      { name: 'Vesper', km: 2.1 },
      { name: 'Dry Wave', km: 5.4 },
    ])).toEqual(['Aqua Bar', 'Vesper', 'Teens of Thailand', 'Tep Bar', 'Dry Wave']);
  });

  it('does NOT put it behind another continent, which was the bug', () => {
    // Before the fix an approximate row sorted past every band, so a Melbourne
    // bar 7,000km away outranked a Bangkok bar for a visitor in Bangkok.
    expect(order([
      { name: 'Melbourne bar', km: 7000 },
      { name: 'Teens of Thailand', km: 2.0, approx: true },
    ])).toEqual(['Teens of Thailand', 'Melbourne bar']);
  });

  describe('edge cases that do not exist in the data yet', () => {
    it('a visitor whose only nearby bars are approximate still gets them first', () => {
      // Every bar in reach is a city-centre row. They must lead, not be
      // buried under a measurable bar in the next city.
      expect(order([
        { name: 'far measurable', km: 120 },
        { name: 'local approx A', km: 1.0, approx: true },
        { name: 'local approx B', km: 1.0, approx: true },
      ])).toEqual(['local approx A', 'local approx B', 'far measurable']);
    });

    it('an approximate row in a NEARBY city does not outrank a measurable bar in the visitor\'s own city', () => {
      // Both inside the 5km band: the measurable one wins on precision, even
      // though the approximate one is nominally closer.
      expect(order([
        { name: 'next town, approximate', km: 3.0, approx: true },
        { name: 'my own city, measurable', km: 4.5 },
      ])).toEqual(['my own city, measurable', 'next town, approximate']);
    });

    it('but a genuinely nearer CITY still wins, because that is real information', () => {
      // 2km vs 30km is two bands apart. The approximate row is in a closer
      // city and saying so is correct; precision only breaks ties inside a
      // band, it does not overrule being somewhere else entirely.
      expect(order([
        { name: 'this city, approximate', km: 2.0, approx: true },
        { name: 'a trip out, measurable', km: 30 },
      ])).toEqual(['this city, approximate', 'a trip out, measurable']);
    });

    it('ties between two approximate rows fall through to the caller', () => {
      expect(compareBandAndPrecision(2, true, 3, true)).toBe(0);
      expect(compareBandAndPrecision(2, false, 3, false)).toBe(0);
    });
  });
});
