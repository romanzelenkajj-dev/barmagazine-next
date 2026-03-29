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

/**
 * Geocode a bar's location with validation.
 * Uses city bounding box to prevent results in wrong countries.
 * Returns { lat, lng } or null if geocoding fails.
 */
export async function geocodeBar(opts: {
  name: string;
  address?: string | null;
  city: string;
  country: string;
}): Promise<{ lat: number; lng: number } | null> {
  if (!MAPBOX_TOKEN) return null;

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
      // Fallback to city center
      if (cityLat !== null && cityLng !== null) {
        return { lat: Math.round(cityLat * 1000000) / 1000000, lng: Math.round(cityLng * 1000000) / 1000000 };
      }
      return null;
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
        return { lat: Math.round(cityLat * 1000000) / 1000000, lng: Math.round(cityLng * 1000000) / 1000000 };
      }
    }

    return {
      lat: Math.round(resultLat * 1000000) / 1000000,
      lng: Math.round(resultLng * 1000000) / 1000000,
    };
  } catch {
    if (cityLat !== null && cityLng !== null) {
      return { lat: cityLat, lng: cityLng };
    }
    return null;
  }
}
