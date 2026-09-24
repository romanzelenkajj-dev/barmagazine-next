import { describe, it, expect } from 'vitest';
import { credentialsLine, credentialsLineWithName, accoladeClause } from './accolade-sentences';
import type { Accolade } from './accolades';

const src = 'https://example.com/list';
const mk = (over: Partial<Accolade>): Accolade =>
  ({ org: "World's 50 Best Bars", org_key: 'w50b', kind: 'ranked', rank: null, year: 2025, score: 500, title: null, source: src, ...over });
const na = (over: Partial<Accolade>) => mk({ org: "North America's 50 Best Bars", org_key: 'na50b', ...over });
const totc = (over: Partial<Accolade>) => mk({ org: 'Tales of the Cocktail Spirited Awards', org_key: 'totc', kind: 'nominee', ...over });
const pin = (over: Partial<Accolade>) => mk({ org: 'The Pinnacle Guide', org_key: 'pinnacle', kind: 'winner', ...over });
const jbf = (over: Partial<Accolade>) => mk({ org: 'James Beard Awards', org_key: 'jbf', kind: 'nominee', ...over });

describe('credentialsLine: no subject, clauses in tile order, capitalised, one period', () => {
  it('one clause', () => {
    expect(credentialsLine([jbf({ year: 2025, score: 200, title: 'Outstanding Bar (Semifinalist)' })]))
      .toBe('James Beard Award semifinalist for Outstanding Bar in 2025.');
  });

  it('two clauses, "and", first letter capitalised (Bitter & Twisted)', () => {
    expect(credentialsLine([
      na({ year: 2022, rank: null, score: 600 }),
      pin({ year: 2024, title: '2 Pins', score: 546 }),
    ])).toBe("Listed on North America's 50 Best Bars in 2022 and awarded 2 Pins by The Pinnacle Guide in 2024.");
  });

  it('three clauses take the serial comma (Daisy with a Pin)', () => {
    expect(credentialsLine([
      na({ year: 2026, rank: 44, score: 728 }),
      totc({ year: 2026, score: 590, title: 'Best New U.S. Cocktail Bar (Top 10 Nominee)' }),
      pin({ year: 2025, kind: 'nominee', title: '1 Pin', score: 528 }),
    ])).toBe("No. 44 on The 50 Best Bars: Best in North America 2026, Top 10 nominee for Best New U.S. Cocktail Bar at the 2026 Spirited Awards, and awarded 1 Pin by The Pinnacle Guide in 2025.");
  });

  it('two clauses (Daisy as stored)', () => {
    expect(credentialsLine([
      na({ year: 2026, rank: 44, score: 728 }),
      totc({ year: 2026, score: 590, title: 'Best New U.S. Cocktail Bar (Top 10 Nominee)' }),
    ])).toBe("No. 44 on The 50 Best Bars: Best in North America 2026 and Top 10 nominee for Best New U.S. Cocktail Bar at the 2026 Spirited Awards.");
  });

  it("reads the tiles' set: score order, one per org and year, at most three (Tlecān)", () => {
    const s = credentialsLine([
      mk({ year: 2025, rank: 23, score: 1045 }),
      na({ year: 2026, rank: 5, score: 884 }),
      totc({ kind: 'winner', year: 2026, score: 810, title: "World's Best Spirits Selection" }),
      mk({ org: 'Shaker Awards', org_key: 'shaker', year: 2025, rank: 2, score: 582, title: 'Top 30 Bares de México' }),
    ]);
    expect(s).toBe("No. 23 on World's 50 Best Bars 2025, No. 5 on The 50 Best Bars: Best in North America 2026, and winner of World's Best Spirits Selection at the 2026 Spirited Awards.");
    expect(s).not.toContain('Shaker');
  });

  it('is empty when the tiles render nothing, and the off-page form prefixes the name', () => {
    expect(credentialsLine([])).toBe('');
    expect(credentialsLine(null)).toBe('');
    expect(credentialsLineWithName('X', [])).toBe('');
    expect(credentialsLineWithName('Bitter & Twisted Cocktail Parlour', [na({ year: 2022, rank: null })]))
      .toBe("Bitter & Twisted Cocktail Parlour: Listed on North America's 50 Best Bars in 2022.");
  });

  it('uses no em dash', () => {
    expect(credentialsLine([totc({ kind: 'winner', year: 2026, title: 'Timeless U.S. Award' })])).not.toContain('—');
  });
});

