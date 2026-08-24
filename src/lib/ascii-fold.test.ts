import { describe, it, expect } from 'vitest';
import { asciiFold, foldQueryForIlike, searchOrFilter } from './ascii-fold';

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
});
