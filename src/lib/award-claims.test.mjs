import { describe, it, expect } from 'vitest';
import { checkAwardClaims, AWARD_CLAIM_EXEMPT } from './award-claims.mjs';

const rec = (org_key, year, extra = {}) => ({ org_key, year, kind: 'ranked', rank: null, title: null, ...extra });

describe('checkAwardClaims', () => {
  it('passes a claim whose program and year both have a record', () => {
    const bar = { slug: 'x', description: 'It reached No.26 on the World’s 50 Best Bars in 2022.', accolades: [rec('w50b', 2022, { rank: 26 })] };
    expect(checkAwardClaims(bar)).toEqual([]);
  });

  it('REGRESSION Polite Provisions: a real award with the wrong year is a year mismatch', () => {
    // The description said 2025. The win was 2014. Caught by the task 102 audit.
    const bar = { slug: 'polite-provisions', description: 'It won Best American High Volume Cocktail Bar at the 2025 Spirited Awards.', accolades: [rec('totc', 2014, { kind: 'winner', title: 'Best American High Volume Cocktail Bar' })] };
    const p = checkAwardClaims(bar);
    expect(p).toHaveLength(1);
    expect(p[0]).toMatchObject({ kind: 'year-mismatch', year: 2025, recordYears: [2014] });
  });

  it('REGRESSION Young Blood: naming a program with no record at all', () => {
    const bar = { slug: 'young-blood', description: "It earned a position on North America's 50 Best Bars in 2023.", accolades: null };
    const p = checkAwardClaims(bar);
    expect(p).toHaveLength(1);
    expect(p[0]).toMatchObject({ kind: 'no-record', program: "North America's 50 Best" });
  });

  it('REGRESSION Bar Mood: "every year since" is checked year by year against the records', () => {
    const bar = { slug: 'bar-mood', description: "On Asia's 50 Best every year since 2019 (No.37 in 2024).", accolades: [rec('a50b', 2024, { rank: 37 })] };
    const p = checkAwardClaims(bar);
    expect(p.map(x => x.year)).toEqual([2019]);
  });

  it('resolves a regional list to its own key, not to the world list', () => {
    const bar = { slug: 'x', description: "No.11 on Asia's 50 Best Bars 2026.", accolades: [rec('w50b', 2026, { rank: 11 })] };
    expect(checkAwardClaims(bar)[0]).toMatchObject({ kind: 'no-record', program: "Asia's 50 Best" });
  });

  it('accepts a generic "World\'s 50 Best" mention against any list in the family', () => {
    const bar = { slug: 'x', description: "A World's 50 Best fixture since 2019.", accolades: [rec('e50b', 2019, { rank: 3 })] };
    expect(checkAwardClaims(bar)).toEqual([]);
  });

  it('ignores Discovery, the Restaurants list and person awards: they are not awards of the bar', () => {
    for (const d of [
      'The bar appears in the World’s 50 Best Discovery guide.',
      "Beneath KOL, ranked No.49 in the World's 50 Best Restaurants 2025.",
      'Bannie Kang, the 2021 Bartenders’ Bartender Award winner, runs the room.',
      'It collected the World’s 50 Best Bar Design Award in 2025.',
    ]) {
      expect(checkAwardClaims({ slug: 'x', description: d, accolades: null })).toEqual([]);
    }
  });

  it('does not treat an opening year in an award sentence as an award year', () => {
    const bar = { slug: 'x', description: "No.11 on Asia's 50 Best 2026, Modernhaus opened in May 2024 above a French restaurant.", accolades: [rec('a50b', 2026, { rank: 11 })] };
    expect(checkAwardClaims(bar)).toEqual([]);
  });

  it('checks every year in a sentence that names two programs against the union of their records', () => {
    const bar = { slug: 'x', description: "No.22 on the World's 50 Best Bars 2025 and No.21 in Europe's 50 Best 2026.", accolades: [rec('w50b', 2025, { rank: 22 }), rec('e50b', 2026, { rank: 21 })] };
    expect(checkAwardClaims(bar)).toEqual([]);
  });

  it('lets an exempt slug name a program about somebody else, and records why', () => {
    const bar = { slug: 'kyara', description: "The duo behind Tayēr + Elementary, No. 5 on the World's 50 Best Bars, opened it in 2025.", accolades: null };
    expect(checkAwardClaims(bar)).toHaveLength(1);
    expect(checkAwardClaims(bar, { exempt: AWARD_CLAIM_EXEMPT })).toEqual([]);
    expect(AWARD_CLAIM_EXEMPT.kyara).toMatch(/Tayēr/);
  });

  it('a sentence with no program is never a problem, whatever years it holds', () => {
    const bar = { slug: 'x', description: 'Opened in 2014, rebuilt in 2019, still pouring in 2026.', accolades: null };
    expect(checkAwardClaims(bar)).toEqual([]);
  });
});
