import { describe, it, expect } from 'vitest';
import { rankSearchHits, matchesAllWords } from './search-rank';

const bar = (name: string, city: string) => ({ name, city });

describe('rankSearchHits', () => {
  it('surfaces Origin Bar for "Ori" above alphabetical substring hits', () => {
    // The real bug: name-sorted substring matches filled the 7-slot dropdown
    // before the name-prefix match ever appeared.
    const hits = [
      bar('Balmori', 'Mexico City'),
      bar('Gorilla Bar', 'Munster'),
      bar('Mori Bar', 'Tokyo'),
      bar('The Victoria', 'London'),
      bar('Origin Bar', 'Singapore'),
    ];
    const ranked = rankSearchHits('Ori', hits);
    expect(ranked[0].name).toBe('Origin Bar');
  });

  it('ranks word-start above contains, contains above city-only', () => {
    const hits = [
      bar('Bar Torino', 'Milan'), // word "Torino" does not start with "ori" -> contains
      bar('Victoria Lounge', 'Oribi Gorge'), // city-only? name contains no 'ori'... city does
      bar('The Oriole', 'Chicago'), // word starts with ori
      bar('Oriole', 'London'), // name starts with ori
    ];
    const ranked = rankSearchHits('ori', hits);
    expect(ranked.map(h => h.name)).toEqual(['Oriole', 'The Oriole', 'Bar Torino', 'Victoria Lounge']);
  });

  it('is accent-insensitive both ways', () => {
    const hits = [bar('Zulu', 'Cape Town'), bar('Factoría de Sabores', 'Havana')];
    expect(rankSearchHits('factoria', hits)[0].name).toBe('Factoría de Sabores');
  });

  it('keeps alphabetical order inside a tier (stable sort)', () => {
    const hits = [bar('Origin Alpha', 'X'), bar('Origin Beta', 'Y')];
    expect(rankSearchHits('origin', hits).map(h => h.name)).toEqual(['Origin Alpha', 'Origin Beta']);
  });

  it('city matches still find Victoria bars', () => {
    const hits = [bar('Quiet Corner', 'Victoria'), bar('Vic Ale House', 'London')];
    const ranked = rankSearchHits('Vic', hits);
    // name word-start beats city match, but the city match stays present
    expect(ranked.map(h => h.name)).toEqual(['Vic Ale House', 'Quiet Corner']);
  });

  describe('words in any order', () => {
    it('ranks the bar holding both words above one holding neither', () => {
      // The Häktet case: both words are in the name, in the other order.
      const hits = [bar('Aalto Bar', 'Helsinki'), bar('Vänster at Häktet', 'Stockholm')];
      expect(rankSearchHits('haktet vanster', hits)[0].name).toBe('Vänster at Häktet');
    });

    it('does not let a weak word ride on a strong one', () => {
      // Both answer "gold", only one also answers "edition". The tier is the
      // WORST word, so the complete match leads.
      const hits = [bar('Gold Bar', 'Dubai'), bar('Gold Bar at EDITION', 'Tokyo')];
      expect(rankSearchHits('gold edition', hits)[0].name).toBe('Gold Bar at EDITION');
    });

    it('still prefers the in-order reading when it earns a better tier', () => {
      // "bar n" is a literal prefix of Bar Nouveau, which is tier 0 and must
      // beat a name that merely contains both words apart.
      const hits = [bar('The Nightjar Bar', 'London'), bar('Bar Nouveau', 'Paris')];
      expect(rankSearchHits('bar n', hits)[0].name).toBe('Bar Nouveau');
    });

    it('matches the client filter to the server filter', () => {
      // The bug this exists to stop: the grid read "0 bars found" for
      // "tokyo edition" while the typeahead above it offered the right bar,
      // because the client re-filtered on the whole string.
      const terms = ['Gold Bar at EDITION', 'Japan', 'Tokyo'];
      expect(matchesAllWords('tokyo edition', terms)).toBe(true);
      expect(matchesAllWords('edition gold', terms)).toBe(true);
      // All words required: one miss rejects the row.
      expect(matchesAllWords('tokyo edition speakeasy', terms)).toBe(false);
      // An empty query filters nothing out.
      expect(matchesAllWords('', terms)).toBe(true);
      // Accent-insensitive on both sides, and null entries are tolerated.
      expect(matchesAllWords('vanster haktet', ['Vänster at Häktet', null])).toBe(true);
    });

    it('is unchanged for a single-word query', () => {
      // The two readings are the same number for one word. This pins that the
      // multi-word path cannot have disturbed the original tiers.
      const hits = [
        bar('Balmori', 'Mexico City'),
        bar('Mori Bar', 'Tokyo'),
        bar('Origin Bar', 'Singapore'),
      ];
      expect(rankSearchHits('Ori', hits)[0].name).toBe('Origin Bar');
    });
  });
});
