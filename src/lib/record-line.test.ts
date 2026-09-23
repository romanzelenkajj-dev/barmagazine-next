import { describe, it, expect } from 'vitest';
import { recordLine } from './record-line';

const w50b = (rank: number) => ({ org: "World's 50 Best Bars", org_key: 'w50b', kind: 'ranked', rank, year: 2025, score: 900, title: null, source: 'x' });
const a50b = (rank: number) => ({ org: "Asia's 50 Best Bars", org_key: 'a50b', kind: 'ranked', rank, year: 2026, score: 700, title: null, source: 'x' });
const totc = (kind: 'winner' | 'nominee') => ({ org: 'Spirited Awards', org_key: 'totc', kind, rank: null, year: 2026, score: 600, title: 'Best International Cocktail Bar', source: 'x' });
const jbf = (kind: 'winner' | 'nominee') => ({ org: 'James Beard Foundation', org_key: 'jbf', kind, rank: null, year: 2026, score: 500, title: 'Outstanding Bar', source: 'x' });
const pin = () => ({ org: 'The Pinnacle Guide', org_key: 'pinnacle', kind: 'winner', rank: null, year: 2026, score: 400, title: '2 PINS', source: 'x' });

describe('recordLine', () => {
  it('names no bar and lists only non-zero categories', () => {
    const bars = [
      { name: 'Line', accolades: [w50b(30), totc('nominee')] },
      { name: 'Baba au Rum', accolades: [w50b(60)] },
      { name: 'Plain', accolades: [] },
      { name: 'Plain 2', accolades: null },
      { name: 'Plain 3' },
      { name: 'Plain 4', accolades: [] },
    ];
    expect(recordLine(bars)).toBe("Six bars, chosen on the record: two on World's 50 Best, one Spirited Awards nominee.");
  });

  it('falls back to the verification line when nothing is on the record', () => {
    expect(recordLine([{}, {}, {}, {}, {}], 'speakeasies')).toBe('Five speakeasies, every listing verified by BarMagazine.');
  });

  it('counts a bar once per category and a winner over a nominee', () => {
    const bars = [
      { accolades: [totc('winner'), totc('nominee'), totc('nominee')] },
      { accolades: [totc('nominee'), jbf('winner'), pin()] },
      { accolades: [a50b(5), a50b(9), jbf('nominee')] },
    ];
    expect(recordLine(bars)).toBe(
      "Three bars, chosen on the record: one on Asia's 50 Best, one Spirited Awards winner, one Spirited Awards nominee, one James Beard winner, one James Beard nominee, one with Pinnacle Guide pins."
    );
  });

  it('uses digits past ten and the singular noun for one', () => {
    const bars = Array.from({ length: 12 }, () => ({ accolades: [w50b(10)] }));
    expect(recordLine(bars, 'hotel bars')).toBe("12 hotel bars, chosen on the record: 12 on World's 50 Best.");
    expect(recordLine([{ accolades: [] }], 'pubs')).toBe('One pub, every listing verified by BarMagazine.');
  });
});
