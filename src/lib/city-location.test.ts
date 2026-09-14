import { describe, it, expect } from 'vitest';
import {
  usesSubdivision,
  subdivisionCode,
  subdivisionForCity,
  cityLabel,
} from './city-location';

describe('city-location', () => {
  describe('subdivisionCode', () => {
    it('reads the state from a US address', () => {
      expect(subdivisionCode('2905B Gallatin Pike, Nashville, TN 37216', 'United States')).toBe('TN');
      expect(subdivisionCode('134 Eldridge St, New York, NY 10002', 'United States')).toBe('NY');
      expect(subdivisionCode('1250 Prospect Street, La Jolla, CA 92037-1234', 'United States')).toBe('CA');
    });

    it('reads the province from a Canadian address', () => {
      expect(subdivisionCode('244 Adelaide St West, Toronto, ON M5H 1Y1', 'Canada')).toBe('ON');
      expect(subdivisionCode('1216 Bute St, Vancouver, BC V6E 1Z5', 'Canada')).toBe('BC');
    });

    it('does NOT mistake a compass direction for a state', () => {
      // This is the bug the postcode anchor exists to prevent: a bare
      // two-letter search read "Street NE" as Nebraska.
      expect(subdivisionCode('99 Krog Street NE, Ste. W, Atlanta, GA 30307', 'United States')).toBe('GA');
      expect(subdivisionCode('Some Street NE, Albuquerque, NM 87102', 'United States')).toBe('NM');
    });

    it('returns null when there is no postcode to anchor to, or the code is junk', () => {
      expect(subdivisionCode('1265 Parkview St', 'United States')).toBeNull();
      expect(subdivisionCode('606 Trounce Alley', 'Canada')).toBeNull();
      expect(subdivisionCode('12 Somewhere, ZZ 99999', 'United States')).toBeNull();
      expect(subdivisionCode(null, 'United States')).toBeNull();
    });
  });

  describe('subdivisionForCity', () => {
    it('takes the majority when listings spill into neighbouring towns', () => {
      const addresses = [
        '1 A St, Boston, MA 02127',
        '2 B St, Boston, MA 02116',
        '295 Washington St, Brookline, MA 02445',
      ];
      expect(subdivisionForCity(addresses, 'United States')).toBe('Massachusetts');
    });

    it('is not swayed by a single stray address', () => {
      const addresses = [
        '1 A St, Miami, FL 33101',
        '2 B St, Miami, FL 33109',
        '9011 Collins Avenue, Surfside, FL 33154',
        '1 Stray Rd, Somewhere, NY 10001',
      ];
      expect(subdivisionForCity(addresses, 'United States')).toBe('Florida');
    });

    it('returns null outside the US and Canada, and when nothing resolves', () => {
      expect(subdivisionForCity(['Calle Tal 1, 28004 Madrid'], 'Spain')).toBeNull();
      expect(subdivisionForCity(['1265 Parkview St'], 'United States')).toBeNull();
      expect(subdivisionForCity([], 'United States')).toBeNull();
    });
  });

  describe('cityLabel', () => {
    it('uses the state for US cities and never the country', () => {
      expect(cityLabel('Nashville', 'United States', 'Tennessee')).toBe('Nashville, Tennessee');
      expect(cityLabel('Nashville', 'United States', 'Tennessee')).not.toContain('United States');
    });

    it('uses the province for Canadian cities', () => {
      expect(cityLabel('Toronto', 'Canada', 'Ontario')).toBe('Toronto, Ontario');
      expect(cityLabel('Toronto', 'Canada', 'Ontario')).not.toContain('Canada');
    });

    it('keeps City, Country everywhere else, which is what disambiguates', () => {
      expect(cityLabel('Málaga', 'Spain', null)).toBe('Málaga, Spain');
      expect(cityLabel('Córdoba', 'Argentina', null)).toBe('Córdoba, Argentina');
      expect(cityLabel('Córdoba', 'Spain', null)).toBe('Córdoba, Spain');
    });

    it('falls back to the bare city, NEVER to the country, when unresolved', () => {
      expect(cityLabel('Detroit', 'United States', null)).toBe('Detroit');
      expect(cityLabel('Victoria', 'Canada', null)).toBe('Victoria');
    });

    it('does not repeat a qualifier the city name already carries', () => {
      expect(cityLabel('Washington DC', 'United States', 'District of Columbia')).toBe('Washington DC');
      expect(cityLabel('New York', 'United States', 'New York')).toBe('New York');
    });
  });

  it('usesSubdivision covers only the two countries the rule names', () => {
    expect(usesSubdivision('United States')).toBe(true);
    expect(usesSubdivision('Canada')).toBe(true);
    expect(usesSubdivision('Mexico')).toBe(false);
    expect(usesSubdivision(null)).toBe(false);
  });
});
