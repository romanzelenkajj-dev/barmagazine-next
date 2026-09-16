/**
 * Geocode dry run for a wave file: runs the real address-first geocoder
 * (src/lib/geocode.ts, 40 km guard) on every block and prints the method,
 * the point and its distance from the city centre. Writes nothing.
 *
 *   node scripts/run-wave-geocode-dry.mjs "Claude outputs/<wave>.md"
 */
import { geocodeBarDetailed, distanceKm, cityQuery } from '../src/lib/geocode';

declare const process: { argv: string[]; env: Record<string, string | undefined>; exit(code: number): never };

async function centre(city: string, country: string, address: string | null): Promise<[number, number] | null> {
  const q = cityQuery({ address, city, country });
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=1&types=place`
  );
  const d = await res.json();
  const c = d.features?.[0]?.center;
  return c ? [c[1], c[0]] : null;
}

async function main() {
  const blocks = JSON.parse(process.argv[2] || '[]') as { slug: string; fields: Record<string, string> }[];
  for (const b of blocks) {
    const f = b.fields;
    const country = f.country || 'United States';
    const r = await geocodeBarDetailed({ name: f.name, address: f.address || null, city: f.city, country });
    const c = await centre(f.city, country, f.address || null);
    const dist = r && c ? distanceKm(r.lat, r.lng, c[0], c[1]).toFixed(1) : '?';
    console.log(`${b.slug.padEnd(26)} ${r ? `${r.method.padEnd(11)} ${r.lat}, ${r.lng}  ${dist} km from ${f.city}` : 'NO RESULT'}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
