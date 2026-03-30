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


// Approximate city coordinates for distance-based sorting.
// Avoids an API call — covers major cities visitors come from.
const CITY_COORDS: Record<string, [number, number]> = {
  // US — major cities
  'new york': [40.71, -74.01], 'los angeles': [34.05, -118.24], 'chicago': [41.88, -87.63],
  'houston': [29.76, -95.37], 'phoenix': [33.45, -112.07], 'philadelphia': [39.95, -75.17],
  'san antonio': [29.42, -98.49], 'san diego': [32.72, -117.16], 'dallas': [32.78, -96.80],
  'san jose': [37.34, -121.89], 'austin': [30.27, -97.74], 'jacksonville': [30.33, -81.66],
  'fort worth': [32.75, -97.33], 'columbus': [39.96, -82.99], 'charlotte': [35.23, -80.84],
  'indianapolis': [39.77, -86.16], 'san francisco': [37.77, -122.42], 'seattle': [47.61, -122.33],
  'denver': [39.74, -104.99], 'nashville': [36.16, -86.78], 'oklahoma city': [35.47, -97.52],
  'el paso': [31.76, -106.49], 'washington': [38.91, -77.04], 'boston': [42.36, -71.06],
  'las vegas': [36.17, -115.14], 'portland': [45.52, -122.68], 'memphis': [35.15, -90.05],
  'louisville': [38.25, -85.76], 'baltimore': [39.29, -76.61], 'milwaukee': [43.04, -87.91],
  'albuquerque': [35.08, -106.65], 'tucson': [32.22, -110.97], 'fresno': [36.74, -119.77],
  'sacramento': [38.58, -121.49], 'mesa': [33.42, -111.83], 'kansas city': [39.10, -94.58],
  'atlanta': [33.75, -84.39], 'omaha': [41.26, -95.94], 'colorado springs': [38.83, -104.82],
  'raleigh': [35.78, -78.64], 'long beach': [33.77, -118.19], 'virginia beach': [36.85, -75.98],
  'minneapolis': [44.98, -93.27], 'tampa': [27.95, -82.46], 'new orleans': [29.95, -90.07],
  'cleveland': [41.50, -81.69], 'honolulu': [21.31, -157.86], 'miami': [25.76, -80.19],
  'st. louis': [38.63, -90.20], 'pittsburgh': [40.44, -79.99], 'cincinnati': [39.10, -84.51],
  'detroit': [42.33, -83.05], 'richmond': [37.54, -77.43], 'salt lake city': [40.76, -111.89],
  'boise': [43.62, -116.20], 'spokane': [47.66, -117.43], 'anchorage': [61.22, -149.90],
  'orlando': [28.54, -81.38], 'fort lauderdale': [26.12, -80.14], 'buffalo': [42.89, -78.87],
  // US — San Diego metro and suburbs
  'carlsbad': [33.16, -117.35], 'chula vista': [32.64, -117.08], 'oceanside': [33.20, -117.38],
  'escondido': [33.12, -117.09], 'vista': [33.20, -117.24], 'encinitas': [33.04, -117.29],
  'el cajon': [32.79, -116.96], 'la jolla': [32.84, -117.27], 'del mar': [32.96, -117.27],
  'solana beach': [32.99, -117.27], 'santee': [32.84, -116.97], 'poway': [32.96, -117.04],
  'national city': [32.68, -117.10], 'coronado': [32.69, -117.18],
  // US — LA metro
  'pasadena': [34.15, -118.14], 'glendale': [34.14, -118.26], 'burbank': [34.18, -118.31],
  'santa monica': [34.02, -118.49], 'beverly hills': [34.07, -118.40], 'west hollywood': [34.09, -118.36],
  'culver city': [34.02, -118.40], 'torrance': [33.84, -118.34], 'anaheim': [33.84, -117.91],
  'irvine': [33.68, -117.77], 'santa ana': [33.75, -117.87], 'riverside': [33.98, -117.37],
  // US — NYC metro
  'brooklyn': [40.65, -73.95], 'queens': [40.73, -73.79], 'bronx': [40.84, -73.87],
  'jersey city': [40.72, -74.04], 'newark': [40.74, -74.17], 'hoboken': [40.74, -74.03],
  'stamford': [41.05, -73.54], 'yonkers': [40.93, -73.90],
  // Europe
  'london': [51.51, -0.13], 'paris': [48.86, 2.35], 'berlin': [52.52, 13.41],
  'barcelona': [41.39, 2.17], 'madrid': [40.42, -3.70], 'rome': [41.90, 12.50],
  'milan': [45.46, 9.19], 'amsterdam': [52.37, 4.90], 'prague': [50.08, 14.44],
  'vienna': [48.21, 16.37], 'copenhagen': [55.68, 12.57], 'stockholm': [59.33, 18.07],
  'lisbon': [38.72, -9.14], 'dublin': [53.35, -6.26], 'bratislava': [48.15, 17.11],
  'budapest': [47.50, 19.04], 'athens': [37.98, 23.73], 'zurich': [47.38, 8.54],
  'brussels': [50.85, 4.35], 'warsaw': [52.23, 21.01], 'oslo': [59.91, 10.75],
  'helsinki': [60.17, 24.94], 'edinburgh': [55.95, -3.19], 'manchester': [53.48, -2.24],
  'birmingham': [52.48, -1.90], 'glasgow': [55.86, -4.25], 'munich': [48.14, 11.58],
  'hamburg': [53.55, 9.99], 'frankfurt': [50.11, 8.68], 'cologne': [50.94, 6.96],
  'bern': [46.95, 7.45], 'geneva': [46.20, 6.15], 'porto': [41.16, -8.63],
  'seville': [37.39, -5.99], 'valencia': [39.47, -0.38], 'florence': [43.77, 11.26],
  'naples': [40.85, 14.27], 'venice': [45.44, 12.33],
  // Asia
  'singapore': [1.35, 103.82], 'hong kong': [22.28, 114.16], 'tokyo': [35.68, 139.69],
  'bangkok': [13.75, 100.50], 'seoul': [37.57, 126.98], 'shanghai': [31.23, 121.47],
  'dubai': [25.20, 55.27], 'mumbai': [19.08, 72.88], 'taipei': [25.03, 121.57],
  'beijing': [39.91, 116.39], 'osaka': [34.69, 135.50], 'kuala lumpur': [3.14, 101.69],
  'jakarta': [-6.21, 106.85], 'manila': [14.60, 120.98], 'ho chi minh city': [10.82, 106.63],
  'hanoi': [21.03, 105.85], 'delhi': [28.66, 77.23], 'bangalore': [12.97, 77.59],
  'abu dhabi': [24.47, 54.37], 'doha': [25.29, 51.53], 'riyadh': [24.69, 46.72],
  'tel aviv': [32.08, 34.78], 'beirut': [33.89, 35.50],
  // Oceania
  'sydney': [-33.87, 151.21], 'melbourne': [-37.81, 144.96], 'brisbane': [-27.47, 153.02],
  'perth': [-31.95, 115.86], 'auckland': [-36.85, 174.76],
  // Canada
  'toronto': [43.65, -79.38], 'montreal': [45.50, -73.57], 'vancouver': [49.25, -123.12],
  'calgary': [51.05, -114.07], 'edmonton': [53.55, -113.49], 'ottawa': [45.42, -75.69],
  // Latin America
  'mexico city': [19.43, -99.13], 'buenos aires': [-34.60, -58.38], 'sao paulo': [-23.55, -46.63],
  'bogota': [4.71, -74.07], 'lima': [-12.05, -77.04], 'santiago': [-33.46, -70.65],
  'rio de janeiro': [-22.91, -43.17], 'medellin': [6.25, -75.56], 'guadalajara': [20.67, -103.35],
  // Africa
  'cape town': [-33.93, 18.42], 'johannesburg': [-26.20, 28.04], 'nairobi': [-1.29, 36.82],
  'lagos': [6.52, 3.38], 'cairo': [30.06, 31.25], 'casablanca': [33.59, -7.62],
};

