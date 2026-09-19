#!/usr/bin/env node
/**
 * Insert a verified wave file through /api/admin/manage-bar (action create),
 * one row per block. DRY RUN BY DEFAULT: prints every payload and writes
 * nothing. Add --apply to insert (only after Roman's go in chat).
 *
 *   node scripts/wave-insert.mjs "Claude outputs/<wave>.md" [--apply] [--only slug,slug]
 *
 * Blocks with "status: HOLD" are skipped. The create path geocodes
 * address-first and derives bars.state itself; "accolade:" lines become
 * the accolades array ("org year, title (Stage)" per entry, ";"-separated).
 * ADMIN_SECRET comes from .env.vercel.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseWaveFile, loadEnv } from './wave-file.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
const apply = args.includes('--apply');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? new Set(args[onlyIdx + 1].split(',')) : null;
if (!file) { console.error('usage: node scripts/wave-insert.mjs <wave file> [--apply]'); process.exit(2); }

const { ADMIN_SECRET } = loadEnv(path.join(root, '.env.vercel'), ['ADMIN_SECRET']);
const BASE = process.env.BASE_URL || 'https://barmagazine.com';

const ORG = {
  totc: { name: 'Tales of the Cocktail Spirited Awards', nominee: 590, winner: 810 },
  jbf: { name: 'James Beard Awards', nominee: 200, winner: 350 },
};

/** "org year, Title (Stage); org year, Title" -> the stored accolade shape
    (org display name, org_key, kind, rank, year, score, title, source). */
function parseAccolades(line, source) {
  if (!line || /^none\b/i.test(line)) return null;
  const out = [];
  for (const part of line.split(';')) {
    const m = /^\s*([a-z0-9]+)\s+(\d{4}),\s*(.+?)\s*$/.exec(part);
    if (!m) throw new Error(`accolade line not understood: "${part}"`);
    const [, key, year, rawTitle] = m;
    const org = ORG[key];
    if (!org) throw new Error(`no rule for org ${key}`);
    const winner = /\(winner\)/i.test(rawTitle);
    const kind = winner ? 'winner' : 'nominee';
    const title = winner ? rawTitle.replace(/\s*\(winner\)\s*$/i, '') : rawTitle;
    out.push({ org: org.name, org_key: key, kind, rank: null, year: Number(year), score: org[kind], title, source: source || null });
  }
  return out;
}

const none = v => !v || /^none\b/i.test(v);

/**
 * "name | url; name | url" -> the stored bars.editorial_sources shape.
 *
 * This is what admitted the bar, and it is NEVER an accolade: nothing here is
 * written to bars.accolades, scored by bestAccolade or rendered as a tile. It
 * feeds level2Reason, which only counts a source that made a real SELECTION.
 *
 * The first entry is the admitting source; any others are corroboration.
 */
function parseEditorialSources(line) {
  if (none(line)) return null;
  const out = [];
  for (const part of String(line).split(';')) {
    const [rawName, rawUrl] = part.split('|');
    const source = (rawName || '').trim();
    if (!source) continue;
    const url = (rawUrl || '').trim() || null;
    // A year is recorded only when the source names one itself. Guessing the
    // current year would date a list that never claimed to be annual.
    const m = source.match(/\b(19|20)\d{2}\b/);
    out.push({
      source,
      url,
      note: out.length === 0 ? 'admitting source' : 'also listed',
      year: m ? Number(m[0]) : null,
    });
  }
  return out.length ? out : null;
}

const blocks = parseWaveFile(path.resolve(root, file)).filter(b => !only || only.has(b.slug));
let created = 0;
for (const b of blocks) {
  const f = b.fields;
  if (/^HOLD/i.test(f.status || '')) { console.log(`SKIP ${b.slug}: ${f.status}`); continue; }
  const payload = {
    slug: b.slug,
    name: f.name,
    city: f.city,
    country: f.country || 'United States',
    address: none(f.address) ? null : f.address,
    neighborhood: none(f.neighborhood) ? null : f.neighborhood,
    website: none(f.website) ? null : f.website,
    opening_hours: none(f.hours) ? null : f.hours,
    phone: none(f.phone) ? null : f.phone,
    email: none(f.email) ? null : f.email,
    instagram: none(f.instagram) ? null : f.instagram,
    type: f.type || 'Cocktail Bar',
    subtypes: none(f.subtypes) ? null : f.subtypes.split(',').map(x => x.trim()).filter(Boolean),
    reservation_url: none(f.reservation_url) ? null : f.reservation_url,
    description: f.description,
    accolades: parseAccolades(f.accolade, none(f.accolade_source) ? null : f.accolade_source),
    editorial_sources: parseEditorialSources(f.editorial_sources),
    is_active: true,
    tier: 'free',
    admin_notes: none(f.venue) ? null : `Venue: ${f.venue}. Source: ${f.source || 'venue site'}.`,
  };
  if (!apply) { console.log(JSON.stringify(payload, null, 1)); continue; }
  const res = await fetch(`${BASE}/api/admin/manage-bar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET },
    body: JSON.stringify({ action: 'create', updates: payload }),
  });
  const d = await res.json().catch(() => ({}));
  const row = d.created?.[0];
  if (!res.ok || !row) { console.error(`FAILED ${b.slug}: ${res.status} ${JSON.stringify(d).slice(0, 200)}`); continue; }
  created++;
  console.log(`created ${b.slug} id=${row.id} state=${row.state} lat=${row.lat} lng=${row.lng}`);
}
console.log(apply ? `created ${created} of ${blocks.length}` : `dry run: ${blocks.length} payload(s) printed, nothing written`);
