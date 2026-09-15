import { describe, it, expect } from 'vitest';
import { accoladeSentence, accoladeClause, LATEST_EDITION } from './accolade-sentences';
import type { Accolade } from './accolades';

const src = 'https://example.com/list';
const mk = (over: Partial<Accolade>): Accolade =>
  ({ org: "World's 50 Best Bars", org_key: 'w50b', kind: 'ranked', rank: null, year: 2025, score: 500, title: null, source: src, ...over });
const na = (over: Partial<Accolade>) => mk({ org: "North America's 50 Best Bars", org_key: 'na50b', ...over });
const totc = (over: Partial<Accolade>) => mk({ org: 'Tales of the Cocktail Spirited Awards', org_key: 'totc', kind: 'nominee', ...over });
const pin = (over: Partial<Accolade>) => mk({ org: 'The Pinnacle Guide', org_key: 'pinnacle', kind: 'winner', ...over });

describe('accoladeSentence: one sentence, the bar name first, clauses in tile order', () => {
  it('one clause', () => {
    expect(accoladeSentence('Little Rituals', [
      mk({ org: 'James Beard Awards', org_key: 'jbf', kind: 'nominee', year: 2025, score: 200, title: 'Outstanding Bar (Semifinalist)' }),
    ])).toBe('Little Rituals was a James Beard Award semifinalist for Outstanding Bar in 2025.');
  });

  it('two clauses join with "and", in tile (score) order (Bitter & Twisted)', () => {
    // The stored scores decide the order, exactly as they decide the tiles:
    // here the 2022 listing (600) outscores the 2 Pins (546).
    expect(accoladeSentence('Bitter & Twisted Cocktail Parlour', [
      na({ year: 2022, rank: null, score: 600 }),
      pin({ year: 2024, title: '2 Pins', score: 546 }),
    ])).toBe("Bitter & Twisted Cocktail Parlour was listed on North America's 50 Best Bars in 2022 and holds 2 Pins from The Pinnacle Guide (2024).");
    expect(accoladeSentence('Bitter & Twisted Cocktail Parlour', [
      na({ year: 2022, rank: null, score: 472 }),
      pin({ year: 2024, title: '2 Pins', score: 546 }),
    ])).toBe("Bitter & Twisted Cocktail Parlour holds 2 Pins from The Pinnacle Guide (2024) and was listed on North America's 50 Best Bars in 2022.");
  });

  it('three clauses take the serial comma (Daisy with a Pin)', () => {
    expect(accoladeSentence('Daisy Margarita Bar', [
      na({ year: 2026, rank: 44, score: 728 }),
      totc({ year: 2026, score: 590, title: 'Best New U.S. Cocktail Bar (Top 10 Nominee)' }),
      pin({ year: 2025, kind: 'nominee', title: '1 Pin', score: 528 }),
    ])).toBe("Daisy Margarita Bar ranks No. 44 on North America's 50 Best Bars 2026, was a Top 10 nominee for Best New U.S. Cocktail Bar at the 2026 Spirited Awards, and holds 1 Pin from The Pinnacle Guide (2025).");
  });

  it('reads the tiles\' set: score order, one per org and year, at most three', () => {
    const s = accoladeSentence('Tlecān', [
      mk({ year: 2025, rank: 23, score: 1045 }),
      na({ year: 2026, rank: 5, score: 884 }),
      totc({ kind: 'winner', year: 2026, score: 810, title: "World's Best Spirits Selection" }),
      mk({ org: 'Shaker Awards', org_key: 'shaker', year: 2025, rank: 2, score: 582, title: 'Top 30 Bares de México' }),
    ]);
    expect(s).toBe("Tlecān ranks No. 23 on World's 50 Best Bars 2025, ranks No. 5 on North America's 50 Best Bars 2026, and won World's Best Spirits Selection at the 2026 Spirited Awards.");
    expect(s).not.toContain('Shaker');
  });

  it('is empty when the tiles render nothing', () => {
    expect(accoladeSentence('X', [])).toBe('');
    expect(accoladeSentence('X', [mk({ org_key: 'eater', org: 'Eater', year: 2024 })])).toBe('');
    expect(accoladeSentence('X', null)).toBe('');
  });

  it('uses no em dash', () => {
    expect(accoladeSentence('X', [totc({ kind: 'winner', year: 2026, title: 'Timeless U.S. Award' })])).not.toContain('—');
  });
});