// Country-level coordinates for fallback when city is not in CITY_COORDS
const COUNTRY_COORDS: Record<string, [number, number]> = {
  US: [39.50, -98.35], GB: [54.00, -2.00], FR: [46.23, 2.21], DE: [51.17, 10.45],
  ES: [40.46, -3.75], IT: [41.87, 12.57], AU: [-25.27, 133.78], CA: [56.13, -106.35],
  JP: [36.20, 138.25], CN: [35.86, 104.20], SG: [1.35, 103.82], AE: [23.42, 53.85],
  MX: [23.63, -102.55], BR: [-14.24, -51.93], AR: [-38.42, -63.62], CO: [4.57, -74.30],
  NL: [52.13, 5.29], BE: [50.50, 4.47], PT: [39.40, -8.22], CH: [46.82, 8.23],
  AT: [47.52, 14.55], SE: [60.13, 18.64], NO: [60.47, 8.47], DK: [56.26, 9.50],
  FI: [61.92, 25.75], PL: [51.92, 19.15], CZ: [49.82, 15.47], HU: [47.16, 19.50],
  GR: [39.07, 21.82], TR: [38.96, 35.24], ZA: [-30.56, 22.94], NG: [9.08, 8.68],
  KE: [-0.02, 37.91], IN: [20.59, 78.96], TH: [15.87, 100.99], MY: [4.21, 101.98],
  PH: [12.88, 121.77], VN: [14.06, 108.28], KR: [35.91, 127.77], HK: [22.40, 114.11],
  TW: [23.70, 121.00], ID: [-0.79, 113.92], NZ: [-40.90, 174.89], CL: [-35.68, -71.54],
  PE: [-9.19, -75.02], IL: [31.05, 34.85], QA: [25.35, 51.18], SA: [23.89, 45.08],
};

