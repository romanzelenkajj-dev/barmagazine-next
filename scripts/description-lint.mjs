#!/usr/bin/env node
/**
 * description-lint.mjs: phrases a description must never carry.
 *
 * RULE (Roman, 2026-09-15): a description never states that a bar has no
 * kitchen or serves no food. If the venue says so itself, we simply do not
 * mention food. Bars are licensed on food sales in many US states and the
 * sentence can create a problem for the owner, as Friends of Friends
 * flagged ("the bar keeps no kitchen on site" against the Illinois Liquor
 * Commission). The patterns below are the ones the 2026-09-15 sweep of
 * 1,444 rows turned up, plus their obvious variants.
 *
 * Checks description and short_excerpt on every row, active or not, and
 * exits 1 on any hit so it can sit in the audit chain after a wave. Run:
 *   node scripts/description-lint.mjs            (all rows)
 *   node scripts/description-lint.mjs --since 2026-09-14   (rows created since)
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
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!URL || !KEY) throw new Error('Supabase env missing');
const sinceIdx = process.argv.indexOf('--since');
const since = sinceIdx > -1 ? process.argv[sinceIdx + 1] : null;

/** Each pattern is a licensing-sensitive statement about food. */
export const FOOD_NEGATIONS = [
  /\bno kitchen\b/i,
  /\bwithout a kitchen\b/i,
  /\bkeeps? no kitchen\b/i,
  /\bkitchen-?less\b/i,
  /\bno food\b/i,
  /\bwithout food\b/i,
  /\bserves? no food\b/i,
  /\b(?:does|do)n'?t serve food\b/i,
  /\bdoes not serve food\b/i,
  /\bno (?:bar )?snacks\b/i,
  /\bnothing to eat\b/i,
  /\bno (?:food|dining) (?:menu|service|program)\b/i,
  /\bdrinks?[- ]only\b/i,
  /\bnot a dining\b/i,
];

/**
 * Rows reviewed and left as they are, by decision. Bound to the exact
 * phrase: if the text changes, the entry goes stale and the row is reported
 * again rather than staying quiet on a sentence nobody reviewed.
 */
const ALLOWLIST = {
  momus: {
    phrase: 'serves no beer, wine or food',
    reason: 'Roman, 2026-09-15: left as is. Madrid, outside the US licensing concern; the sentence is the venue\'s own framing of a spirits-only room.',
  },
  'bar-us': {
    phrase: 'Not a dining but a drinking room',
    reason: 'Roman, 2026-09-15: left as is. Bangkok; a room description, not a statement about food service.',
  },
  'the-wise-king-soho-hong-kong': {
    phrase: 'no drink be served without food',
    reason: 'Inactive row; a historical line about the tapas decree of Alfonso X, not about the bar.',
  },
};

async function rows() {
  const out = [];
  for (let off = 0; ; off += 1000) {
    const q = `${URL}/rest/v1/bars?select=slug,city,is_active,description,short_excerpt&order=slug&offset=${off}&limit=1000${since ? `&created_at=gte.${since}` : ''}`;
    const r = await fetch(q, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
    const b = await r.json();
    if (!Array.isArray(b)) throw new Error(JSON.stringify(b));
    out.push(...b);
    if (b.length < 1000) break;
  }
  return out;
}

const all = await rows();
let hits = 0;
let suppressed = 0;
for (const r of all) {
  for (const field of ['description', 'short_excerpt']) {
    const text = r[field] || '';
    for (const re of FOOD_NEGATIONS) {
      const m = re.exec(text);
      if (!m) continue;
      const allowed = ALLOWLIST[r.slug];
      if (allowed && text.includes(allowed.phrase)) {
        suppressed++;
        continue;
      }
      if (allowed) console.log(`  STALE ALLOWLIST: ${r.slug} no longer carries "${allowed.phrase}"; review the new text.`);
      hits++;
      const at = m.index;
      console.log(`  ${r.slug} [${field}${r.is_active ? '' : ', inactive'}] ...${text.slice(Math.max(0, at - 60), at + m[0].length + 40).replace(/\s+/g, ' ')}...`);
    }
  }
}
console.log(`${all.length} rows checked, ${hits} food-negation hit(s)${suppressed ? ` (${suppressed} reviewed row(s) suppressed by the allowlist)` : ''}`);
if (hits > 0) {
  console.log('Rewrite so food is simply not mentioned (claude/admission-rule.md, Descriptions).');
  process.exit(1);
}