describe('accoladeClause per org', () => {
  it('50 Best: ranks on the current edition, ranked on an older one, listed without a rank', () => {
    expect(accoladeClause(na({ year: LATEST_EDITION.na50b, rank: 44 }))).toBe(`ranks No. 44 on North America's 50 Best Bars ${LATEST_EDITION.na50b}`);
    expect(accoladeClause(na({ year: 2024, rank: 44 }))).toBe("ranked No. 44 on North America's 50 Best Bars 2024");
    expect(accoladeClause(na({ year: 2022, rank: null }))).toBe("was listed on North America's 50 Best Bars in 2022");
    expect(accoladeClause(mk({ year: 2021, rank: 21 }))).toBe("ranked No. 21 on World's 50 Best Bars 2021");
  });

  it('Spirited Awards: winner, Top 4, Top 10, regional honoree', () => {
    expect(accoladeClause(totc({ kind: 'winner', year: 2026, title: 'Best New International Cocktail Bar' }))).toBe('won Best New International Cocktail Bar at the 2026 Spirited Awards');
    expect(accoladeClause(totc({ kind: 'winner', year: 2026, title: 'Timeless U.S. Award' }))).toBe('won the Timeless U.S. Award at the 2026 Spirited Awards');
    expect(accoladeClause(totc({ year: 2026, title: 'Best U.S. Cocktail Bar (Top 4)' }))).toBe('was a Top 4 finalist for Best U.S. Cocktail Bar at the 2026 Spirited Awards');
    expect(accoladeClause(totc({ year: 2026, title: 'Best U.S. Hotel Bar (Top 10 Nominee)' }))).toBe('was a Top 10 nominee for Best U.S. Hotel Bar at the 2026 Spirited Awards');
    expect(accoladeClause(totc({ year: 2026, title: 'Best U.S. Bar Team (Regional Honoree)' }))).toBe('was a regional honoree for Best U.S. Bar Team at the 2026 Spirited Awards');
  });

  it('James Beard: winner, finalist, semifinalist', () => {
    const jbf = (over: Partial<Accolade>) => mk({ org: 'James Beard Awards', org_key: 'jbf', kind: 'nominee', ...over });
    expect(accoladeClause(jbf({ kind: 'winner', year: 2026, title: 'Outstanding Bar' }))).toBe('won the James Beard Award for Outstanding Bar in 2026');
    expect(accoladeClause(jbf({ year: 2025, title: 'Outstanding Bar' }))).toBe('was a James Beard Award finalist for Outstanding Bar in 2025');
    expect(accoladeClause(jbf({ year: 2024, title: 'Outstanding Bar (Semifinalist)' }))).toBe('was a James Beard Award semifinalist for Outstanding Bar in 2024');
  });

  it("Bartenders' Choice and Shaker: won or nominated; Shaker placings rank on their list", () => {
    const bca = (over: Partial<Accolade>) => mk({ org: "Bartenders' Choice Awards", org_key: 'bca', ...over });
    expect(accoladeClause(bca({ kind: 'winner', year: 2026, title: 'Best Cocktail Bar for Serbia' }))).toBe("won Best Cocktail Bar for Serbia at the 2026 Bartenders' Choice Awards");
    expect(accoladeClause(bca({ kind: 'nominee', year: 2026, title: 'Best Bar Team' }))).toBe("was nominated for Best Bar Team at the 2026 Bartenders' Choice Awards");
    const shaker = (over: Partial<Accolade>) => mk({ org: 'Shaker Awards', org_key: 'shaker', ...over });
    expect(accoladeClause(shaker({ year: LATEST_EDITION.shaker, rank: 2, title: 'Top 30 Bares de México' }))).toBe(`ranks No. 2 on the ${LATEST_EDITION.shaker} Shaker Awards Top 30 Bares de México`);
    expect(accoladeClause(shaker({ year: 2023, rank: 20, title: 'Top 30 Bares de México' }))).toBe('ranked No. 20 on the 2023 Shaker Awards Top 30 Bares de México');
    expect(accoladeClause(shaker({ kind: 'winner', year: 2025, title: 'Mejor Bar de Hotel' }))).toBe('won Mejor Bar de Hotel at the 2025 Shaker Awards');
  });

  it('30 Best Bars India: ranks, ranked, listed, category win', () => {
    const b = (over: Partial<Accolade>) => mk({ org: '30 Best Bars India', org_key: '30bbi', ...over });
    expect(accoladeClause(b({ year: LATEST_EDITION['30bbi'], rank: 7 }))).toBe(`ranks No. 7 on 30 Best Bars India ${LATEST_EDITION['30bbi']}`);
    expect(accoladeClause(b({ year: 2023, rank: 2 }))).toBe('ranked No. 2 on 30 Best Bars India 2023');
    expect(accoladeClause(b({ kind: 'listed', year: 2022 }))).toBe('was listed on 30 Best Bars India in 2022');
    expect(accoladeClause(b({ kind: 'winner', year: 2023, title: 'Best Bar Team' }))).toBe('won Best Bar Team at the 2023 30 Best Bars India');
  });

  it('Pinnacle: holds N Pins, singular for one', () => {
    expect(accoladeClause(pin({ year: 2024, title: '2 Pins' }))).toBe('holds 2 Pins from The Pinnacle Guide (2024)');
    expect(accoladeClause(pin({ year: 2025, kind: 'nominee', title: '1 Pin' }))).toBe('holds 1 Pin from The Pinnacle Guide (2025)');
  });
});