export function getCountryFromCode(code: string): string | null {
  return COUNTRY_CODE_MAP[code.toUpperCase()] || null;
}

export function getContinentCountryNames(continentCode: string): string[] {
  const codes = CONTINENT_COUNTRIES[continentCode.toUpperCase()] || [];
  return codes.map(c => COUNTRY_CODE_MAP[c]).filter(Boolean);
}

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
 * Uses actual distance when possible, falls back to country-level coords, then categorical matching.
 */
export function getGeoScore(
  bar: { city: string; country: string; lat?: number | null; lng?: number | null },
  geoCity: string,
  geoCountryCode: string,
  geoContinent: string
): number {
  const visitorCountry = getCountryFromCode(geoCountryCode);
  const continentCountries = getContinentCountryNames(geoContinent);

  // Try city-level coordinates first
  const cityKey = geoCity ? geoCity.toLowerCase() : '';
  const visitorCoords = cityKey ? CITY_COORDS[cityKey] : null;

  // Fall back to country-level coordinates if city not found
  const countryCoords = geoCountryCode ? COUNTRY_COORDS[geoCountryCode.toUpperCase()] : null;

  const effectiveCoords = visitorCoords || countryCoords || null;

  if (effectiveCoords && bar.lat && bar.lng) {
    const dist = degDistance(bar.lat, bar.lng, effectiveCoords[0], effectiveCoords[1]);
    // Convert distance to score: closer = higher score
    // Max score 1000 for same location, decreasing with distance
    // Country-level fallback gets a small penalty (max 800) to rank below exact city matches
    const maxScore = visitorCoords ? 1000 : 800;
    const distScore = Math.max(0, maxScore - Math.round(dist * 50));
    return distScore;
  }

  // Final fallback to categorical scoring (no coordinates available)
  if (geoCity && bar.city.toLowerCase() === cityKey) return 100;
  if (visitorCountry && bar.country === visitorCountry) return 50;
  if (continentCountries.includes(bar.country)) return 10;

  return 0;
}
