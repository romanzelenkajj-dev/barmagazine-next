import { describe, it, expect } from 'vitest';
import { buildCityEntries, CityIndex, cityBase, countryCode } from './city-keys';

const us = (city: string, state: string | null) => ({ city, country: 'United States', state });
const row = (city: string, country: string, state: string | null = null) => ({ city, country, state });

describe('city slugs for same-name cities', () => {
  it('keeps the bare slug for every city with no collision', () => {
    const idx = new CityIndex(buildCityEntries([us('Nashville', 'TN'), us('Nashville', 'TN'), row('Tokyo', 'Japan'), row('Kraków', 'Poland')]));
    expect(idx.entries.map(e => e.slug).sort()).toEqual(['krakow', 'nashville', 'tokyo']);
    expect(idx.entries.every(e => !e.qualified)).toBe(true);
  });

  it('qualifies US same-name cities by state: portland-or and portland-me', () => {
    const idx = new CityIndex(buildCityEntries([us('Portland', 'OR'), us('Portland', 'ME')]));
    expect(idx.entries.map(e => e.slug).sort()).toEqual(['portland-me', 'portland-or']);
    expect(idx.resolve('portland-me')?.state).toBe('ME');
    expect(idx.slugFor(us('Portland', 'ME'))).toBe('portland-me');
    expect(idx.slugFor(us('Portland', 'OR'))).toBe('portland-or');
  });

  it('qualifies across countries: birmingham-al and birmingham-gb', () => {
    const idx = new CityIndex(buildCityEntries([us('Birmingham', 'AL'), us('Birmingham', 'AL'), row('Birmingham', 'United Kingdom')]));
    expect(idx.entries.map(e => e.slug).sort()).toEqual(['birmingham-al', 'birmingham-gb']);
    expect(idx.resolve('birmingham-gb')?.count).toBe(1);
    expect(idx.resolve('birmingham-al')?.count).toBe(2);
    expect(idx.slugFor(row('Birmingham', 'United Kingdom'))).toBe('birmingham-gb');
  });

  it('a null state joins the majority state and never fakes a collision (Detroit)', () => {
    const idx = new CityIndex(buildCityEntries([us('Detroit', 'MI'), us('Detroit', 'MI'), us('Detroit', 'MI'), us('Detroit', null)]));
    expect(idx.entries).toHaveLength(1);
    expect(idx.entries[0].slug).toBe('detroit');
    expect(idx.entries[0].count).toBe(4);
    expect(idx.slugFor(us('Detroit', null))).toBe('detroit');
  });

  it('in a collision, the null-state row goes to the majority state of its country', () => {
    const idx = new CityIndex(buildCityEntries([us('Portland', 'OR'), us('Portland', 'OR'), us('Portland', null), us('Portland', 'ME')]));
    expect(idx.resolve('portland-or')?.count).toBe(3);
    expect(idx.resolve('portland-me')?.count).toBe(1);
    expect(idx.forRow(us('Portland', null))?.slug).toBe('portland-or');
  });

  it('folds spellings into one entry and keeps every raw string for the query (Kraków)', () => {
    const idx = new CityIndex(buildCityEntries([row('Kraków', 'Poland'), row('Krakow', 'Poland'), row('Krakow', 'Poland')]));
    expect(idx.entries).toHaveLength(1);
    expect(idx.entries[0].slug).toBe('krakow');
    expect(idx.entries[0].city).toBe('Krakow'); // most common spelling
    expect(idx.entries[0].cityStrings.sort()).toEqual(['Krakow', 'Kraków']);
    expect(cityBase('Kraków')).toBe('krakow');
  });

  it('strips a qualifier the stored string carries and treats it as the bare city', () => {
    const idx = new CityIndex(buildCityEntries([us('Portland, Maine', 'ME'), us('Portland', 'OR')]));
    expect(idx.entries.map(e => e.slug).sort()).toEqual(['portland-me', 'portland-or']);
    expect(idx.resolve('portland-me')?.city).toBe('Portland');
  });

  it('non-US rows in a collision take the ISO country code, and a state only within one country', () => {
    const idx = new CityIndex(buildCityEntries([row('London', 'United Kingdom'), row('London', 'Canada', 'ON')]));
    expect(idx.entries.map(e => e.slug).sort()).toEqual(['london-ca', 'london-gb']);
    const two = new CityIndex(buildCityEntries([row('Windsor', 'Canada', 'ON'), row('Windsor', 'Canada', 'NS'), row('Windsor', 'United Kingdom')]));
    expect(two.entries.map(e => e.slug).sort()).toEqual(['windsor-gb', 'windsor-ns', 'windsor-on']);
    expect(countryCode('United Kingdom')).toBe('gb');
    expect(countryCode('Atlantis')).toBe('atlantis'); // unknown country: a readable fallback, never a crash
  });

  it('a US row with no state in a collision still gets its own page rather than the wrong one', () => {
    const idx = new CityIndex(buildCityEntries([us('Springfield', null), row('Springfield', 'Canada', 'ON')]));
    expect(idx.entries.map(e => e.slug).sort()).toEqual(['springfield-ca', 'springfield-us']);
  });
});
