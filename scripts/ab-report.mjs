#!/usr/bin/env node
/**
 * ab-report.mjs: claims and photo replies per arm of the US-variant A/B
 * test (task 119).
 *
 *   node scripts/ab-report.mjs batch20-americas
 *
 * Reads outreach/sent-log.txt for the two batch labels (<label> is the
 * control arm, <label>-us the US variant), then asks the database what
 * happened to each bar since its send date: a claim (owner_id or
 * claimed_at set on or after the send date) and a photo (photos non-empty
 * on a bar that was sent the no-photo paragraph; a reply with a shot is
 * only visible here once it has been put on the profile). Bars outside the
 * United States are left out of the comparison, since only US bars were
 * eligible for the variant.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const f of ['.env.vercel', '.env.local', '.env']) {
  const p = resolve(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const label = process.argv[2];
if (!label) { console.error('usage: ab-report.mjs <batch-label>'); process.exit(1); }
const ARMS = { A: label, B: `${label}-us` };

const sent = new Map(); // slug -> { date, arm }
for (const line of readFileSync(resolve(ROOT, 'outreach/sent-log.txt'), 'utf8').split('\n')) {
  const [slug, date, batch] = line.trim().split('\t');
  if (!slug || line.startsWith('#')) continue;
  if (batch === ARMS.A) sent.set(slug, { date, arm: 'A' });
  else if (batch === ARMS.B) sent.set(slug, { date, arm: 'B' });
}
if (sent.size === 0) { console.log(`No sends logged under ${ARMS.A} or ${ARMS.B} yet.`); process.exit(0); }

const slugs = [...sent.keys()];
const rows = [];
for (let i = 0; i < slugs.length; i += 100) {
  const chunk = slugs.slice(i, i + 100);
  const res = await fetch(`${SUPA_URL}/rest/v1/bars?select=slug,name,city,country,owner_id,claimed_at,photos&slug=in.(${chunk.map(encodeURIComponent).join(',')})`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  rows.push(...(await res.json()));
}

const tally = { A: { sent: 0, claimed: 0, photo: 0, names: { claimed: [], photo: [] } }, B: { sent: 0, claimed: 0, photo: 0, names: { claimed: [], photo: [] } } };
let outside = 0;
for (const b of rows) {
  const s = sent.get(b.slug);
  if (!s) continue;
  if (b.country !== 'United States') { outside++; continue; }
  const t = tally[s.arm];
  t.sent++;
  const claimedOn = b.claimed_at ? b.claimed_at.slice(0, 10) : null;
  if (b.owner_id || (claimedOn && claimedOn >= s.date)) { t.claimed++; t.names.claimed.push(b.name); }
  if (Array.isArray(b.photos) && b.photos.length > 0) { t.photo++; t.names.photo.push(b.name); }
}

const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}%` : '0%');
console.log(`A/B report for ${label} (US bars only; ${outside} outside the US excluded)\n`);
console.log('arm  template            sent  claimed        photo added');
console.log(`A    directory (old)     ${String(tally.A.sent).padStart(4)}  ${String(tally.A.claimed).padStart(3)} (${pct(tally.A.claimed, tally.A.sent)})     ${String(tally.A.photo).padStart(3)} (${pct(tally.A.photo, tally.A.sent)})`);
console.log(`B    US city-page        ${String(tally.B.sent).padStart(4)}  ${String(tally.B.claimed).padStart(3)} (${pct(tally.B.claimed, tally.B.sent)})     ${String(tally.B.photo).padStart(3)} (${pct(tally.B.photo, tally.B.sent)})`);
for (const arm of ['A', 'B']) {
  if (tally[arm].names.claimed.length) console.log(`\n${arm} claimed: ${tally[arm].names.claimed.join(', ')}`);
  if (tally[arm].names.photo.length) console.log(`${arm} photo added: ${tally[arm].names.photo.join(', ')}`);
}
console.log('\nA photo added counts profiles that now carry a photo, whatever the route (a reply put on the profile, or a claim upload).');
