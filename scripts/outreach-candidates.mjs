#!/usr/bin/env node
/**
 * Who is left to contact, and who is deliberately not.
 *
 * Every batch before this one was assembled by hand, which is why the same
 * three exclusions kept being re-derived slightly differently. This prints one
 * list from one definition so a batch can be rebuilt and checked.
 *
 *   node scripts/outreach-candidates.mjs            # bars WITH an email
 *   node scripts/outreach-candidates.mjs --no-email # bars WITHOUT one
 *   node scripts/outreach-candidates.mjs --json     # machine-readable
 *
 * A candidate is active, unclaimed, not already contacted, not parked and not
 * opted out. Ordered by country, then city, then slug.
 *
 * PAGES EVERY READ. PostgREST caps a response at 1000 rows and says nothing
 * about it, so an unpaged read of `bars` silently drops a third of the
 * directory. Paging is on `slug`, which is unique, rather than on offset,
 * which drifts when rows change underneath the walk.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

for (const f of ['.env.local', '.env.vercel']) {
  const p = resolve(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPA_URL || !SUPA_KEY) { console.error('Missing Supabase env'); process.exit(1); }

const wantNoEmail = process.argv.includes('--no-email');
const asJson = process.argv.includes('--json');

/** Slugs listed in a `# comment` + `slug  # reason` file. */
function slugFile(name) {
  const p = resolve(ROOT, 'outreach', name);
  const out = new Map();
  if (!existsSync(p)) return out;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const slug = trimmed.split(/\s+/)[0];
    const hash = trimmed.indexOf('#');
    out.set(slug, hash > -1 ? trimmed.slice(hash + 1).trim() : '');
  }
  return out;
}

/** Addresses that asked never to be mailed again. Matched case-insensitively. */
function optoutAddresses() {
  const p = resolve(ROOT, 'outreach/optout.txt');
  const out = new Set();
  if (!existsSync(p)) return out;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    out.add(t.toLowerCase());
  }
  return out;
}

/**
 * Slugs already committed to a send window but not yet mailed.
 *
 * WHY THIS IS NOT THE SAME AS THE SENT LOG. A batch is armed days before it
 * fires, and nothing is written to sent-log.txt until the mail is actually
 * accepted. Between arming and firing those bars are invisible to a
 * sent-log-only check, so they turn up as fresh candidates and get built into
 * the NEXT batch as well. On 2026-09-21 that was 88 of 220: the whole of the
 * armed Tue/Wed/Thu batch 17.
 *
 * The duplicate guard in send-upsell.mjs would have caught it at the moment of
 * sending, so nobody would have been mailed twice. The damage is quieter than
 * that: the list Roman eyeballs would have been wrong, and the batch would
 * have shrunk by 88 on the night without anyone deciding that it should.
 *
 * COMMITTED MEANS ARMED, NOT MERELY LISTED. A .slugs file counts only when a
 * runner script actually references it. The first version of this counted
 * every .slugs file on disk, which made the script eat its own output: writing
 * the batch 18 lists and re-running it returned zero candidates, because the
 * lists it had just produced now looked like a pending send. A list nobody has
 * armed is a draft, and a draft must not exclude anything.
 *
 * Spent batches keep their runners and stay in this set, which costs nothing:
 * everything in them is in the sent log anyway.
 */
function committedSlugs() {
  const dir = resolve(ROOT, 'outreach');
  const out = new Set();
  if (!existsSync(dir)) return out;
  const files = readdirSync(dir);
  const runners = files
    .filter(f => f.endsWith('.sh'))
    .map(f => readFileSync(resolve(dir, f), 'utf8'))
    .join('\n');
  for (const f of files) {
    if (!f.endsWith('.slugs')) continue;
    if (!runners.includes(f)) continue; // a draft list, not an armed one
    for (const s of readFileSync(resolve(dir, f), 'utf8').split(/\s+/)) {
      if (s && !s.startsWith('#')) out.add(s);
    }
  }
  return out;
}

