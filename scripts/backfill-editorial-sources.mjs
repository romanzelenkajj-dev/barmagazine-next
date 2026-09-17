/**
 * Backfill bars.editorial_sources from the wave reports.
 *
 * The admitting source for hundreds of bars exists only as prose in
 * "Claude outputs/*-verified.md" and in this session's research JSON. This
 * reads both, matches to rows by slug, and writes one entry per source.
 *
 * AN ADMISSION RECORD, NOT AN ACCOLADE. Nothing here is written to
 * bars.accolades, scored, or rendered as a tile. See
 * scripts/editorial-sources-migration.sql.
 *
 *   node scripts/backfill-editorial-sources.mjs            # dry run
 *   node scripts/backfill-editorial-sources.mjs --apply
 *
 * Requires the column to exist first; the dry run works without it.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/romanzelenka/barmagazine-next';
const OUT = path.join(ROOT, 'Claude outputs');
const RESEARCH = '/private/tmp/claude-501/-Users-romanzelenka-Desktop-barmagazine-work/6cbd5cdd-ea84-4138-8ed7-dd7308417206/scratchpad';
const APPLY = process.argv.includes('--apply');

for (const line of fs.readFileSync(path.join(ROOT, '.env.vercel'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
}
const U = process.env.NEXT_PUBLIC_SUPABASE_URL;
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SECRET = process.env.ADMIN_SECRET;

const norm = (s) => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]/g, '');

// Every active row, paged: PostgREST caps silently at 1000.
const rows = [];
for (let from = 0; ; from += 500) {
  const res = await fetch(`${U}/rest/v1/bars?select=id,slug,name,city,country,editorial_sources&is_active=eq.true&order=slug.asc`, {
    headers: { apikey: K, Authorization: `Bearer ${K}`, Range: `${from}-${from + 499}` },
  });
  const page = await res.json();
  if (!Array.isArray(page)) { console.error(page); process.exit(1); }
  rows.push(...page);
  if (page.length < 500) break;
}
const bySlug = new Map(rows.map(r => [r.slug, r]));
const byNameCity = new Map(rows.map(r => [`${norm(r.name)}|${norm(r.city)}`, r]));

/**
 * slug -> Map(sourceKey -> entry), so one source is recorded once per bar.
 *
 * Seeded from what the row ALREADY holds, which is what makes this
 * repeatable: running it twice adds nothing, and an entry written by hand or
 * by a later wave is never clobbered by a re-run.
 */
const found = new Map();
function add(slug, entry) {
  if (!slug || !entry.source) return;
  if (!found.has(slug)) found.set(slug, new Map());
  const key = norm(entry.source);
  if (!found.get(slug).has(key)) found.get(slug).set(key, entry);
}
const existingCount = new Map();
for (const r of rows) {
  const have = Array.isArray(r.editorial_sources) ? r.editorial_sources : [];
  if (!have.length) continue;
  existingCount.set(r.slug, have.length);
  for (const e of have) add(r.slug, e);
}

// ---------------------------------------------------------------------------
// 1. This session's research JSON, which records the admitting source per bar
//    as a field rather than as prose. The richest input by far.
// ---------------------------------------------------------------------------
let fromJson = 0;
for (const f of fs.readdirSync(RESEARCH).filter(f => /-result\.json$/.test(f))) {
  let data;
  try { data = JSON.parse(fs.readFileSync(path.join(RESEARCH, f), 'utf8')); } catch { continue; }
  if (!Array.isArray(data)) continue;
  for (const x of data) {
    if (!x || x.status !== 'verified') continue;
    const row = byNameCity.get(`${norm(x.name)}|${norm(x.city)}`);
    if (!row) continue;
    const primary = x.admitted_by || (f.startsWith('bca-') ? "Bartenders' Choice Awards bars to watch" : null);
    if (primary) {
      add(row.slug, {
        source: primary,
        url: x.admission_url || (x.source_urls || [])[0] || null,
        note: null,
        year: 2026,
      });
      fromJson++;
    }
    for (const other of x.also_on || []) {
      add(row.slug, { source: other, url: null, note: 'also named by this source', year: 2026 });
    }
  }
}

// ---------------------------------------------------------------------------
// 2. The older wave reports, where the admitting source is stated once for the
//    whole file. Each file's blocks inherit it.
// ---------------------------------------------------------------------------
const FILE_SOURCE = {
  'haute-living-wave5-verified.md': 'Haute Living',
  'us-jbf-wave4-verified.md': 'James Beard Awards, Outstanding Bar semifinalists',
  'us-metro-wave1-verified.md': 'Tales of the Cocktail Spirited Awards, regional honorees',
  'us-metro-wave2-verified.md': 'Tales of the Cocktail Spirited Awards, regional honorees',
  'us-metro-wave3-verified.md': 'Tales of the Cocktail Spirited Awards, regional honorees',
};
let fromMd = 0;
for (const [file, source] of Object.entries(FILE_SOURCE)) {
  const p = path.join(OUT, file);
  if (!fs.existsSync(p)) continue;
  for (const m of fs.readFileSync(p, 'utf8').matchAll(/^## ([a-z0-9-]+)\s*$/gm)) {
    const slug = m[1];
    if (!bySlug.has(slug)) continue;
    add(slug, { source, url: null, note: `admitted by the ${file.replace('.md', '')} wave`, year: 2026 });
    fromMd++;
  }
}

// ---------------------------------------------------------------------------
const cities = new Set();
for (const slug of found.keys()) {
  const r = bySlug.get(slug);
  if (r) cities.add(`${r.city}, ${r.country}`);
}
const entries = Array.from(found.values()).reduce((n, m) => n + m.size, 0);
console.log(`bars with at least one editorial source: ${found.size} of ${rows.length} active`);
console.log(`  entries in total: ${entries}`);
console.log(`  cities represented: ${cities.size}`);
console.log(`  from this session's research JSON: ${fromJson}`);
console.log(`  from the older wave reports: ${fromMd}`);

if (!APPLY) {
  const sample = Array.from(found.entries()).slice(0, 5);
  for (const [slug, m] of sample) {
    console.log(`\n  ${slug}`);
    for (const e of m.values()) console.log(`     ${e.source}${e.url ? ` <${e.url}>` : ''}`);
  }
  fs.writeFileSync('/tmp/claude-501/editorial-sources-backfill.json',
    JSON.stringify(Object.fromEntries(Array.from(found, ([k, v]) => [k, Array.from(v.values())])), null, 1));
  console.log('\ndry run. the payload is written to /tmp/claude-501/editorial-sources-backfill.json');
  console.log('re-run with --apply once the column exists.');
  process.exit(0);
}

let ok = 0, fail = 0, unchanged = 0;
for (const [slug, m] of found) {
  const row = bySlug.get(slug);
  // Nothing new for this bar: skip the write entirely, so a re-run is free
  // and leaves updated_at alone.
  if ((existingCount.get(slug) || 0) === m.size) { unchanged++; continue; }
  const res = await fetch('https://barmagazine.com/api/admin/manage-bar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-secret': SECRET },
    body: JSON.stringify({ action: 'update', barId: row.id, updates: { editorial_sources: Array.from(m.values()) } }),
  });
  if (res.ok) ok++; else { fail++; console.log(`  FAILED ${slug}: ${res.status} ${await res.text()}`); }
  await new Promise(r => setTimeout(r, 120));
}
console.log(`written ${ok}, unchanged ${unchanged}, failed ${fail}`);
