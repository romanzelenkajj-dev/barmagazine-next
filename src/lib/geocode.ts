import { subdivisionCode, usesSubdivision } from './city-location';

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
 * Great-circle distance in km. The validation below used to compare raw
 * degrees with Pythagoras, which is wrong twice over: a degree of longitude
 * is only ~111km at the equator and shrinks to nothing at the poles, and
 * mixing it with latitude gives a number that means different distances in
 * different places.
 */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * How far from its city a geocode result may land before we distrust it.
 *
 * The old tolerance was 1.8 degrees, roughly 200km, which is wider than most
 * countries' metro areas and let a Ho Chi Minh City bar land 61km out in
 * another province without complaint. An audit of all 1,162 active bars with
 * coordinates put the furthest DEFENSIBLE outliers at ~31km (Ubud against a
 * Bali centre, Dona Paula against Goa, Dubai Marina against Dubai), so 40km
 * keeps real metro sprawl while catching genuine errors.
 *
 * Exceeding it is not fatal: the caller falls back to the city centre, which
 * is imprecise but always in the right place.
 */
export const MAX_CITY_DISTANCE_KM = 40;

/**
 * The state or province the row can vouch for, from its own address
 * (anchored to the postcode, see subdivisionCode) or from a qualifier the
 * city string already carries ("Portland, Maine"). Null outside the US and
 * Canada, and null when neither source says.
 *
 * WHY THIS EXISTS (Drastic Measures, 2026-09-15): the city step used to ask
 * Mapbox for "Shawnee, United States" and got Shawnee, Oklahoma, the larger
 * namesake. The bounding box drawn around that centre then excluded the
 * bar's real Kansas address, so the address query returned nothing and the
 * row fell back to the wrong city's centre, 400km out, with no warning.
 * Every US city name with a namesake in another state was exposed to the
 * same failure. The address said "KS 66203" all along.
 */
export function stateHint(opts: { address?: string | null; city: string; country: string }): string | null {
  if (!usesSubdivision(opts.country)) return null;
  const fromAddress = subdivisionCode(opts.address, opts.country);
  if (fromAddress) return fromAddress;
  const qualifier = opts.city.split(',').slice(1).join(',').trim();
  return qualifier || null;
}

/** The city name without a qualifier the row carries ("Portland, Maine" -> "Portland"). */
export function bareCity(city: string): string {
  return city.split(',')[0].trim();
}

/** The query for the city centre: city, state where known, country. */
export function cityQuery(opts: { address?: string | null; city: string; country: string }): string {
  const state = stateHint(opts);
  return [bareCity(opts.city), state, opts.country].filter(Boolean).join(', ');
}

/**
 * The query for the bar itself, ADDRESS FIRST: the full street address as
 * stored, with the city, the state where derivable and the country appended
 * whenever the address does not already carry them. Nothing is dropped from
 * the address; the appends only make an incomplete one complete.
 */
export function addressQuery(opts: { address: string; city: string; country: string }): string {
  const address = opts.address.trim();
  const lower = address.toLowerCase();
  const parts = [address];
  const city = bareCity(opts.city);
  if (!lower.includes(city.toLowerCase())) parts.push(city);
  const state = stateHint(opts);
  if (state && !new RegExp(`\\b${state}\\b`).test(address)) parts.push(state);
  if (!lower.includes(opts.country.toLowerCase())) parts.push(opts.country);
  return parts.join(', ');
}

export type GeocodeMethod = 'address' | 'name' | 'city-centre';

export interface GeocodeResult {
  lat: number;
  lng: number;
  /** Which step produced the point: the street address, the name search, or the city centre fallback. */
  method: GeocodeMethod;
}

const round6 = (n: number) => Math.round(n * 1000000) / 1000000;

async function mapboxFirst(query: string, extra = ''): Promise<[number, number] | null> {
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1${extra}`
  );
  const data = await res.json();
  const center = data.features?.[0]?.center;
  if (!center) return null;
  const [lng, lat] = center;
  return [lat, lng];
}

/**
 * Geocode a bar's location with validation, reporting which step won.
 *
 * Order (Roman, 2026-09-15):
 *   1. City centre, from city + state (where derivable) + country, or the
 *      override table. This is the reference the 40km check is made against.
 *   2. The FULL STREET ADDRESS, unboxed, with city, state and country
 *      appended where missing. Accepted when within 40km of the city centre
 *      (or when no centre could be resolved).
 *   3. Only when the address returns nothing usable: name + city + country,
 *      boxed to ~50km around the city centre, with the same 40km check.
 *   4. The city centre itself, imprecise but in the right place.
 *
 * Returns null only with no token, or when nothing at all resolved.
 */
export async function geocodeBarDetailed(opts: {
  name: string;
  address?: string | null;
  city: string;
  country: string;
}): Promise<GeocodeResult | null> {
  if (!MAPBOX_TOKEN) return null;

  const { name, address, city, country } = opts;

  // Step 1: the city centre.
  let cityLat: number | null = null;
  let cityLng: number | null = null;
  if (CITY_OVERRIDES[city]) {
    [cityLat, cityLng] = CITY_OVERRIDES[city];
  } else {
    try {
      const c = await mapboxFirst(cityQuery(opts));
      if (c) [cityLat, cityLng] = c;
    } catch {
      // Fall through: no centre means no distance check, not a failure.
    }
  }
  const nearCity = (lat: number, lng: number): boolean =>
    cityLat === null || cityLng === null || distanceKm(lat, lng, cityLat, cityLng) <= MAX_CITY_DISTANCE_KM;
  const centre = (): GeocodeResult | null =>
    cityLat !== null && cityLng !== null ? { lat: round6(cityLat), lng: round6(cityLng), method: 'city-centre' } : null;

  // Step 2: the street address, unboxed.
  if (address && address.trim()) {
    try {
      const r = await mapboxFirst(addressQuery({ address, city, country }));
      if (r && nearCity(r[0], r[1])) return { lat: round6(r[0]), lng: round6(r[1]), method: 'address' };
      if (r) {
        console.warn(
          `Geocode: address result for "${name}" (${address}) is ${Math.round(distanceKm(r[0], r[1], cityLat!, cityLng!))}km from ${cityQuery(opts)}; trying the name search.`
        );
      }
    } catch {
      // Fall through to the name search.
    }
  }

  // Step 3: name + city + country, boxed to the city.
  try {
    const bbox =
      cityLat !== null && cityLng !== null
        ? `&bbox=${cityLng - 0.5},${cityLat - 0.5},${cityLng + 0.5},${cityLat + 0.5}`
        : '';
    const r = await mapboxFirst(`${name} bar, ${cityQuery(opts)}`, bbox);
    if (r && nearCity(r[0], r[1])) return { lat: round6(r[0]), lng: round6(r[1]), method: 'name' };
    if (r) {
      console.warn(
        `Geocode validation failed for "${name}" in ${city}: result (${r[0]}, ${r[1]}) is ${Math.round(distanceKm(r[0], r[1], cityLat!, cityLng!))}km from city center (max ${MAX_CITY_DISTANCE_KM}km). Using city center.`
      );
    }
  } catch {
    // Fall through to the centre.
  }

  // Step 4: the city centre.
  return centre();
}

/**
 * Geocode a bar's location with validation.
 * Returns { lat, lng } or null if geocoding fails.
 */
export async function geocodeBar(opts: {
  name: string;
  address?: string | null;
  city: string;
  country: string;
}): Promise<{ lat: number; lng: number } | null> {
  const r = await geocodeBarDetailed(opts);
  return r ? { lat: r.lat, lng: r.lng } : null;
}
