import { describe, it, expect } from 'vitest';
import { displayOrg, awardStrings, tilesFor } from './accolades';
import { accoladeClause } from './accolade-sentences';
import { titleAccolade } from './bar-seo-meta';

const w = (year: number, rank: number) => ({ org: "World's 50 Best Bars", org_key: 'w50b', kind: 'ranked', rank, year, score: 900, title: null, source: 'https://www.theworlds50best.com/bars/list/51-100' });

describe('displayOrg (task 121: The 50 Best Bars from 2026)', () => {
  it('renames the world list from 2026 and leaves earlier years and other lists alone', () => {
    expect(displayOrg(w(2026, 52))).toBe('The 50 Best Bars');
    expect(displayOrg(w(2025, 27))).toBe("World's 50 Best Bars");
    expect(displayOrg({ org: "Asia's 50 Best Bars", org_key: 'a50b', year: 2026 })).toBe("Asia's 50 Best Bars");
  });

  it('flows into the award strings, the prose, the tile and the title', () => {
    expect(awardStrings([w(2026, 52)])).toEqual(['The 50 Best Bars 2026, No. 52']);
    expect(awardStrings([w(2025, 27)])).toEqual(["World's 50 Best Bars 2025, No. 27"]);
    expect(accoladeClause(w(2026, 52) as never)).toBe('No. 52 on The 50 Best Bars 2026');
    expect(tilesFor([w(2026, 52)])[0]).toMatchObject({ region: 'THE', main: '50 BEST', org: 'The 50 Best Bars' });
    expect(tilesFor([w(2025, 27)])[0]).toMatchObject({ region: "WORLD'S", org: "World's 50 Best Bars" });
    expect(titleAccolade([w(2026, 52)])).toBe('No. 52 on The 50 Best Bars 2026');
    expect(titleAccolade([w(2025, 27)])).toBe("No. 27 on World's 50 Best 2025");
  });
});
