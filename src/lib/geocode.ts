const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Hardcoded city centers for cities that Mapbox geocodes incorrectly
const CITY_OVERRIDES: Record<string, [number, number]> = {
  'Hong Kong': [22.28, 114.16],
  'Macau': [22.20, 113.55],
  'Shenzhen': [22.54, 114.05],
  'Guangzhou': [23.13, 113.26],
  'Bali': [-8.41, 115.19],
  'Goa': [15.50, 73.83],
  'Hiriketiya': [5.95, 80.53],
  'Grand Cayman': [19.29, -81.37],
  'Shanghai': [31.23, 121.47],
  'Taipei': [25.03, 121.57],
  'Kaohsiung': [22.62, 120.31],
};

// Approximate country centroids (lat, lng) — last-resort fallback so a bar
// never ends up with NO coordinates (which makes it silently vanish from the
// directory map). Keyed by the country name as stored in the bars table;
// lookup is case-insensitive and whitespace-tolerant.
const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  'united states': [39.5, -98.5], 'usa': [39.5, -98.5], 'united kingdom': [54.0, -2.0],
  'uk': [54.0, -2.0], 'canada': [60.0, -96.0], 'australia': [-25.0, 134.0],
  'germany': [51.2, 10.5], 'france': [46.5, 2.5], 'spain': [40.4, -3.7],
  'italy': [42.0, 12.5], 'japan': [36.5, 138.0], 'china': [35.0, 104.0],
  'india': [20.6, 78.9], 'brazil': [-14.2, -51.9], 'mexico': [23.6, -102.5],
  'singapore': [1.35, 103.8], 'hong kong': [22.3, 114.2], 'uae': [24.0, 54.0],
  'united arab emirates': [24.0, 54.0], 'thailand': [15.0, 101.0], 'netherlands': [52.1, 5.3],
  'portugal': [39.4, -8.2], 'greece': [39.0, 22.0], 'argentina': [-38.4, -63.6],
  'colombia': [4.6, -74.3], 'south africa': [-29.0, 25.0], 'new zealand': [-41.0, 172.5],
  'sweden': [60.1, 18.6], 'norway': [60.5, 8.5], 'denmark': [56.0, 10.0],
  'switzerland': [46.8, 8.2], 'austria': [47.5, 14.5], 'ireland': [53.2, -8.0],
  'poland': [52.1, 19.1], 'czech republic': [49.8, 15.5], 'czechia': [49.8, 15.5],
  'south korea': [36.5, 127.8], 'croatia': [45.1, 15.2], 'serbia': [44.0, 21.0],
  'slovenia': [46.1, 14.8], 'romania': [45.9, 25.0], 'hungary': [47.2, 19.0],
  'slovakia': [48.7, 19.4], 'ukraine': [48.4, 31.2], 'turkey': [39.0, 35.2],
  'israel': [31.5, 34.9], 'saudi arabia': [23.9, 45.1], 'egypt': [26.8, 30.8],
  'nigeria': [9.1, 8.7], 'kenya': [0.0, 37.9], 'morocco': [31.8, -7.1],
  'peru': [-9.2, -75.0], 'chile': [-35.7, -71.5], 'venezuela': [6.4, -66.6],
  'philippines': [12.9, 122.0], 'malaysia': [4.2, 109.7], 'indonesia': [-0.8, 113.9],
  'vietnam': [16.2, 106.0], 'taiwan': [23.7, 120.9], 'pakistan': [30.4, 69.3],
  'bangladesh': [23.7, 90.4],
};

function countryCentroid(country: string): [number, number] | null {
  return COUNTRY_CENTROIDS[country.trim().toLowerCase()] ?? null;
}

export interface GeoResult {
  lat: number;
  lng: number;
  /** True when the point is a city/country fallback, not the precise venue. */
  approximate: boolean;
  level: 'exact' | 'city' | 'country';
}

/**
 * Geocode a bar's location with validation.
 * Uses a city bounding box to prevent results in the wrong country, then
 * falls back city center → country centroid so a bar ALWAYS gets coordinates
 * (a coordinate-less bar silently disappears from the directory map).
 * Returns null only when geocoding fails AND the country is unknown.
 */
export async function geocodeBar(opts: {
  name: string;
  address?: string | null;
  city: string;
  country: string;
}): Promise<GeoResult | null> {
  const round = (n: number) => Math.round(n * 1000000) / 1000000;
  const countryFallback = (): GeoResult | null => {
    const c = countryCentroid(opts.country);
    return c ? { lat: c[0], lng: c[1], approximate: true, level: 'country' } : null;
  };

  if (!MAPBOX_TOKEN) return countryFallback();

  const { name, address, city, country } = opts;

  // Step 1: Get expected city coordinates
  let cityLat: number | null = null;
  let cityLng: number | null = null;

  if (CITY_OVERRIDES[city]) {
    [cityLat, cityLng] = CITY_OVERRIDES[city];
  } else {
    // Geocode the city itself first
    try {
      const cityQuery = encodeURIComponent(`${city}, ${country}`);
      const cityRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${cityQuery}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      const cityData = await cityRes.json();
      if (cityData.features?.[0]) {
        [cityLng, cityLat] = cityData.features[0].center;
      }
    } catch {
      // Fall through
    }
  }

  // Step 2: Geocode the bar with bounding box if we have city coords
  const query = address ? `${address}, ${city}` : `${name} bar, ${city}, ${country}`;
  const encoded = encodeURIComponent(query);

  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

  // Add bounding box to constrain results to within ~50km of city
  if (cityLat !== null && cityLng !== null) {
    const bbox = `${cityLng - 0.5},${cityLat - 0.5},${cityLng + 0.5},${cityLat + 0.5}`;
    url += `&bbox=${bbox}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.features?.[0]) {
      // No venue match — fall back to city center, then country centroid.
      if (cityLat !== null && cityLng !== null) {
        return { lat: round(cityLat), lng: round(cityLng), approximate: true, level: 'city' };
      }
      return countryFallback();
    }

    const [resultLng, resultLat] = data.features[0].center;

    // Step 3: Validate — result must be within ~200km of city center
    if (cityLat !== null && cityLng !== null) {
      const dist = Math.sqrt(
        Math.pow(resultLat - cityLat, 2) + Math.pow(resultLng - cityLng, 2)
      );
      if (dist > 1.8) {
        // Result is too far from city — use city center instead
        console.warn(`Geocode validation failed for "${name}" in ${city}: result (${resultLat}, ${resultLng}) is ${dist.toFixed(1)} deg from city center. Using city center.`);
        return { lat: round(cityLat), lng: round(cityLng), approximate: true, level: 'city' };
      }
    }

    return { lat: round(resultLat), lng: round(resultLng), approximate: false, level: 'exact' };
  } catch {
    if (cityLat !== null && cityLng !== null) {
      return { lat: round(cityLat), lng: round(cityLng), approximate: true, level: 'city' };
    }
    return countryFallback();
  }
}
