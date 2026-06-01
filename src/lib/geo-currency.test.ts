import { describe, it, expect } from 'vitest';
import {
  CURRENCY_COOKIE,
  EU_COUNTRIES,
  isEUCountryCode,
  currencyFromCountry,
  resolveCurrencyForRequest,
  symbolFor,
} from './geo-currency';

/**
 * Pins the SSR currency-resolution contract used by both:
 *   - src/middleware.ts (writes the geo_currency cookie on /claim-your-bar
 *     and /feature-your-bar)
 *   - src/app/feature-your-bar/page.tsx (reads cookie + header to render
 *     the right currency in initial HTML)
 *
 * The two callers MUST agree on:
 *   - which countries map to EUR vs USD
 *   - that the cookie value is the fast path (overrides header)
 *   - that the safety default is USD when no signal is present
 *
 * Drift between the two sides shows up as "EU visitor sees $ on first
 * paint then € on the next nav" — exactly the kind of flash the SSR
 * pattern exists to prevent. These assertions fail loudly if anyone
 * breaks the contract.
 */

describe('geo-currency helper', () => {
  describe('EU_COUNTRIES set', () => {
    it('contains all 27 post-Brexit EU member states', () => {
      // Hardcoded count guards against silent additions/removals.
      expect(EU_COUNTRIES.size).toBe(27);
    });

    it('does NOT contain UK (post-Brexit) or non-EU countries', () => {
      // Common mistakes a future edit could introduce.
      expect(EU_COUNTRIES.has('GB')).toBe(false);
      expect(EU_COUNTRIES.has('UK')).toBe(false);
      expect(EU_COUNTRIES.has('CH')).toBe(false); // Switzerland
      expect(EU_COUNTRIES.has('NO')).toBe(false); // Norway
      expect(EU_COUNTRIES.has('US')).toBe(false);
    });

    it('contains a representative sample of EU codes', () => {
      ['DE', 'FR', 'IT', 'ES', 'NL', 'PL', 'SK', 'CZ', 'IE'].forEach((c) => {
        expect(EU_COUNTRIES.has(c)).toBe(true);
      });
    });
  });

  describe('isEUCountryCode()', () => {
    it('returns true for EU codes (any case)', () => {
      expect(isEUCountryCode('DE')).toBe(true);
      expect(isEUCountryCode('de')).toBe(true);
      expect(isEUCountryCode('fr')).toBe(true);
    });

    it('returns false for non-EU and falsy inputs', () => {
      expect(isEUCountryCode('US')).toBe(false);
      expect(isEUCountryCode('GB')).toBe(false);
      expect(isEUCountryCode('')).toBe(false);
      expect(isEUCountryCode(null)).toBe(false);
      expect(isEUCountryCode(undefined)).toBe(false);
    });
  });

  describe('currencyFromCountry()', () => {
    it('returns EUR for EU codes', () => {
      expect(currencyFromCountry('DE')).toBe('EUR');
      expect(currencyFromCountry('fr')).toBe('EUR');
    });

    it('returns USD for non-EU codes and missing values', () => {
      // USD is the safety default. Stripe payment links historically default
      // to USD; matches user expectation for unknown/global traffic.
      expect(currencyFromCountry('US')).toBe('USD');
      expect(currencyFromCountry('GB')).toBe('USD');
      expect(currencyFromCountry(null)).toBe('USD');
      expect(currencyFromCountry(undefined)).toBe('USD');
      expect(currencyFromCountry('')).toBe('USD');
    });
  });

  describe('resolveCurrencyForRequest() — SSR contract', () => {
    it('cookie wins over header (fast path)', () => {
      // A US visitor whose cookie says EUR (e.g. they manually overrode)
      // gets EUR. The cookie is the cached authoritative answer.
      expect(
        resolveCurrencyForRequest({
          cookieValue: 'EUR',
          countryHeader: 'US',
        }),
      ).toBe('EUR');
      expect(
        resolveCurrencyForRequest({
          cookieValue: 'USD',
          countryHeader: 'DE',
        }),
      ).toBe('USD');
    });

    it('falls through to header when cookie is missing or invalid', () => {
      expect(
        resolveCurrencyForRequest({
          cookieValue: null,
          countryHeader: 'DE',
        }),
      ).toBe('EUR');
      expect(
        resolveCurrencyForRequest({
          cookieValue: undefined,
          countryHeader: 'US',
        }),
      ).toBe('USD');
      // Garbage cookie value falls through to header resolution.
      expect(
        resolveCurrencyForRequest({
          cookieValue: 'XYZ',
          countryHeader: 'DE',
        }),
      ).toBe('EUR');
    });

    it('defaults to USD when both signals are absent (cold start, no geo)', () => {
      expect(resolveCurrencyForRequest({})).toBe('USD');
      expect(
        resolveCurrencyForRequest({ cookieValue: null, countryHeader: null }),
      ).toBe('USD');
    });
  });

  describe('symbolFor()', () => {
    it('maps currency codes to display symbols', () => {
      expect(symbolFor('EUR')).toBe('€');
      expect(symbolFor('USD')).toBe('$');
    });
  });

  describe('CURRENCY_COOKIE name', () => {
    it('is the literal "geo_currency" string the middleware and SSR both reference', () => {
      // If this ever changes, middleware would write to one cookie and the
      // SSR helper would read another, silently breaking the fast path.
      expect(CURRENCY_COOKIE).toBe('geo_currency');
    });
  });
});
