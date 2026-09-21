import { describe, it, expect } from 'vitest';
import {
  asciiFold,
  foldQueryForIlike,
  searchOrFilter,
  searchOrFilters,
  MAX_QUERY_WORDS,
} from './ascii-fold';

describe('ascii-fold', () => {
  describe('asciiFold', () => {
    // The target values are what Postgres stores in name_ascii for these bars.
    it('folds accented names to the stored form', () => {
      expect(asciiFold('Múzsa')).toBe('muzsa');
      expect(asciiFold('Doppelgänger')).toBe('doppelganger');
      expect(asciiFold('Café Pacifico')).toBe('cafe pacifico');
      expect(asciiFold('Mélange by Cali Sober')).toBe('melange by cali sober');
    });

    it('is capitalisation-proof — this is why we lower before folding', () => {
      // The column folds before lowering, so mirroring it would leave 'MÚZSA'
      // as 'múzsa' and the search would depend on how the user typed it.
      expect(asciiFold('MÚZSA')).toBe('muzsa');
      expect(asciiFold('múzsa')).toBe('muzsa');
      expect(asciiFold('Múzsa')).toBe('muzsa');
    });

    it('folds characters the column misses only when lowercase in the map', () => {
      // ō and ů are absent from the map entirely, so they survive folding.
      expect(asciiFold('Saikindō')).toBe('saikindō');
      expect(asciiFold('Café Bar Pilotů')).toBe('cafe bar pilotů');
    });

    it('leaves plain ASCII alone apart from case', () => {
      expect(asciiFold('Lyaness')).toBe('lyaness');
    });

    it('handles non-string input', () => {
      for (const bad of [null, undefined, 42, {}]) expect(asciiFold(bad)).toBe('');
    });
  });

  describe('foldQueryForIlike', () => {
    it('escapes wildcards so % cannot match everything', () => {
      expect(foldQueryForIlike('%')).toBe('\\%');
      expect(foldQueryForIlike('a_b')).toBe('a\\_b');
      expect(foldQueryForIlike('a,b')).toBe('a\\,b');
    });

    it('trims and caps length', () => {
      expect(foldQueryForIlike('  bar  ')).toBe('bar');
      expect(foldQueryForIlike('x'.repeat(200)).length).toBe(80);
    });
  });

  describe('searchOrFilter', () => {
    it('always queries the folded columns', () => {
      const f = searchOrFilter('muzsa');
      expect(f).toContain('name_ascii.ilike.%muzsa%');
      expect(f).toContain('city_ascii.ilike.%muzsa%');
    });

    it('also queries the raw columns when the query has accents', () => {
      // Covers names the generated columns fold incorrectly, e.g. Ćilim Bar,
      // which is reachable by typing it as written but not by typing "cilim".
      const f = searchOrFilter('Ćilim');
      expect(f).toContain('name.ilike.%Ćilim%');
    });

    it('skips the raw clauses for a plain ASCII query, keeping the filter short', () => {
      const f = searchOrFilter('lyaness');
      expect(f).toBe('name_ascii.ilike.%lyaness%,city_ascii.ilike.%lyaness%');
    });

    it('appends extra columns when asked', () => {
      expect(searchOrFilter('spain', ['country'])).toContain('country.ilike.%spain%');
    });
  });

  describe('searchOrFilters', () => {
    it('leaves a single-word query byte for byte as it was', () => {
      // The whole safety argument for this change: one word cannot behave
      // differently, so nothing that worked before can regress.
      expect(searchOrFilters('lyaness')).toEqual([searchOrFilter('lyaness')]);
      expect(searchOrFilters('spain', ['country'])).toEqual([searchOrFilter('spain', ['country'])]);
    });

    it('returns one filter per word, so PostgREST ANDs them', () => {
      const f = searchOrFilters('haktet vanster');
      expect(f).toHaveLength(2);
      expect(f[0]).toContain('name_ascii.ilike.%haktet%');
      expect(f[1]).toContain('name_ascii.ilike.%vanster%');
    });

    it('lets one word match the name and another the city', () => {
      // "warsaw gin" is Lane's Gin Bar in Warsaw: one word per column, which
      // a single contiguous ilike can never do.
      const f = searchOrFilters('warsaw gin');
      expect(f[0]).toContain('city_ascii.ilike.%warsaw%');
      expect(f[1]).toContain('name_ascii.ilike.%gin%');
    });

    it('folds and escapes every word, not just the first', () => {
      const f = searchOrFilters('bar Múzsa');
      expect(f[1]).toContain('name_ascii.ilike.%muzsa%');
      // The accented word keeps its raw clause too.
      expect(f[1]).toContain('name.ilike.%Múzsa%');
      // A comma inside a word would otherwise split the or() list.
      expect(searchOrFilters('nik,s co')[0]).toContain('\\,');
    });

    it('caps the word count so a pasted paragraph cannot fan out', () => {
      expect(searchOrFilters('a b c d e f g h i j')).toHaveLength(MAX_QUERY_WORDS);
    });

    it('collapses runs of whitespace rather than building empty filters', () => {
      expect(searchOrFilters('  gold    bar  ')).toHaveLength(2);
    });

    it('passes extra columns to every word', () => {
      const f = searchOrFilters('deep ellum', ['neighborhood']);
      expect(f[0]).toContain('neighborhood.ilike.%deep%');
      expect(f[1]).toContain('neighborhood.ilike.%ellum%');
    });
  });
});
