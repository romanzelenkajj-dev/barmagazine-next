#!/usr/bin/env node
/**
 * Address-vs-city mismatch check, by NAME rather than by distance.
 *
 * Finds rows where the stored address text names a different city than the
 * row's own city field. Three real cases prompted this: Attaboy stored a
 * Nashville address on its New York row, Employees Only a Singapore address
 * on its New York row, and Cobbler & Crew a Pune address while filed under
 * Bengaluru.
 *
 * WHY NOT DISTANCE. The first attempt geocoded the address and measured how
 * far it landed from the city. It was retired because precision was zero:
 * every hit was a geocoder artifact, since ~200 of our addresses omit their
 * city and Mapbox then matches a same-named street on another continent
 * (Bar Basso's "Via Plinio 39" landing in Taranto, "65 Peel St" in the
 * Philippines). Appending the city made it worse in a new way, mapping every
 * Hong Kong bar onto "Hongtong Xian" in Shanxi. Names are the signal; the
 * distance was only ever a proxy for them.
 *
 * HOW IT WORKS
 *   1. Gazetteer: GeoNames cities5000 (~70k places), including its inline
 *      alternate-names column, so Bangalore/Bengaluru and Milano/Milan match.
 *   2. Candidates: the address is split on commas and each SEGMENT is tested
 *      whole. This is what kills street noise without a special case:
 *      "Calle Rio de Janeiro 56" is one segment and is not the city Rio de
 *      Janeiro, and "Victoria Dockside" is not the city Victoria.
 *   3. Self-consistency: if any segment names the row's OWN city (or one of
 *      its alternate names), the row is skipped. An address that agrees with
 *      its city field is not a mismatch, whatever else it mentions.
 *   4. Exclusions: a match is ignored when it is a PPLX (GeoNames' code for a
 *      section of a populated place, i.e. a neighborhood), when it sits
 *      within NEARBY_KM of the row's own city (a suburb or district), or when
 *      it is too small to plausibly be what an address means.
 *
 * USAGE
 *   node scripts/address-city-check.mjs              # report on live data
 *   node scripts/address-city-check.mjs --validate   # self-test, see below
 *   node scripts/address-city-check.mjs --json       # machine-readable
 *
 * --validate re-injects the three known mismatches IN MEMORY ONLY (the live
 * rows are long since fixed) and fails if the check does not catch all three.
 * Run it after any change to the matching rules.
 */

import { readFileSync, existsSync, mkdirSync, createWriteStream } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, '.cache');
const TXT = join(CACHE, 'cities5000.txt');
const SRC = 'https://download.geonames.org/export/dump/cities5000.zip';

/** A match closer than this to the row's own city is a district, not another city. */
const NEARBY_KM = 60;
/** Places smaller than this are too obscure to be what an address means. */
const MIN_POPULATION = 100000;
/** Report-only guidance: above this, the list is too long to read every run. */
const SCHEDULE_THRESHOLD = 30;

const args = new Set(process.argv.slice(2));
const asJson = args.has('--json');
const validate = args.has('--validate');

// ---------------------------------------------------------------- gazetteer

function ensureGazetteer() {
  if (existsSync(TXT)) return;
  mkdirSync(CACHE, { recursive: true });
  const zip = join(CACHE, 'cities5000.zip');
  console.error('[address-city-check] downloading GeoNames cities5000 (one time)...');
  execFileSync('curl', ['-sL', '-o', zip, SRC]);
  execFileSync('unzip', ['-o', '-q', zip, '-d', CACHE]);
}

