#!/usr/bin/env node
/**
 * geocode-backfill.mjs — pinpoint bars correctly on the map.
 *
 * Finds bars whose coordinates are MISSING or sitting on a shared
 * city-centroid (3+ bars with identical rounded coords), geocodes them
 * via Mapbox with sanity checks, and writes:
 *   scripts/geocode-updates.sql   — UPDATE statements (apply via Supabase)
 *   scripts/geocode-report.json   — what was fixed / skipped / flagged
 *
 * Makes NO database writes itself. Idempotent — safe to re-run after
 * each enrichment wave (newly added addresses get picked up).
 *
 * Needs env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
 *            NEXT_PUBLIC_MAPBOX_TOKEN  (all read from .env.local / .env)
 *
 * Run: node scripts/geocode-backfill.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// --- load env from .env.local / .env (no dotenv dep) ---
for (const f of ['.env.local', '.env']) {
  const p = resolve(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const MAPBOX = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (!SUPA_URL || !SUPA_KEY) { console.error('Missing Supabase env'); process.exit(1); }
if (!MAPBOX) { console.error('Missing NEXT_PUBLIC_MAPBOX_TOKEN'); process.exit(1); }

// Same overrides as src/lib/geocode.ts
const CITY_OVERRIDES = {
  'Hong Kong': [22.28, 114.16], 'Macau': [22.2, 113.55], 'Shenzhen': [22.54, 114.05],
  'Guangzhou': [23.13, 113.26], 'Bali': [-8.41, 115.19], 'Goa': [15.5, 73.83],
  'Hiriketiya': [5.95, 80.53], 'Grand Cayman': [19.29, -81.37], 'Shanghai': [31.23, 121.47],
  'Taipei': [25.03, 121.57], 'Kaohsiung': [22.62, 120.31],
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
const km = (a, b, c, d) => {
  const R = 6371, dLa = (c - a) * Math.PI / 180, dLo = (d - b) * Math.PI / 180;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

async function fetchAllBars() {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${SUPA_URL}/rest/v1/bars?select=id,name,address,city,country,lat,lng&is_active=eq.true&order=id`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, Range: `${from}-${from + 999}` },
    });
    if (!res.ok) throw new Error(`Supabase read failed: ${res.status}`);
    const rows = await res.json();
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

async function geocode(query, cityCenter) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX}&limit=1&types=address,poi` +
    (cityCenter ? `&proximity=${cityCenter[1]},${cityCenter[0]}` : '');
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const f = data.features?.[0];
  if (!f) return null;
  return { lat: f.center[1], lng: f.center[0], relevance: f.relevance ?? 0, type: f.place_type?.[0] ?? '' };
}

async function cityCenter(city, country, cache) {
  const key = `${city}|${country}`;
  if (cache.has(key)) return cache.get(key);
  let c = CITY_OVERRIDES[city] ?? null;
  if (!c) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(`${city}, ${country}`)}.json?access_token=${MAPBOX}&limit=1&types=place`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const f = data.features?.[0];
      if (f) c = [f.center[1], f.center[0]];
    }
    await sleep(120);
  }
  cache.set(key, c);
  return c;
}

const bars = await fetchAllBars();
console.log(`${bars.length} active bars loaded`);

// Targets: missing coords, or member of a 3+ cluster on identical rounded coords.
const clusters = new Map();
for (const b of bars) {
  if (b.lat == null || b.lng == null) continue;
  const k = `${b.city}|${Number(b.lat).toFixed(4)}|${Number(b.lng).toFixed(4)}`;
  clusters.set(k, (clusters.get(k) ?? 0) + 1);
}
const isCentroid = b => b.lat != null &&
  (clusters.get(`${b.city}|${Number(b.lat).toFixed(4)}|${Number(b.lng).toFixed(4)}`) ?? 0) >= 3;
const targets = bars.filter(b => b.lat == null || b.lng == null || isCentroid(b));
console.log(`${targets.length} bars need real coordinates (${bars.filter(b => b.lat == null).length} missing, rest on shared city-centroids)`);

const cache = new Map();
const updates = [], flagged = [], skipped = [];

for (let i = 0; i < targets.length; i++) {
  const b = targets[i];
  const center = await cityCenter(b.city, b.country, cache);
  let hit = null, source = '';

  if (b.address) {
    hit = await geocode(`${b.address}, ${b.city}, ${b.country}`, center);
    source = 'address';
    await sleep(120);
  }
  if ((!hit || hit.relevance < 0.75) && b.name) {
    const poi = await geocode(`${b.name}, ${b.city}, ${b.country}`, center);
    await sleep(120);
    if (poi && poi.type === 'poi' && poi.relevance >= 0.8 && (!hit || poi.relevance > hit.relevance)) {
      hit = poi; source = 'poi';
    }
  }

  if (!hit) { skipped.push({ id: b.id, name: b.name, city: b.city, reason: 'no match' }); continue; }
  const dist = center ? km(center[0], center[1], hit.lat, hit.lng) : null;
  const strict = hit.relevance >= 0.75;
  // Relaxed tier: Mapbox scores many valid South/Southeast Asian addresses
  // below 0.75. Accept >=0.5 ONLY when the bar has a verified street address
  // and the result lands within 25km of the city center.
  const relaxed = !strict && !!b.address && source === 'address' && hit.relevance >= 0.5;
  if (!strict && !relaxed) { skipped.push({ id: b.id, name: b.name, city: b.city, reason: `low confidence (${hit.relevance})` }); continue; }
  const maxKm = strict ? 35 : 25;
  if (dist != null && dist > maxKm) {
    flagged.push({ id: b.id, name: b.name, city: b.city, got: [hit.lat, hit.lng], reason: `>${maxKm}km from city center — NOT applied` });
    continue;
  }
  updates.push({ id: b.id, name: b.name, city: b.city, lat: hit.lat, lng: hit.lng, source: strict ? source : `${source}-relaxed`, relevance: hit.relevance });
  if ((i + 1) % 25 === 0) console.log(`${i + 1}/${targets.length} processed, ${updates.length} resolved`);
}

const sql = ['BEGIN;'];
for (const u of updates) sql.push(`UPDATE bars SET lat=${u.lat}, lng=${u.lng} WHERE id='${u.id}';`);
sql.push('COMMIT;');
writeFileSync(resolve(ROOT, 'scripts/geocode-updates.sql'), sql.join('\n'));
writeFileSync(resolve(ROOT, 'scripts/geocode-report.json'), JSON.stringify({
  generated: new Date().toISOString(),
  targets: targets.length, resolved: updates.length, skipped: skipped.length, flagged: flagged.length,
  bySource: { address: updates.filter(u => u.source === 'address').length, poi: updates.filter(u => u.source === 'poi').length, relaxed: updates.filter(u => u.source.endsWith('-relaxed')).length },
  relaxedDetail: updates.filter(u => u.source.endsWith('-relaxed')),
  flaggedDetail: flagged, skippedDetail: skipped,
}, null, 2));
console.log(`DONE: ${updates.length} coordinate fixes written to scripts/geocode-updates.sql`);
console.log(`skipped (no confident match): ${skipped.length}, flagged (failed sanity check): ${flagged.length}`);
console.log('Report: scripts/geocode-report.json — apply the SQL via the cloud session (Supabase MCP).');