/** Every slug already mailed, from the same log the send script writes. */
function sentSlugs() {
  const p = resolve(ROOT, 'outreach/sent-log.txt');
  const out = new Set();
  if (!existsSync(p)) return out;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const slug = t.split('\t')[0];
    if (slug) out.add(slug);
  }
  return out;
}

async function api(path) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status} on ${path.slice(0, 80)}`);
  return res.json();
}

/** Keyset walk over a unique column, so nothing is dropped or repeated. */
async function pageAll(select, filters) {
  const rows = [];
  let last = '';
  for (;;) {
    const after = last ? `&slug=gt.${encodeURIComponent(last)}` : '';
    const page = await api(`bars?select=${select}&${filters}&order=slug.asc&limit=1000${after}`);
    if (!page.length) break;
    rows.push(...page);
    last = page[page.length - 1].slug;
    if (page.length < 1000) break;
  }
  return rows;
}

const parked = slugFile('parked.txt');
const optout = optoutAddresses();
const sent = sentSlugs();
const committed = committedSlugs();

const bars = await pageAll(
  'slug,name,email,city,country,state,claimed_at,owner_id,tier,website',
  'is_active=eq.true'
);

// Claims live in their own table as well as on the row: a claim can be in
// flight before it writes claimed_at, and mailing an upsell to somebody
// mid-claim is the worst moment to do it.
const claims = await api('bar_claims?select=bar_id,status');
const claimedBarIds = new Set(claims.map(c => c.bar_id));
const byId = await pageAll('id,slug', 'is_active=eq.true');
const idToSlug = new Map(byId.map(r => [r.id, r.slug]));
const claimedSlugs = new Set();
claimedBarIds.forEach(id => { const s = idToSlug.get(id); if (s) claimedSlugs.add(s); });

const reasons = new Map();
const keep = [];
for (const b of bars) {
  const email = String(b.email || '').trim();
  const has = email.length > 0;
  if (wantNoEmail ? has : !has) { reasons.set(b.slug, has ? 'has an email' : 'no email on file'); continue; }
  if (sent.has(b.slug)) { reasons.set(b.slug, 'already contacted'); continue; }
  if (committed.has(b.slug)) { reasons.set(b.slug, 'armed in a pending send window'); continue; }
  if (parked.has(b.slug)) { reasons.set(b.slug, `parked: ${parked.get(b.slug) || 'no reason recorded'}`); continue; }
  if (b.claimed_at || b.owner_id || claimedSlugs.has(b.slug)) { reasons.set(b.slug, 'claimed'); continue; }
  if (has && optout.has(email.toLowerCase())) { reasons.set(b.slug, 'opted out'); continue; }
  keep.push(b);
}

keep.sort((a, b) =>
  String(a.country).localeCompare(String(b.country))
  || String(a.city).localeCompare(String(b.city))
  || a.slug.localeCompare(b.slug));

if (asJson) {
  console.log(JSON.stringify(keep, null, 2));
} else {
  const excluded = {};
  reasons.forEach(r => { const k = r.startsWith('parked:') ? 'parked' : r; excluded[k] = (excluded[k] || 0) + 1; });
  console.log(`active bars: ${bars.length}`);
  console.log(`candidates (${wantNoEmail ? 'NO email' : 'with email'}, unclaimed, uncontacted, unparked): ${keep.length}\n`);
  console.log('excluded:');
  Object.entries(excluded).sort((a, b) => b[1] - a[1]).forEach(([r, n]) => console.log(`  ${String(n).padStart(5)}  ${r}`));
  const byCountry = {};
  keep.forEach(b => { byCountry[b.country] = (byCountry[b.country] || 0) + 1; });
  console.log('\nby country:');
  Object.entries(byCountry).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => console.log(`  ${String(n).padStart(5)}  ${c}`));
}
