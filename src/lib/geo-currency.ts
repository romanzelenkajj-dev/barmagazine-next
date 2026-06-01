/**
 * Shared geo→currency resolution used by middleware (cookie writer)
 * and by SSR server components (cookie/header reader).
 *
 * EU visitors see EUR pricing; everyone else sees USD. The decision is
 * made once per request using Vercel's `x-vercel-ip-country` header
 * (also exposed as `request.geo?.country` in middleware), then cached
 * client-side in a `geo_currency` cookie so subsequent navigations are
 * resolved instantly.
 *
 * The cookie is the fast path. The header is the cold-start path. If
 * both are absent or invalid, default to USD (broader market; matches
 * the historical Stripe-payment-link fallback).
 */

export type Currency = 'EUR' | 'USD';
export const CURRENCY_COOKIE = 'geo_currency';

// EU member state ISO codes (post-Brexit, 27 members).
export const EU_COUNTRIES: ReadonlySet<string> = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

export function isEUCountryCode(code: string | null | undefined): boolean {
  if (!code) return false;
  return EU_COUNTRIES.has(code.toUpperCase());
}

export function currencyFromCountry(code: string | null | undefined): Currency {
  return isEUCountryCode(code) ? 'EUR' : 'USD';
}

/**
 * Resolve currency for an SSR request. Server components call this with
 * the values they get from next/headers' `cookies()` and `headers()`
 * helpers. Cookie wins (fast path); header is the cold-start fallback;
 * USD is the safety default.
 */
export function resolveCurrencyForRequest(opts: {
  cookieValue?: string | null;
  countryHeader?: string | null;
}): Currency {
  if (opts.cookieValue === 'EUR') return 'EUR';
  if (opts.cookieValue === 'USD') return 'USD';
  return currencyFromCountry(opts.countryHeader);
}

export function symbolFor(currency: Currency): '€' | '$' {
  return currency === 'EUR' ? '€' : '$';
}
