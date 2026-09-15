#!/usr/bin/env node
/**
 * Active rows without coordinates. The profile hides the map when lat or
 * lng is null, so every add wave must end with this at zero (or a list to
 * geocode: POST /api/admin/geocode-bars {barIds, dryRun:true} first, then
 * write only address and name results; a city-centre result is a flag, not
 * a location).
 *
 *   npm run audit:coords
 *
 * Reads .env.local for the Supabase URL and service key. Pages the read; the
 * PostgREST cap is silent at 1,000 rows.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const line of readFileSync(path.join(root, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing');
  process.exit(2);
}

const rows = [];
for (let offset = 0; ; offset += 1000) {
  const res = await fetch(
    `${URL_}/rest/v1/bars?select=id,slug,name,city,country,address&is_active=eq.true&or=(lat.is.null,lng.is.null)&order=city,slug&offset=${offset}&limit=1000`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
  );
  if (!res.ok) {
    console.error(`Supabase ${res.status}: ${await res.text()}`);
    process.exit(2);
  }
  const page = await res.json();
  rows.push(...page);
  if (page.length < 1000) break;
}

console.log(`active rows without coordinates: ${rows.length}`);
for (const r of rows) {
  console.log(`  ${r.id}  ${r.slug}  (${r.city}, ${r.country})${r.address ? '' : '  no address'}`);
}
process.exit(rows.length === 0 ? 0 : 1);
