#!/usr/bin/env node
/**
 * ab-split.mjs: split a batch slug list into two arms for the US-variant
 * A/B test (task 119).
 *
 *   node scripts/ab-split.mjs outreach/batch20-americas.slugs batch20-americas [seed]
 *
 * Writes <label>-a.slugs (control, the directory template, sent with
 * --variant old) and <label>-b.slugs (the US variant, sent with --variant
 * us). Only United States bars are randomised 50/50; a bar outside the US
 * cannot receive the US variant, so it goes to the control arm and is
 * listed separately so the report can leave it out of the comparison.
 *
 * The shuffle is seeded (default seed: the label) so a re-run reproduces
 * the same split and the two files can be regenerated safely.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
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
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const [file, label, seedArg] = process.argv.slice(2);
if (!file || !label) { console.error('usage: ab-split.mjs <slugs-file> <label> [seed]'); process.exit(1); }
const slugs = readFileSync(resolve(ROOT, file), 'utf8').trim().split(/\s+/).filter(Boolean);

// mulberry32, seeded from the label so the split is reproducible.
function rng(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353), h = (h << 13) | (h >>> 19);
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const res = await fetch(`${SUPA_URL}/rest/v1/bars?select=slug,country&slug=in.(${slugs.map(encodeURIComponent).join(',')})`, {
  headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
});
const rows = await res.json();
const country = new Map(rows.map(r => [r.slug, r.country]));
const us = slugs.filter(s => country.get(s) === 'United States');
const other = slugs.filter(s => country.get(s) !== 'United States');

const rand = rng(seedArg || label);
const shuffled = us.slice();
for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
const half = Math.ceil(shuffled.length / 2);
const armB = shuffled.slice(0, half).sort();
const armA = shuffled.slice(half).sort();

writeFileSync(resolve(ROOT, `outreach/${label}-a.slugs`), [...armA, ...other].join('\n') + '\n');
writeFileSync(resolve(ROOT, `outreach/${label}-b.slugs`), armB.join('\n') + '\n');
console.log(`${slugs.length} slugs: ${us.length} US split ${armA.length} (A, directory template) / ${armB.length} (B, US variant); ${other.length} outside the US ride with A.`);
console.log(`A: outreach/${label}-a.slugs  (send with --variant old --batch ${label})`);
console.log(`B: outreach/${label}-b.slugs  (send with --variant us --batch ${label}; the sender logs the ones that got the variant under ${label}-us)`);
if (other.length) console.log(`outside the US (in A, excluded from the comparison): ${other.join(', ')}`);
