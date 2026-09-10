// Reconcile paid-tier bars against Stripe subscriptions.
//
// Featured is a paid product; tier flips are manual (no automatic demotion),
// so this is the ten-second check for "does every bar wearing the chip have
// a payment behind it, and does every payment have its chip". Run whenever
// something feels off, or after the Stripe webhook flags a lapse:
//
//   node scripts/audit-featured-tiers.mjs
//
// Reads Supabase credentials from .env.local and STRIPE_SECRET_KEY from
// .env.vercel, both next to this repo's package.json. Read-only on both
// sides; exits 1 when there is any mismatch, 0 when clean.

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');

function readEnv(file) {
  try {
    return Object.fromEntries(
      readFileSync(join(REPO, file), 'utf8')
        .split('\n')
        .filter(l => l.includes('=') && !l.trimStart().startsWith('#'))
        .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')])
    );
  } catch {
    return {};
  }
}

const env = { ...readEnv('.env.vercel'), ...readEnv('.env.local') };
const SUPA_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_KEY = env.STRIPE_SECRET_KEY;
if (!SUPA_URL || !SUPA_KEY) { console.error('Missing Supabase env in .env.local'); process.exit(2); }
if (!STRIPE_KEY) { console.error('Missing STRIPE_SECRET_KEY in .env.vercel'); process.exit(2); }

/** Match key for free-form names: checkout stored bar_name unnormalized
    ("Dangerous water " with a trailing space), so trim, lowercase and
    collapse whitespace before comparing. */
const norm = s => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');

// --- Paid-tier bars ---------------------------------------------------------
const barsRes = await fetch(
  `${SUPA_URL}/rest/v1/bars?tier=in.(featured,premium)&select=slug,name,city,country,tier,is_active`,
  { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
);
if (!barsRes.ok) { console.error('Supabase query failed:', barsRes.status, await barsRes.text()); process.exit(2); }
const paidBars = await barsRes.json();

// --- Stripe subscriptions (all statuses, paginated) -------------------------
const subs = [];
let after = null;
while (true) {
  const url = new URL('https://api.stripe.com/v1/subscriptions');
  url.searchParams.set('status', 'all');
  url.searchParams.set('limit', '100');
  if (after) url.searchParams.set('starting_after', after);
  const r = await fetch(url, { headers: { Authorization: `Bearer ${STRIPE_KEY}` } });
  if (!r.ok) { console.error('Stripe query failed:', r.status, await r.text()); process.exit(2); }
  const page = await r.json();
  subs.push(...page.data);
  if (!page.has_more) break;
  after = page.data[page.data.length - 1].id;
}

// A subscription counts as paying while Stripe still considers it live.
// past_due and unpaid are included but called out: money is in doubt, and
// the human decides (the webhook flags these transitions in real time too).
const LIVE = new Set(['active', 'trialing', 'past_due', 'unpaid']);
const liveSubs = subs.filter(s => LIVE.has(s.status));

const subsByName = new Map();
for (const s of liveSubs) {
  const key = norm(s.metadata?.bar_name);
  if (key) subsByName.set(key, [...(subsByName.get(key) || []), s]);
}

const fmtDate = ts => (ts ? new Date(ts * 1000).toISOString().slice(0, 10) : 'unknown');
const periodEnd = s => fmtDate(s.current_period_end ?? s.items?.data?.[0]?.current_period_end);

// --- Reconcile --------------------------------------------------------------
let mismatches = 0;
console.log(`Paid-tier bars: ${paidBars.length} | Stripe subscriptions: ${subs.length} total, ${liveSubs.length} live\n`);

const claimed = new Set();
for (const bar of paidBars.sort((a, b) => a.name.localeCompare(b.name))) {
  const matches = subsByName.get(norm(bar.name)) || [];
  if (matches.length === 0) {
    mismatches++;
    console.log(`MISMATCH  ${bar.name} (${bar.slug}, ${bar.city}) is tier "${bar.tier}" with NO live Stripe subscription`);
  } else {
    const s = matches[0];
    claimed.add(s.id);
    const doubt = s.status === 'past_due' || s.status === 'unpaid' ? '  <- payment in doubt' : '';
    console.log(`OK        ${bar.name} (${bar.slug}) tier "${bar.tier}" <- ${s.id} ${s.status}, paid through ${periodEnd(s)}${doubt}`);
    if (s.status === 'past_due' || s.status === 'unpaid') mismatches++;
  }
}

for (const s of liveSubs) {
  if (claimed.has(s.id)) continue;
  mismatches++;
  console.log(
    `MISMATCH  Stripe ${s.id} (${s.status}, bar_name ${JSON.stringify(s.metadata?.bar_name || '')}, paid through ${periodEnd(s)}) has no bar on a paid tier`
  );
}

console.log(mismatches === 0 ? '\nClean: every paid tier has a payment and every payment has its tier.' : `\n${mismatches} mismatch(es). Tier changes stay a human decision; nothing was modified.`);
process.exit(mismatches === 0 ? 0 : 1);