describe('accoladeClause per org (lowercase, no subject)', () => {
  it('50 Best: No. N on the list and year, listed without a rank', () => {
    expect(accoladeClause(na({ year: 2026, rank: 44 }))).toBe("No. 44 on The 50 Best Bars: Best in North America 2026");
    expect(accoladeClause(mk({ org: "Asia's 50 Best Bars", org_key: 'a50b', year: 2024, rank: 12 }))).toBe("No. 12 on Asia's 50 Best Bars 2024");
    expect(accoladeClause(na({ year: 2022, rank: null }))).toBe("listed on North America's 50 Best Bars in 2022");
  });

  it('Spirited Awards: winner of, Top 4 finalist for, Top 10 nominee for, regional honoree for', () => {
    expect(accoladeClause(totc({ kind: 'winner', year: 2026, title: 'Best New International Cocktail Bar' }))).toBe('winner of Best New International Cocktail Bar at the 2026 Spirited Awards');
    expect(accoladeClause(totc({ kind: 'winner', year: 2026, title: 'Timeless U.S. Award' }))).toBe('winner of the Timeless U.S. Award at the 2026 Spirited Awards');
    expect(accoladeClause(totc({ year: 2026, title: 'Best U.S. Cocktail Bar (Top 4)' }))).toBe('Top 4 finalist for Best U.S. Cocktail Bar at the 2026 Spirited Awards');
    expect(accoladeClause(totc({ year: 2026, title: 'Best U.S. Hotel Bar (Top 10 Nominee)' }))).toBe('Top 10 nominee for Best U.S. Hotel Bar at the 2026 Spirited Awards');
    expect(accoladeClause(totc({ year: 2026, title: 'Best U.S. Bar Team (Regional Honoree)' }))).toBe('regional honoree for Best U.S. Bar Team at the 2026 Spirited Awards');
  });

  it('James Beard: winner, finalist, semifinalist', () => {
    expect(accoladeClause(jbf({ kind: 'winner', year: 2026, title: 'Outstanding Bar' }))).toBe('James Beard Award winner for Outstanding Bar in 2026');
    expect(accoladeClause(jbf({ year: 2025, title: 'Outstanding Bar' }))).toBe('James Beard Award finalist for Outstanding Bar in 2025');
    expect(accoladeClause(jbf({ year: 2024, title: 'Outstanding Bar (Semifinalist)' }))).toBe('James Beard Award semifinalist for Outstanding Bar in 2024');
  });

  it("Bartenders' Choice and Shaker: winner of / nominated for; Shaker placings on their list", () => {
    const bca = (over: Partial<Accolade>) => mk({ org: "Bartenders' Choice Awards", org_key: 'bca', ...over });
    expect(accoladeClause(bca({ kind: 'winner', year: 2026, title: 'Best Cocktail Bar for Serbia' }))).toBe("winner of Best Cocktail Bar for Serbia at the 2026 Bartenders' Choice Awards");
    expect(accoladeClause(bca({ kind: 'nominee', year: 2026, title: 'Best Bar Team' }))).toBe("nominated for Best Bar Team at the 2026 Bartenders' Choice Awards");
    const shaker = (over: Partial<Accolade>) => mk({ org: 'Shaker Awards', org_key: 'shaker', ...over });
    expect(accoladeClause(shaker({ year: 2025, rank: 2, title: 'Top 30 Bares de México' }))).toBe('No. 2 on the 2025 Shaker Awards Top 30 Bares de México');
    expect(accoladeClause(shaker({ kind: 'winner', year: 2025, title: 'Mejor Bar de Hotel' }))).toBe('winner of Mejor Bar de Hotel at the 2025 Shaker Awards');
  });

  it('30 Best Bars India: No. N, listed, category win', () => {
    const b = (over: Partial<Accolade>) => mk({ org: '30 Best Bars India', org_key: '30bbi', ...over });
    expect(accoladeClause(b({ year: 2025, rank: 7 }))).toBe('No. 7 on 30 Best Bars India 2025');
    expect(accoladeClause(b({ kind: 'listed', year: 2024 }))).toBe('listed on 30 Best Bars India in 2024');
    expect(accoladeClause(b({ kind: 'winner', year: 2023, title: 'Best Bar Team' }))).toBe('winner of Best Bar Team at the 2023 30 Best Bars India');
  });

  it('Pinnacle: awarded N Pins by The Pinnacle Guide in year, singular for one', () => {
    expect(accoladeClause(pin({ year: 2024, title: '2 Pins' }))).toBe('awarded 2 Pins by The Pinnacle Guide in 2024');
    expect(accoladeClause(pin({ year: 2025, kind: 'nominee', title: '1 Pin' }))).toBe('awarded 1 Pin by The Pinnacle Guide in 2025');
  });
});
