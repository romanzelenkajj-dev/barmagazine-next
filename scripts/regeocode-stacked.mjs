/**
 * One-off: re-geocode the bars that fell back to a city centroid.
 *
 * THE BUG THIS WORKS AROUND. geocodeBarDetailed() validates a geocode result
 * by DISTANCE only: is it within MAX_CITY_DISTANCE_KM of the city centre? A
 * Mapbox `place` feature for "Shanghai" is zero km from Shanghai's centre, so
 * it passes, and gets stored as though it were a street address. Seven cities
 * collapsed that way, every bar in them on one point.
 *
 * So this script adds the check that was missing: the result must be
 * GRANULAR ENOUGH. Mapbox tags every feature with place_type; only `address`
 * and `poi` are a location. `region`, `place`, `locality`, `district` and
 * `neighborhood` are areas, and an area is not where a bar is.
 *
 * And a second source, because Macau has no Mapbox street data at all (every
 * query answers with Brazil, Australia or Belgium). OpenStreetMap covers it
 * well. Note OSM files Macau under China, so a countrycodes=mo filter returns
 * nothing; the filter is deliberately not used.
 *
 * Usage: node scripts/regeocode-stacked.mjs <file.json> [--apply]
 * where the file is [{slug, name, city, country, address}, ...].
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
for (const line of fs.readFileSync(path.join(root, '.env.vercel'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
}
const U = process.env.NEXT_PUBLIC_SUPABASE_URL;
const K = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MB = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const H = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const file = args.find(a => !a.startsWith('--'));

/** Only these are a place a bar can be. Everything else is an area. */
const PRECISE = new Set(['address', 'poi']);

/**
 * How far a corrected point may sit from the centroid it is replacing. The
 * centroid IS the city, so anything beyond this is a different city.
 */
const MAX_MOVE_KM = 50;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function haversineKm(a, b, c, d) {
  const R = 6371, t = x => (x * Math.PI) / 180;
  const dLat = t(c - a), dLon = t(d - b);
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(q));
}

async function mapbox(query) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MB}&limit=1`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = await r.json();
  const f = (j.features || [])[0];
  if (!f) return null;
  const types = f.place_type || [];
  // THE CHECK THAT WAS MISSING.
  if (!types.some(t => PRECISE.has(t))) return { rejected: types.join(',') };
  return { lat: f.center[1], lng: f.center[0], types: types.join(','), label: f.place_name, source: 'mapbox' };
}

/**
 * OSM classes that are a location. The SAME granularity rule as the Mapbox
 * path, or the fallback quietly reintroduces the bug it exists to avoid:
 * `boundary/administrative` is the Ginza polygon, and accepting it just swaps
 * one area centroid for another.
 *
 * A `highway` hit is a street centroid. Not the building, but on the right
 * street, which is a real improvement over the city centre and is recorded as
 * such rather than passed off as exact.
 */
const OSM_PRECISE = new Set(['amenity', 'shop', 'tourism', 'building', 'place_house', 'office', 'leisure']);
const OSM_STREET = new Set(['highway']);

async function osm(query) {
  // No countrycodes filter: OSM files Macau under CN and the filter returns
  // nothing for it.
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'BarMagazine-geocode/1.0 (office@barmagazine.com)' } });
  if (!r.ok) return null;
  const j = await r.json();
  const f = (j || [])[0];
  if (!f) return null;
  const cls = f.class || '';
  const hasNumber = !!(f.address && f.address.house_number);
  let grain = null;
  if (hasNumber || OSM_PRECISE.has(cls)) grain = 'exact';
  else if (OSM_STREET.has(cls)) grain = 'street';
  if (!grain) return { rejected: `osm ${cls}/${f.type || ''}` };
  return { lat: Number(f.lat), lng: Number(f.lon), types: `${cls}/${f.type || ''}:${grain}`, label: f.display_name, source: 'osm', grain };
}

const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
const results = [];
let precise = 0, refused = 0;

for (const b of rows) {
  if (!b.address) { console.log(`  SKIP  ${b.slug}: no address to geocode`); refused++; continue; }
  const q = `${b.address}, ${b.city}, ${b.country}`;
  let hit = await mapbox(q);
  let note = '';
  if (hit && hit.rejected) { note = `mapbox gave [${hit.rejected}], too coarse`; hit = null; }
  if (!hit) {
    await sleep(1200);
    hit = await osm(q);
    if (hit && hit.rejected) { note = `${note}; ${hit.rejected}, too coarse`; hit = null; }
    else if (hit) note = note ? `${note}; osm resolved it` : 'osm resolved it';
  }
  // A SHORTER QUERY, because both providers degrade on an over-specified
  // address. "Jl. Senopati No. 79, Selong, Kebayoran Baru, Jakarta" returns a
  // neighbourhood; "Jl. Senopati No. 79, Jakarta" returns the address. The
  // sub-district tokens are the problem, so drop the middle of the address
  // and keep the street line and the city.
  if (!hit) {
    const street = b.address.split(',')[0].trim();
    if (street && street !== b.address.trim()) {
      const short = `${street}, ${b.city}, ${b.country}`;
      await sleep(300);
      let h2 = await mapbox(short);
      if (h2 && h2.rejected) h2 = null;
      if (!h2) { await sleep(1200); h2 = await osm(short); if (h2 && h2.rejected) h2 = null; }
      if (h2) { hit = h2; note = `${note}; street line alone resolved it`; }
    }
  }
  // BOTH CHECKS, OR NEITHER IS WORTH HAVING. The original code validated
  // distance and not granularity, so a `place` feature for the city sailed
  // through. My first version of this script validated granularity and not
  // distance, and wrote three Jakarta bars to New Delhi because the shortened
  // query "Jl. Senopati No. 79" matched a real address 5,000 km away. A
  // result must be BOTH fine-grained AND in the right place.
  if (hit && b.lat != null && haversineKm(b.lat, b.lng, hit.lat, hit.lng) > MAX_MOVE_KM) {
    note = `${note}; result is ${Math.round(haversineKm(b.lat, b.lng, hit.lat, hit.lng))}km from the city, wrong place`;
    hit = null;
  }
  if (!hit) {
    console.log(`  REFUSE ${b.slug.padEnd(30)} ${note || 'no result from either source'}`);
    refused++;
    await sleep(300);
    continue;
  }
  const moved = b.lat != null ? haversineKm(b.lat, b.lng, hit.lat, hit.lng) : null;
  console.log(`  ${APPLY ? 'WRITE ' : 'would '}${b.slug.padEnd(30)} ${hit.lat.toFixed(6)},${hit.lng.toFixed(6)} [${hit.source}:${hit.types}]${moved != null ? ` moved ${moved.toFixed(2)}km` : ''}`);
  if (note) console.log(`         ${note}`);
  results.push({ ...b, newLat: hit.lat, newLng: hit.lng, source: hit.source, label: hit.label });
  precise++;
  if (APPLY) {
    const p = await fetch(`${U}/rest/v1/bars?slug=eq.${encodeURIComponent(b.slug)}`, {
      method: 'PATCH', headers: H,
      body: JSON.stringify({ lat: Number(hit.lat.toFixed(6)), lng: Number(hit.lng.toFixed(6)) }),
    });
    if (!p.ok) console.log(`         WRITE FAILED ${p.status} ${(await p.text()).slice(0, 120)}`);
  }
  await sleep(300);
}

fs.writeFileSync('/tmp/regeocode-results.json', JSON.stringify(results, null, 1));
console.log(`\n${APPLY ? 'applied' : 'dry run'}: ${precise} precise, ${refused} refused and left as they were`);
