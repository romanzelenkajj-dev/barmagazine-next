#!/usr/bin/env node
/**
 * Live gate: every active bar's description must agree with its accolade
 * records. Runs the pure checker in src/lib/award-claims.mjs over the real
 * rows and exits 1 on any problem, so `npm run verify` fails before a page
 * can ship arguing with itself.
 *
 *   node scripts/audit-award-claims.mjs          # report and exit 1 on problems
 *   node scripts/audit-award-claims.mjs --quiet  # counts only
 *
 * PAGES EVERY READ on `slug`, which is unique; an unpaged read of `bars`
 * silently stops at 1000 rows.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkAwardClaims, AWARD_CLAIM_EXEMPT } from '../src/lib/award-claims.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const f of ['.env.local', '.env.vercel']) {
  const p = resolve(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}
const U = process.env.NEXT_PUBLIC_SUPABASE_URL, K = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!U || !K) { console.error('audit-award-claims: missing Supabase env'); process.exit(1); }
const quiet = process.argv.includes('--quiet');

const bars = [];
let last = '';
for (;;) {
  const after = last ? `&slug=gt.${encodeURIComponent(last)}` : '';
  const res = await fetch(`${U}/rest/v1/bars?select=slug,description,accolades&is_active=eq.true&order=slug.asc&limit=1000${after}`, { headers: { apikey: K, Authorization: `Bearer ${K}` } });
  if (!res.ok) { console.error(`audit-award-claims: Supabase ${res.status}`); process.exit(1); }
  const page = await res.json();
  if (!page.length) break;
  bars.push(...page);
  last = page[page.length - 1].slug;
  if (page.length < 1000) break;
}

const problems = bars.flatMap(b => checkAwardClaims(b, { exempt: AWARD_CLAIM_EXEMPT }));
const byKind = {};
problems.forEach(p => { byKind[p.kind] = (byKind[p.kind] || 0) + 1; });
console.log(`award claims: ${bars.length} active bars, ${problems.length} problem(s) ${JSON.stringify(byKind)}`);
if (!quiet) {
  for (const p of problems) {
    const detail = p.kind === 'no-record' ? `no ${p.program} record` : `year ${p.year} not in records [${p.recordYears.join(',')}]`;
    console.log(`  ${p.slug.padEnd(34)} ${detail}\n      "${p.sentence.slice(0, 160)}"`);
  }
}
process.exit(problems.length ? 1 : 0);
