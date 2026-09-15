#!/usr/bin/env node
/**
 * backfill-state.mjs: fill bars.state for every US and Canadian row.
 *
 * The state (two-letter code) is derived once from the address postcode
 * line, the same anchored rule as subdivisionCode in src/lib/city-location.ts
 * ("KS 66203", "ON M5V 2T6"), or from a qualifier the city string carries
 * ("Portland, Maine"). Rows that yield nothing are listed for a hand fix
 * (HAND below) and never guessed.
 *
 * Writes go straight to the REST endpoint with the service key: a state
 * backfill is not a visible change on the row, so updated_at is left alone
 * (the sitemap's lastmod would otherwise report ~500 profiles modified).
 * The city index is purged by the one manage-bar write the caller makes
 * afterwards.
 *
 * Run: node scripts/backfill-state.mjs [--apply]
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const f of ['.env.local', '.env']) {
  const p = resolve(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing');
const APPLY = process.argv.includes('--apply');
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const US = new Set('AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' '));
const CA = new Set('AB BC MB NB NL NS NT NU ON PE QC SK YT'.split(' '));
const US_NAMES = { Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY' };

/** Same rule as subdivisionCode: anchored to the postcode. */
function derive(address, city, country) {
  if (country === 'Canada') {
    const m = /\b([A-Z]{2})[,\s]+[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/.exec(address || '');
    if (m && CA.has(m[1])) return m[1];
  } else {
    const m = /\b([A-Z]{2})[,\s]+\d{5}(?:-\d{4})?\b/.exec(address || '');
    if (m && US.has(m[1])) return m[1];
    if (/\bWashington,?\s+DC\b/i.test(address || '') || /^Washington DC$/i.test(city || '')) return 'DC';
  }
  const q = (city || '').split(',').slice(1).join(',').trim();
  if (q) {
    if (US.has(q.toUpperCase())) return q.toUpperCase();
    if (US_NAMES[q]) return US_NAMES[q];
  }
  return null;
}

/**
 * Hand fixes for rows whose address carries no state line, from the venue's
 * own address (the city alone settles every one of these; none is a
 * namesake). Slug -> state.
 */
const HAND = {};

async function all() {
  const rows = [];
  for (let off = 0; ; off += 1000) {
    const r = await fetch(`${URL}/rest/v1/bars?select=id,slug,city,country,address,state,is_active&or=(country.eq.United%20States,country.eq.Canada)&order=slug&offset=${off}&limit=1000`, { headers: H });
    const b = await r.json();
    rows.push(...b);
    if (b.length < 1000) break;
  }
  return rows;
}

const rows = await all();
let set = 0, kept = 0, hand = 0;
const missing = [];
for (const r of rows) {
  const d = HAND[r.slug] || derive(r.address, r.city, r.country);
  if (!d) {
    missing.push(r);
    continue;
  }
  if (r.state === d) {
    kept++;
    continue;
  }
  if (HAND[r.slug]) hand++;
  if (APPLY) {
    const res = await fetch(`${URL}/rest/v1/bars?id=eq.${r.id}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify({ state: d }) });
    if (!res.ok) throw new Error(`${r.slug}: ${res.status} ${await res.text()}`);
  }
  set++;
}
console.log(`${rows.length} US/CA rows: ${set} ${APPLY ? 'set' : 'would set'} (${hand} by hand), ${kept} already right, ${missing.length} with no derivable state`);
for (const r of missing) console.log(`  MISSING ${r.slug.padEnd(30)} ${r.city.padEnd(16)} ${r.is_active ? 'active  ' : 'inactive'} ${r.address}`);
