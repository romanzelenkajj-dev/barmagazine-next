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

// Approximate city coordinates for distance-based sorting
// This avoids an API call — covers major cities visitors come from
const CITY_COORDS: Record<string, [number, number]> = {
  // US
  'san diego': [32.72, -117.16], 'los angeles': [34.05, -118.24], 'san francisco': [37.77, -122.42],
  'new york': [40.71, -74.01], 'chicago': [41.88, -87.63], 'miami': [25.76, -80.19],
  'las vegas': [36.17, -115.14], 'seattle': [47.61, -122.33], 'austin': [30.27, -97.74],
  'boston': [42.36, -71.06], 'washington': [38.91, -77.04], 'houston': [29.76, -95.37],
  'atlanta': [33.75, -84.39], 'nashville': [36.16, -86.78], 'portland': [45.52, -122.68],
  'new orleans': [29.95, -90.07], 'denver': [39.74, -104.99], 'philadelphia': [39.95, -75.17],
  // Europe
  'london': [51.51, -0.13], 'paris': [48.86, 2.35], 'berlin': [52.52, 13.41],
  'barcelona': [41.39, 2.17], 'madrid': [40.42, -3.70], 'rome': [41.90, 12.50],
  'milan': [45.46, 9.19], 'amsterdam': [52.37, 4.90], 'prague': [50.08, 14.44],
  'vienna': [48.21, 16.37], 'copenhagen': [55.68, 12.57], 'stockholm': [59.33, 18.07],
  'lisbon': [38.72, -9.14], 'dublin': [53.35, -6.26], 'bratislava': [48.15, 17.11],
  'budapest': [47.50, 19.04], 'athens': [37.98, 23.73], 'zurich': [47.38, 8.54],
  // Asia
  'singapore': [1.35, 103.82], 'hong kong': [22.28, 114.16], 'tokyo': [35.68, 139.69],
  'bangkok': [13.75, 100.50], 'seoul': [37.57, 126.98], 'shanghai': [31.23, 121.47],
  'dubai': [25.20, 55.27], 'mumbai': [19.08, 72.88], 'taipei': [25.03, 121.57],
  // Oceania
  'sydney': [-33.87, 151.21], 'melbourne': [-37.81, 144.96],
  // Americas
  'toronto': [43.65, -79.38], 'montreal': [45.50, -73.57], 'mexico city': [19.43, -99.13],
  'buenos aires': [-34.60, -58.38], 'sao paulo': [-23.55, -46.63], 'bogota': [4.71, -74.07],
  'lima': [-12.05, -77.04],
};

/**
 * Calculate distance in degrees between two points (fast approximation).
 */
function degDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = lat1 - lat2;
  const dLng = (lng1 - lng2) * Math.cos(((lat1 + lat2) / 2) * Math.PI / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * Geo-sort scoring: higher = shown first.
 * Uses actual distance when possible, falls back to city/country/continent matching.
 */
export function getGeoScore(
  bar: { city: string; country: string; lat?: number | null; lng?: number | null },
  geoCity: string,
  geoCountryCode: string,
  geoContinent: string
): number {
  const visitorCountry = getCountryFromCode(geoCountryCode);
  const continentCountries = getContinentCountryNames(geoContinent);

  // If we have bar coordinates and know the visitor's city, use distance-based scoring
  const visitorCoords = geoCity ? CITY_COORDS[geoCity.toLowerCase()] : null;
  if (visitorCoords && bar.lat && bar.lng) {
    const dist = degDistance(bar.lat, bar.lng, visitorCoords[0], visitorCoords[1]);
    // Convert distance to score: closer = higher score
    // Max score 1000 for same location, decreasing with distance
    // 1 degree ≈ 111km, so 0.1 deg ≈ 11km
    const distScore = Math.max(0, 1000 - Math.round(dist * 50));
    return distScore;
  }

  // Fallback to categorical scoring
  if (geoCity && bar.city.toLowerCase() === geoCity.toLowerCase()) return 100;
  if (visitorCountry && bar.country === visitorCountry) return 50;
  if (continentCountries.includes(bar.country)) return 10;

  return 0;
}
