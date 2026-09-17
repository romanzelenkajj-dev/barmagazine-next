import { describe, it, expect } from 'vitest';
import { meritBand } from './city-levels';
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
