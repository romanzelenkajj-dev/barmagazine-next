import { describe, it, expect } from 'vitest';
import { isSelectiveSource, hasSelectiveSource, strongestSource } from './editorial-sources';

const s = (source: string) => ({ source });

describe('editorial source selectivity', () => {
  it('accepts a guide or award that selects by its own standard', () => {
    for (const n of ['Falstaff Bar Guide 2026 Slovakia', 'Michelin Guide Texas', 'Punch',
                     'Imbibe 75', 'Esquire', 'Speed Rack', 'James Beard Awards, Outstanding Bar semifinalists',
                     'Tales of the Cocktail Spirited Awards, regional honorees']) {
      expect(isSelectiveSource(s(n))).toBe(true);
    }
  });

  it('accepts a bounded Top N', () => {
    expect(isSelectiveSource(s('Refresher.sk Top 5 cocktail bars in Bratislava'))).toBe(true);
    expect(isSelectiveSource(s('SME Closer TOP 8 cocktail bars in Bratislava'))).toBe(true);
    expect(isSelectiveSource(s('Weranda Weekend, Top 8 koktajlbarów w Polsce'))).toBe(true);
    expect(isSelectiveSource(s('The Infatuation, The 19 Best Bars In Atlanta'))).toBe(true);
    expect(isSelectiveSource(s('Atlanta Journal-Constitution, 12 essential Atlanta cocktail bars you need to try'))).toBe(true);
    expect(isSelectiveSource(s('Club Oenologique, Bratislava cocktails: four of the best bars to visit'))).toBe(true);
  });

  it('rejects a list so long it is a directory with a headline', () => {
    expect(isSelectiveSource(s('Atlanta Magazine, 57 Best Bars in Atlanta'))).toBe(false);
    expect(isSelectiveSource(s('Dallas Observer, the 50 best bars in Dallas right now'))).toBe(false);
  });

  it('rejects a tourism page, a festival roster and a bare listing', () => {
    expect(isSelectiveSource(s('Go To Warsaw (Warsaw Tourism Office), Sky-high bars and restaurants with a view of Warsaw'))).toBe(false);
    expect(isSelectiveSource(s('Bratislava Region official tourism board POI listing'))).toBe(false);
    expect(isSelectiveSource(s('World Class Cocktail Festival Slovakia 2025 participant list'))).toBe(false);
    expect(isSelectiveSource(s('Warsaw Insider, Going Out venue listing'))).toBe(false);
  });

  it('rejects a broad city map, which is the admission floor not a pick', () => {
    expect(isSelectiveSource(s('Eater Portland'))).toBe(false);
    expect(isSelectiveSource(s('Eater Dallas'))).toBe(false);
    expect(isSelectiveSource(s('Time Out Atlanta, The best bars in Atlanta right now'))).toBe(false);
  });

  it('handles nothing, null and a wrong shape without throwing', () => {
    expect(isSelectiveSource(undefined)).toBe(false);
    expect(isSelectiveSource({ source: null })).toBe(false);
    expect(hasSelectiveSource(null)).toBe(false);
    expect(hasSelectiveSource('not an array')).toBe(false);
    expect(strongestSource(null)).toBeNull();
  });

  it('one selective source among broad ones is enough, and is the one named', () => {
    const mixed = [s('Eater Portland'), s('Falstaff Bar Guide 2026 Slovakia')];
    expect(hasSelectiveSource(mixed)).toBe(true);
    expect(strongestSource(mixed)?.source).toContain('Falstaff');
  });
});
