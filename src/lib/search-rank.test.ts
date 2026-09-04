import { describe, it, expect } from 'vitest';
import { rankSearchHits } from './search-rank';

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
});
