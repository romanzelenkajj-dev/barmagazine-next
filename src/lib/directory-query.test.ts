import { describe, it, expect } from 'vitest';
import { readDirectoryQuery, writeDirectoryQuery, EMPTY_QUERY } from './directory-query';

const OPTS = {
  countries: ['Italy', 'Poland', 'United States', 'Côte d’Ivoire'],
  cities: ['Milan', 'Wrocław', 'New York', 'São Paulo'],
  types: ['Cocktail Bar', 'Hotel Bar', 'Speakeasy'],
};

describe('task 132: /bars filters in the query string', () => {
  it('writes readable slugs in a fixed order', () => {
    const qs = writeDirectoryQuery('', { ...EMPTY_QUERY, country: 'Italy', city: 'Milan', type: 'Cocktail Bar' });
    expect(qs).toBe('?country=italy&city=milan&type=cocktail-bar');
  });

  it('round-trips every filter, the search and the map view', () => {
    const state = { search: 'old fashioned', country: 'Poland', city: 'Wrocław', type: 'Hotel Bar', view: 'map' as const };
    const qs = writeDirectoryQuery('', state);
    expect(qs).toBe('?country=poland&city=wroclaw&type=hotel-bar&q=old+fashioned&view=map');
    expect(readDirectoryQuery(qs, OPTS)).toEqual(state);
  });

  it('writes nothing for the unfiltered grid', () => {
    expect(writeDirectoryQuery('', EMPTY_QUERY)).toBe('');
    expect(readDirectoryQuery('', OPTS)).toEqual(EMPTY_QUERY);
  });

  it('keeps keys it does not own, such as near and utm tags', () => {
    const qs = writeDirectoryQuery('?near=me&utm_source=x&city=milan', { ...EMPTY_QUERY, type: 'Speakeasy' });
    expect(qs).toBe('?type=speakeasy&near=me&utm_source=x');
  });

  it('ignores slugs that match no option instead of filtering to nothing', () => {
    expect(readDirectoryQuery('?country=atlantis&type=nightclub', OPTS)).toEqual(EMPTY_QUERY);
  });

  it('accepts accented and differently cased input', () => {
    expect(readDirectoryQuery('?city=S%C3%A3o%20Paulo', OPTS).city).toBe('São Paulo');
    expect(readDirectoryQuery('?city=SAO-PAULO', OPTS).city).toBe('São Paulo');
  });

  it('reads the server searchParams object shape', () => {
    expect(readDirectoryQuery({ country: 'italy', type: ['speakeasy', 'x'], q: undefined }, OPTS))
      .toEqual({ ...EMPTY_QUERY, country: 'Italy', type: 'Speakeasy' });
  });

  it('shows the grid for any view value but map', () => {
    expect(readDirectoryQuery('?view=list', OPTS).view).toBe('grid');
  });
});
