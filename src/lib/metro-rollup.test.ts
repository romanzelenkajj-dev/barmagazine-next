import { describe, it, expect } from 'vitest';
import { rollupTarget, metroCityOf, areasOf, areaOf, searchTermsOf } from './metro-rollup';
import { buildCityEntries, CityIndex } from './city-keys';

const bh = { city: 'Beverly Hills', country: 'United States', state: 'CA' };
const la = { city: 'Los Angeles', country: 'United States', state: 'CA' };
const oakland = { city: 'Oakland', country: 'United States', state: 'CA' };
const shawnee = { city: 'Shawnee', country: 'United States', state: 'KS' };
const kcmo = { city: 'Kansas City', country: 'United States', state: 'MO' };

describe('rollupTarget', () => {
  it('folds a listed area into its metro', () => {
    expect(rollupTarget(bh)?.metro).toBe('Los Angeles');
  });

  it('leaves a city that is its own city alone', () => {
    expect(rollupTarget(la)).toBeNull();
    // The line the task draws explicitly: Oakland is not San Francisco.
    expect(rollupTarget(oakland)).toBeNull();
  });

  it('is keyed on state, so the same name in another state does not fold', () => {
    expect(rollupTarget({ city: 'Decatur', country: 'United States', state: 'GA' })?.metro).toBe('Atlanta');
    expect(rollupTarget({ city: 'Decatur', country: 'United States', state: 'IL' })).toBeNull();
  });

  it('does not fold a row whose state is unknown', () => {
    // A rollup is a positive claim about where a bar is; a null state
    // cannot support one.
    expect(rollupTarget({ city: 'Decatur', country: 'United States', state: null })).toBeNull();
  });

  it('carries the metro state, not the area state, across a state line', () => {
    const t = rollupTarget(shawnee);
    expect(t?.metro).toBe('Kansas City');
    expect(t?.metroState).toBe('MO');
  });
});

describe('metroCityOf', () => {
  it('reports the metro for an area and the city for everything else', () => {
    expect(metroCityOf(bh)).toBe('Los Angeles');
    expect(metroCityOf(oakland)).toBe('Oakland');
  });
});

describe('areasOf', () => {
  it('treats a folded city as the area', () => {
    expect(areasOf(bh, 'Los Angeles')).toEqual(['Beverly Hills']);
  });

  it('keeps BOTH the neighbourhood and the folded city', () => {
    // The bug this exists for: Spoke Wine Bar is in Davis Square, in
    // Somerville, which folds into Boston. Returning only the neighbourhood
    // loses "Somerville", the word the rollup is meant to keep findable.
    const spoke = { city: 'Somerville', neighborhood: 'Davis Square' };
    expect(areasOf(spoke, 'Boston')).toEqual(['Davis Square', 'Somerville']);
    expect(areaOf(spoke, 'Boston')).toBe('Davis Square');
  });

  it('never labels a bar with the metro it is already in', () => {
    expect(areasOf({ city: 'New York', neighborhood: null }, 'New York')).toEqual([]);
    expect(areasOf({ city: 'New York', neighborhood: 'Midtown East' }, 'New York')).toEqual(['Midtown East']);
  });

  it('does not repeat a neighbourhood that equals the city', () => {
    expect(areasOf({ city: 'Shawnee', neighborhood: 'Shawnee' }, 'Kansas City')).toEqual(['Shawnee']);
  });
});

describe('searchTermsOf', () => {
  it('matches a bar on its metro and on every area name', () => {
    const spoke = { city: 'Somerville', country: 'United States', state: 'MA', neighborhood: 'Davis Square' };
    expect(searchTermsOf(spoke)).toEqual(['Boston', 'Davis Square', 'Somerville']);
  });
});

describe('the rollup inside buildCityEntries', () => {
  const rows = [
    ...Array.from({ length: 3 }, () => la),
    bh,
    { city: 'Santa Monica', country: 'United States', state: 'CA' },
    oakland,
    shawnee,
    kcmo,
  ];
  const entries = buildCityEntries(rows);
  const index = new CityIndex(entries);

  it('gives the metro one entry holding its areas', () => {
    const e = entries.find(x => x.slug === 'los-angeles');
    expect(e?.count).toBe(5);
    expect(e?.cityStrings.sort()).toEqual(['Beverly Hills', 'Los Angeles', 'Santa Monica']);
  });

  it('leaves no entry behind under the area name', () => {
    expect(entries.find(x => x.slug === 'beverly-hills')).toBeUndefined();
    expect(entries.find(x => x.slug === 'santa-monica')).toBeUndefined();
  });

  it('does not split a metro that straddles a state line', () => {
    // Shawnee is KS and Kansas City is MO. Grouping on the row's own state
    // would produce kansas-city-ks and kansas-city-mo, which is the exact
    // opposite of what the rollup is for.
    expect(entries.filter(x => x.slug.startsWith('kansas-city')).map(x => x.slug)).toEqual(['kansas-city']);
    expect(entries.find(x => x.slug === 'kansas-city')?.count).toBe(2);
  });

  it('routes an area row to its metro entry, not to a dead slug', () => {
    // Without this, slugFor(a Beverly Hills bar) falls back to
    // "beverly-hills" and links to a page that no longer exists.
    expect(index.slugFor(bh)).toBe('los-angeles');
    expect(index.slugFor(shawnee)).toBe('kansas-city');
  });

  it('names the entry after the metro even when an area outnumbers it', () => {
    const lopsided = buildCityEntries([kcmo, shawnee, shawnee, shawnee]);
    expect(lopsided.find(x => x.slug === 'kansas-city')?.city).toBe('Kansas City');
  });

  it('leaves an unrolled city exactly as it was', () => {
    expect(entries.find(x => x.slug === 'oakland')?.count).toBe(1);
  });

  describe('task 130 lines (2026-09-24)', () => {
    it('folds Long Beach into Los Angeles and Durham into Raleigh', () => {
      expect(rollupTarget({ city: 'Long Beach', country: 'United States', state: 'CA' })?.metro).toBe('Los Angeles');
      expect(rollupTarget({ city: 'Durham', country: 'United States', state: 'NC' })?.metro).toBe('Raleigh');
    });

    it('leaves Raleigh itself, Durham in England and Palm Beach alone', () => {
      expect(rollupTarget({ city: 'Raleigh', country: 'United States', state: 'NC' })).toBeNull();
      expect(rollupTarget({ city: 'Durham', country: 'United Kingdom', state: null })).toBeNull();
      expect(rollupTarget({ city: 'Palm Beach', country: 'United States', state: 'FL' })).toBeNull();
    });

    it('keeps Durham findable on a Raleigh card', () => {
      expect(areasOf({ city: 'Durham', neighborhood: null }, 'Raleigh')).toEqual(['Durham']);
    });
  });

  describe('task 131 line (2026-09-24)', () => {
    it('folds Scottsdale into Phoenix and leaves Phoenix itself alone', () => {
      expect(rollupTarget({ city: 'Scottsdale', country: 'United States', state: 'AZ' })?.metro).toBe('Phoenix');
      expect(rollupTarget({ city: 'Phoenix', country: 'United States', state: 'AZ' })).toBeNull();
    });

    it('keeps Scottsdale findable on a Phoenix card', () => {
      expect(areasOf({ city: 'Scottsdale', neighborhood: null }, 'Phoenix')).toEqual(['Scottsdale']);
    });
  });
});