const fold = s =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function loadGazetteer() {
  ensureGazetteer();
  /** canonical name -> entries. Used to MATCH address segments. */
  const byName = new Map();
  /** canonical + every alternate name -> entries. Used only to recognise
      the row's OWN city, where Bangalore/Bengaluru must both resolve.
      Alternates are useless for matching: GeoNames carries transliterations
      and historical names that collide with ordinary street words. */
  const byAnyName = new Map();
  const lines = readFileSync(TXT, 'utf8').split('\n');
  for (const line of lines) {
    if (!line) continue;
    const f = line.split('\t');
    const [, name, ascii, alts, lat, lng, , fcode, cc] = f;
    const pop = parseInt(f[14], 10) || 0;
    const entry = {
      name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      fcode,
      cc,
      pop,
    };
    for (const n of [name, ascii]) {
      const k = fold(n);
      if (k.length < 3) continue;
      let arr = byName.get(k);
      if (!arr) byName.set(k, (arr = []));
      arr.push(entry);
    }
    for (const n of [name, ascii, ...(alts ? alts.split(',') : [])]) {
      const k = fold(n);
      if (k.length < 3) continue;
      let arr = byAnyName.get(k);
      if (!arr) byAnyName.set(k, (arr = []));
      arr.push(entry);
    }
  }
  byName.anyName = byAnyName;
  return byName;
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const r = d => (d * Math.PI) / 180;
  const dLat = r(lat2 - lat1);
  const dLng = r(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Best gazetteer entry for a city the directory claims, preferring the
    largest place of that name in the right country. */
function resolveOwnCity(byName, city, countryCode) {
  const hits = byName.get(fold(city)) || [];
  if (!hits.length) return null;
  const inCountry = countryCode ? hits.filter(h => h.cc === countryCode) : [];
  const pool = inCountry.length ? inCountry : hits;
  return pool.reduce((a, b) => (b.pop > a.pop ? b : a));
}

/**
 * Address segments, cleaned. Postcodes, unit numbers and house numbers are
 * stripped so "Singapore 069932" tests as "Singapore", while a segment that
 * is only digits drops out entirely.
 */
/** Tokens that mark a segment as a STREET line rather than a city. */
const STREET_MARK = /\b(st|str|rd|ave|av|blvd|ln|dr|hwy|street|road|avenue|lane|drive|boulevard|way|alley|calle|via|rue|jalan|jl|strasse|gasse|place|sq|square|section|sec|floor|fl|suite|ste|unit|apt|building|bldg|shop|level|tower|block)\b/;
/** Tokens that mark a segment as a DISTRICT or ward rather than a city.
    Wards routinely share a name with a distant city: Taipei's Xinyi
    District against Xinyi in China, Osaka's Kita against Kita in Japan. */
const DISTRICT_MARK = /\b(ku|shi|cho|chome|district|ward|distrito|colonia|col|barrio|bairro|quan|phuong|gu|dong|nagar|sector|zone|precinct)\b/;

export function addressSegments(address) {
  return String(address || '')
    .split(/[,\n;]+/)
    .map(raw => raw.trim())
    // A name followed by a SHORT number is a street line in the many
    // languages that put the number last ("Turin 52", "Armenia 1540").
    // Five digits or more is a postcode, so "Singapore 069932" survives.
    .filter(raw => !/^\D+\s+\d{1,4}[A-Za-z]?$/.test(raw))
    .map(fold)
    // Tokens carrying a digit are house numbers, postcodes or unit codes.
    .map(seg => seg.split(' ').filter(t => t && !/\d/.test(t)).join(' '))
    // Marker test FIRST. The trailing-token strip below would otherwise eat
    // exactly the markers that identify a segment: "chuo ku" would become
    // "chuo" and "washington st" would become "washington", turning a ward
    // and a street into apparent cities.
    .filter(seg => !STREET_MARK.test(seg) && !DISTRICT_MARK.test(seg))
    // A trailing 1-2 letter token is a state or province code (NY, RJ, MI).
    // Only the trailing one: stripping every short token would break
    // multi-word city names, turning "rio de janeiro" into "rio janeiro".
    .map(seg => seg.replace(/\s+[a-z]{1,2}$/, '').trim())
    .filter(seg => seg.length >= 3);
}

/**
 * Flags reviewed and found correct. A check that reports the same two rows
 * every run stops being read, so a clean run must be zero.
 *
 * The suppression is bound to the exact address it was approved against. If
 * that address is edited, the reason no longer applies and the row is
 * reported LOUDLY as a stale allowlist entry rather than silently staying
 * quiet. A suppression must not outlive the thing it was reasoning about.
 */
const ALLOWLIST = {
  'dot-bar': {
    address: 'Floor 3, 75 Hai Bà Trưng, Bến Nghé, Quận 1',
    reason:
      'Hai Bà Trưng is a Ho Chi Minh City street named after the Trung Sisters. ' +
      'It is also a district of Hanoi, which is what the gazetteer matches.',
  },
  'canes-tales': {
    address: '5-54 Ofukacho, Kita',
    reason:
      'Kita is the Osaka ward the bar sits in. It shares its name with a city ' +
      'elsewhere in Japan, too far away for the local-reading rule to catch.',
  },
};

// ------------------------------------------------------------------- check

export function checkRow(row, byName, opts = {}) {
  const nearbyKm = opts.nearbyKm ?? NEARBY_KM;
  const minPop = opts.minPopulation ?? MIN_POPULATION;
  if (!row.address || !String(row.address).trim()) return null;

  const anyName = byName.anyName;
  const own = resolveOwnCity(anyName, row.city, row.countryCode);
  const ownKeys = new Set([fold(row.city)]);
  if (own) {
    // Every alternate name of the row's own city counts as naming itself.
    for (const [k, arr] of anyName) if (arr.includes(own)) ownKeys.add(k);
  }

  const segs = addressSegments(row.address);

  // Self-consistent: the address names its own city, so any other place name
  // in it is a street, a building or a venue, not a contradiction.
  if (segs.some(s => ownKeys.has(s))) return null;

  const flags = [];
  for (const seg of segs) {
    const hits = byName.get(seg);
    if (!hits) continue;

    // If ANY place of this name sits near the row's own city, that is what
    // the address means. Mexico City's Cuauhtemoc borough shares its name
    // with a city in Chihuahua, and Osaka's Kita ward with a city elsewhere
    // in Japan; without this the local reading loses to the distant one
    // purely because the distant one was listed first.
    if (own && hits.some(h => distanceKm(h.lat, h.lng, own.lat, own.lng) <= nearbyKm)) continue;

    for (const h of hits) {
      if (ownKeys.has(fold(h.name))) continue;
      if (h.fcode === 'PPLX') continue;            // a neighborhood
      if (h.pop < minPop) continue;                // too small to mean
      flags.push({ segment: seg, place: h.name, cc: h.cc, pop: h.pop });
      break;
    }
  }
  if (!flags.length) return null;
  // Report the largest place named, which is the most likely real city.
  flags.sort((a, b) => b.pop - a.pop);
  return { ...row, named: flags[0], allNamed: flags };
}

// -------------------------------------------------------------------- main

function env() {
  const out = {};
  for (const f of ['.env.local', '.env.vercel']) {
    try {
      for (const line of readFileSync(join(ROOT, f), 'utf8').split('\n')) {
        if (!line.includes('=')) continue;
        const k = line.slice(0, line.indexOf('=')).trim();
        const v = line.slice(line.indexOf('=') + 1).trim().replace(/^"|"$/g, '');
        if (!out[k]) out[k] = v;
      }
    } catch { /* optional */ }
  }
  return out;
}

async function fetchActiveBars(e) {
  const H = {
    apikey: e.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${e.SUPABASE_SERVICE_ROLE_KEY}`,
  };
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetch(
      `${e.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/bars?is_active=eq.true&select=slug,name,city,country,address&limit=1000&offset=${from}`,
      { headers: H }
    );
    const page = await res.json();
    rows.push(...page);
    if (page.length < 1000) break;
  }
  return rows;
}

/** GeoNames uses ISO country codes; our rows store country names. */
const CC = {
  'United States': 'US', 'United Kingdom': 'GB', India: 'IN', Singapore: 'SG',
  China: 'CN', Japan: 'JP', France: 'FR', Italy: 'IT', Spain: 'ES',
  Germany: 'DE', Mexico: 'MX', Canada: 'CA', Australia: 'AU', Brazil: 'BR',
  Argentina: 'AR', Thailand: 'TH', Vietnam: 'VN', 'South Korea': 'KR',
  Taiwan: 'TW', Netherlands: 'NL', Portugal: 'PT', Greece: 'GR',
  'Czech Republic': 'CZ', Poland: 'PL', Hungary: 'HU', Austria: 'AT',
  Switzerland: 'CH', Sweden: 'SE', Norway: 'NO', Denmark: 'DK',
  Ireland: 'IE', Belgium: 'BE', Turkey: 'TR', 'United Arab Emirates': 'AE',
  'South Africa': 'ZA', Colombia: 'CO', Peru: 'PE', Chile: 'CL',
  Indonesia: 'ID', Malaysia: 'MY', Philippines: 'PH', Serbia: 'RS',
  Croatia: 'HR', Slovakia: 'SK', Slovenia: 'SI', Romania: 'RO',
  Finland: 'FI', Iceland: 'IS', Uruguay: 'UY', 'Costa Rica': 'CR',
  'Puerto Rico': 'PR', Bahamas: 'BS', 'Cayman Islands': 'KY',
};

/** The three mismatches this check exists to catch, as they were stored. */
const KNOWN = [
  { slug: 'attaboy', city: 'New York', country: 'United States', address: '8 Mcferrin Ave, Nashville, TN 37206' },
  { slug: 'employees-only', city: 'New York', country: 'United States', address: '112 Amoy Street, Singapore 069932' },
  { slug: 'cobbler-crew', city: 'Bengaluru', country: 'India', address: 'Ground Floor Barons Club, North Ave, Kalyani Nagar, Pune' },
];

async function main() {
  const byName = loadGazetteer();
  const e = env();
  const live = await fetchActiveBars(e);
  const rows = live.map(r => ({ ...r, countryCode: CC[r.country] }));

  if (validate) {
    // Scratch copy only: overlay the old values in memory, never in the table.
    const scratch = rows.map(r => {
      const k = KNOWN.find(x => x.slug === r.slug);
      return k ? { ...r, city: k.city, country: k.country, countryCode: CC[k.country], address: k.address } : r;
    });
    const caught = new Set(
      scratch.map(r => checkRow(r, byName)).filter(Boolean).map(r => r.slug)
    );
    let ok = true;
    console.log('validation against the three known mismatches:');
    for (const k of KNOWN) {
      const hit = caught.has(k.slug);
      if (!hit) ok = false;
      console.log(`  ${hit ? 'CAUGHT ' : 'MISSED '} ${k.slug}  (${k.city} vs "${k.address}")`);
    }
    console.log(ok ? '\nPASS: all three caught.' : '\nFAIL: not ready.');
    process.exit(ok ? 0 : 1);
  }

  const raw = rows.map(r => checkRow(r, byName)).filter(Boolean);
  const flagged = [];
  const stale = [];
  for (const f of raw) {
    const allowed = ALLOWLIST[f.slug];
    if (!allowed) { flagged.push(f); continue; }
    if (allowed.address === f.address) continue; // reviewed, still true
    stale.push({ ...f, approvedFor: allowed.address, reason: allowed.reason });
  }
  // A stale suppression is worse than a flag: it is a flag someone decided
  // not to look at, for a reason that has since changed.
  for (const st of stale) flagged.push(st);
  if (asJson) {
    console.log(JSON.stringify(flagged, null, 1));
    return;
  }
  const withAddr = rows.filter(r => r.address && r.address.trim()).length;
  console.log(`active bars: ${rows.length} (${withAddr} with an address)`);
  console.log(`flagged: ${flagged.length}\n`);
  for (const f of flagged) {
    const isStale = Boolean(f.approvedFor);
    console.log(`  ${isStale ? 'STALE ALLOWLIST: ' : ''}${f.name} [${f.slug}]`);
    console.log(`     city field : ${f.city}, ${f.country}`);
    console.log(`     address    : ${f.address}`);
    console.log(`     names      : ${f.named.place} (${f.named.cc}, pop ${f.named.pop.toLocaleString()})`);
    if (isStale) {
      console.log(`     approved for: ${f.approvedFor}`);
      console.log(`     the address changed, so this suppression no longer holds: ${f.reason}`);
    }
  }
  const suppressed = Object.keys(ALLOWLIST).length - flagged.filter(f => f.approvedFor).length;
  if (suppressed > 0) console.log(`\n(${suppressed} reviewed row(s) suppressed by the allowlist.)`);
  console.log(
    `\n${flagged.length <= SCHEDULE_THRESHOLD
      ? `At ${flagged.length} this is short enough to run on a schedule.`
      : `At ${flagged.length} this is too long to read every run; keep it manual.`}`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
