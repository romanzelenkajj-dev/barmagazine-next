/**
 * Geo-targeting utilities for the bar directory.
 * Uses Vercel's free geo headers to personalize bar ordering.
 */

// ISO 3166-1 alpha-2 → country name (covering all countries in the directory)
const COUNTRY_CODE_MAP: Record<string, string> = {
  US: 'United States', GB: 'United Kingdom', CN: 'China', JP: 'Japan',
  SG: 'Singapore', MX: 'Mexico', ES: 'Spain', IT: 'Italy', FR: 'France',
  AU: 'Australia', HK: 'Hong Kong', TH: 'Thailand', CO: 'Colombia',
  AR: 'Argentina', GR: 'Greece', DE: 'Germany', IN: 'India', AE: 'United Arab Emirates',
  BR: 'Brazil', PE: 'Peru', KR: 'South Korea', MY: 'Malaysia', PH: 'Philippines',
  VN: 'Vietnam', TW: 'Taiwan', ID: 'Indonesia', AT: 'Austria', SE: 'Sweden',
  NO: 'Norway', DK: 'Denmark', FI: 'Finland', NL: 'Netherlands', BE: 'Belgium',
  PT: 'Portugal', CH: 'Switzerland', IE: 'Ireland', PL: 'Poland', CZ: 'Czech Republic',
  HU: 'Hungary', RO: 'Romania', HR: 'Croatia', SK: 'Slovakia', TR: 'Turkey',
  ZA: 'South Africa', NG: 'Nigeria', KE: 'Kenya', EG: 'Egypt', MA: 'Morocco',
  IL: 'Israel', LB: 'Lebanon', QA: 'Qatar', SA: 'Saudi Arabia', BH: 'Bahrain',
  CL: 'Chile', UY: 'Uruguay', EC: 'Ecuador', PA: 'Panama', CR: 'Costa Rica',
  JM: 'Jamaica', CU: 'Cuba', PR: 'Puerto Rico', TT: 'Trinidad and Tobago',
  NZ: 'New Zealand', CA: 'Canada', RU: 'Russia', UA: 'Ukraine',
};

// Continent code → array of ISO country codes in that continent
const CONTINENT_COUNTRIES: Record<string, string[]> = {
  NA: ['US', 'CA', 'MX', 'PA', 'CR', 'JM', 'CU', 'PR', 'TT'],
  SA: ['BR', 'AR', 'CO', 'PE', 'CL', 'UY', 'EC'],
  EU: ['GB', 'ES', 'IT', 'FR', 'DE', 'AT', 'SE', 'NO', 'DK', 'FI', 'NL', 'BE', 'PT', 'CH', 'IE', 'PL', 'CZ', 'HU', 'RO', 'HR', 'SK', 'GR', 'TR', 'UA', 'RU'],
  AS: ['CN', 'JP', 'SG', 'HK', 'TH', 'IN', 'AE', 'KR', 'MY', 'PH', 'VN', 'TW', 'ID', 'IL', 'LB', 'QA', 'SA', 'BH'],
  OC: ['AU', 'NZ'],
  AF: ['ZA', 'NG', 'KE', 'EG', 'MA'],
};

export function getCountryFromCode(code: string): string | null {
  return COUNTRY_CODE_MAP[code.toUpperCase()] || null;
}

export function getContinentCountryNames(continentCode: string): string[] {
  const codes = CONTINENT_COUNTRIES[continentCode.toUpperCase()] || [];
  return codes.map(c => COUNTRY_CODE_MAP[c]).filter(Boolean);
}

/**
 * Geo-sort scoring: higher = shown first.
 * City match: 100, Country match: 50, Continent match: 10, Other: 0.
 */
export function getGeoScore(
  bar: { city: string; country: string },
  geoCity: string,
  geoCountryCode: string,
  geoContinent: string
): number {
  const visitorCountry = getCountryFromCode(geoCountryCode);
  const continentCountries = getContinentCountryNames(geoContinent);

  // City match (URL-decoded Vercel header vs bar city)
  if (geoCity && bar.city.toLowerCase() === geoCity.toLowerCase()) return 100;

  // Country match
  if (visitorCountry && bar.country === visitorCountry) return 50;

  // Continent match
  if (continentCountries.includes(bar.country)) return 10;

  return 0;
}
