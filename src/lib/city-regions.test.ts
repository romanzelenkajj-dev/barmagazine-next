import { describe, it, expect } from 'vitest';
import { regionOfCountry, groupCitiesByRegion, CITY_REGIONS } from './city-regions';

describe('regionOfCountry', () => {
  it('places the countries with city pages', () => {
    expect(regionOfCountry('United States')).toBe('North America');
    expect(regionOfCountry('Canada')).toBe('North America');
    expect(regionOfCountry('Mexico')).toBe('Latin America');
    expect(regionOfCountry('Puerto Rico')).toBe('Latin America');
    expect(regionOfCountry('Brazil')).toBe('Latin America');
    expect(regionOfCountry('Chile')).toBe('Latin America');
    expect(regionOfCountry('United Arab Emirates')).toBe('Middle East and Africa');
    expect(regionOfCountry('South Africa')).toBe('Middle East and Africa');
    expect(regionOfCountry('Turkey')).toBe('Europe');
    expect(regionOfCountry('Serbia')).toBe('Europe');
    expect(regionOfCountry('Macau')).toBe('Asia');
    expect(regionOfCountry('Hong Kong')).toBe('Asia');
    expect(regionOfCountry('Australia')).toBe('Oceania');
  });
});

describe('groupCitiesByRegion', () => {
  it('keeps every city, orders regions as listed and cities alphabetically', () => {
    const cities = [
      { slug: 'tokyo', city: 'Tokyo', country: 'Japan' },
      { slug: 'athens', city: 'Athens', country: 'Greece' },
      { slug: 'sydney', city: 'Sydney', country: 'Australia' },
      { slug: 'amsterdam', city: 'Amsterdam', country: 'Netherlands' },
      { slug: 'mexico-city', city: 'Mexico City', country: 'Mexico' },
      { slug: 'new-york', city: 'New York', country: 'United States' },
      { slug: 'zurich', city: 'Zürich', country: 'Switzerland' },
    ];
    const groups = groupCitiesByRegion(cities);
    expect(groups.map(g => g.region)).toEqual(['Europe', 'North America', 'Latin America', 'Asia', 'Oceania']);
    expect(groups[0].cities.map(c => c.city)).toEqual(['Amsterdam', 'Athens', 'Zürich']);
    expect(groups.flatMap(g => g.cities)).toHaveLength(cities.length);
    expect(CITY_REGIONS).toHaveLength(6);
  });
});
