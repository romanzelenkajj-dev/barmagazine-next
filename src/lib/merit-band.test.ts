import { describe, it, expect } from 'vitest';
import { meritBand, bestBarsOrder } from './city-levels';
import type { Bar } from './supabase';

const bar = (over: Partial<Bar>) => ({ name: 'X', accolades: null, ...over } as Bar);
const acc = [{ org: "World's 50 Best Bars", org_key: 'w50b', year: 2025, rank: 3,
               kind: 'ranked', title: null, score: 100, source: 'https://x' }];

describe('merit band', () => {
  it('puts an accolade holder in the top band', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(meritBand(bar({ accolades: acc as any }))).toBe(0);
  });

  it('puts a bar qualified only by a selective source in the middle band', () => {
    expect(meritBand(bar({
      editorial_sources: [{ source: 'Falstaff Bar Guide 2026 Slovakia' }],
    }))).toBe(1);
  });

  it('puts everything else in the bottom band, including a broad source', () => {
    expect(meritBand(bar({}))).toBe(2);
    expect(meritBand(bar({
      editorial_sources: [{ source: 'Bratislava Region official tourism board POI listing' }],
    }))).toBe(2);
  });

  it('a photo cannot move a bar between bands, which is the whole rule', () => {
    const withPhoto = bar({ photos: ['/a.jpg'] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accoladeNoPhoto = bar({ accolades: acc as any, photos: [] });
    expect(meritBand(accoladeNoPhoto)).toBeLessThan(meritBand(withPhoto));
  });
});

describe('bestBarsOrder (task 137)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = (score: number, year = 2025): any => [{ org: "World's 50 Best Bars", org_key: 'w50b', year, rank: 3, kind: 'ranked', title: null, score, source: 'https://x' }];
  const names = (bars: Bar[]) => bestBarsOrder(bars).map(b => b.name);

  it('puts the Top 10 picks first, whatever the others score', () => {
    expect(names([bar({ name: 'Other', accolades: a(900) }), bar({ name: 'Pick', tier: 'top10' })])).toEqual(['Pick', 'Other']);
  });
  it('sorts by total accolade score, highest first', () => {
    const two = [...a(300, 2024), ...a(300, 2025)];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(names([bar({ name: 'One', accolades: a(500) }), bar({ name: 'Two', accolades: two as any })])).toEqual(['Two', 'One']);
  });
  it('breaks a score tie by photo, then the latest year, then the name', () => {
    expect(names([bar({ name: 'A', accolades: a(500) }), bar({ name: 'B', accolades: a(500), photos: ['/p.jpg'] })])).toEqual(['B', 'A']);
    expect(names([bar({ name: 'A', accolades: a(500, 2024) }), bar({ name: 'B', accolades: a(500, 2026) })])).toEqual(['B', 'A']);
    expect(names([bar({ name: 'B', accolades: a(500) }), bar({ name: 'A', accolades: a(500) })])).toEqual(['A', 'B']);
  });
  it('puts bars with no accolade last, photo first, then by name', () => {
    expect(names([bar({ name: 'Zed' }), bar({ name: 'Abe' }), bar({ name: 'Pic', photos: ['/p.jpg'] }), bar({ name: 'Won', accolades: a(10) })]))
      .toEqual(['Won', 'Pic', 'Abe', 'Zed']);
  });
  it('ignores paid tiers', () => {
    expect(names([bar({ name: 'Paid', tier: 'featured' }), bar({ name: 'Won', accolades: a(10) })])).toEqual(['Won', 'Paid']);
  });
});
