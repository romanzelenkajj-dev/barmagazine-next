#!/usr/bin/env node
/**
 * send-photo-nudge.mjs — the short service-first photo follow-up for bars
 * contacted in an earlier batch that never replied, stayed unclaimed and
 * have no photo (batch 12 lane B and successors).
 *
 * Usage mirrors send-upsell.mjs:
 *   node scripts/send-photo-nudge.mjs <slug> [...]           # DRY RUN
 *   node scripts/send-photo-nudge.mjs --to you@x.com <slug>  # test send
 *   node scripts/send-photo-nudge.mjs --send --batch batch12-ca-photo-nudge <slug> [...]
 *
 * DUPLICATE GUARD, per-campaign: the upsell guard treats ANY sent-log line
 * as contact, which would block every nudge recipient by design. This
 * guard only skips slugs already logged under a *photo-nudge* label, so a
 * bar gets at most one nudge ever, while remaining eligible after its
 * original upsell. Corporate exclusion and the opt-out list are identical
 * to send-upsell (no bypasses).
 */
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
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
const RESEND = process.env.RESEND_API_KEY;
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!RESEND || !SUPA_URL || !SUPA_KEY) { console.error('Missing env'); process.exit(1); }

// A launchd job can fire before Wi-Fi is up (wave 3b, 2026-09-11: ENOTFOUND
// killed the whole wave before the first send). Wait for DNS, then start.
const { waitForNetwork } = await import('./net-preflight.mjs');
await waitForNetwork(SUPA_URL);

const args = process.argv.slice(2);
let overrideTo = null, live = false, batchLabel = null;
const requested = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--to') overrideTo = args[++i];
  else if (args[i] === '--send') live = true;
  else if (args[i] === '--batch') batchLabel = args[++i];
  else requested.push(args[i]);
}
if (!requested.length) { console.error('No bar slugs given.'); process.exit(1); }
const BATCH = batchLabel || 'batch12-ca-photo-nudge';
const TODAY = new Date().toISOString().slice(0, 10);

const SENT_LOG = resolve(ROOT, 'outreach/sent-log.txt');
const nudged = new Set();
for (const line of readFileSync(SENT_LOG, 'utf8').split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue;
  const [slug, , label] = line.split('\t');
  if (label && label.includes('photo-nudge')) nudged.add(slug);
}
const already = requested.filter(s => nudged.has(s));
if (already.length) {
  console.log(`ALREADY NUDGED — skipped (${already.length}): ${already.join(' ')}`);
}
const slugs = requested.filter(s => !nudged.has(s));
if (!slugs.length) { console.log('Nothing left to send.'); process.exit(0); }

const CORPORATE_DOMAINS = [
  'fourseasons', 'mandarinoriental', 'mohg', 'rosewoodhotels', 'ritzcarlton',
  'shangri-la', 'marriott', 'whotels', 'hyatt', 'hilton', 'editionhotels',
  'gucci', 'ralphlauren', 'anantara', 'minor', 'roccofortehotels',
  'bulgarihotels', 'ihg', 'morgansoriginals', 'ch-projects', 'altstrategies',
  'joseandres', 'corinthia',
];
function corporateMatch(email) {
  const domain = String(email || '').split('@')[1]?.toLowerCase() || '';
  return CORPORATE_DOMAINS.find(d => domain.includes(d)) || null;
}
const OPTED_OUT = new Set(
  readFileSync(resolve(ROOT, 'outreach/optout.txt'), 'utf8')
    .split('\n').map(l => l.trim().toLowerCase()).filter(l => l && !l.startsWith('#'))
);

const FROM = 'Roman Zelenka <zelenka@barmagazine.com>';
const SUBJ = (name) => `A photo for ${name}'s BarMagazine profile`;

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function htmlFor(bar) {
  const name = escapeHtml(bar.name);
  const link = `https://barmagazine.com/bars/${bar.slug}`;
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A;font-size:15px;line-height:1.6;">
      <div style="margin:0 0 26px;background:#0a0a0a;padding:16px 20px;">
        <a href="https://barmagazine.com"><img src="https://barmagazine.com/logo-white.png" alt="BarMagazine" width="150" style="width:150px;height:auto;border:0;display:block;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-weight:bold;" /></a>
      </div>
      <p>Hi ${name} team,</p>
      <p>Recently we listed <strong>${name}</strong> in the BarMagazine Bar
      Directory. The profile is live and getting traffic, but it's still missing
      the thing visitors look at first: a photo. Reply with your favorite shot of
      the room and we'll add it the same day, free.
      See the profile: <a href="${link}" style="color:#8a6a24;">${link.replace('https://', '')}</a></p>
      <p>And if you'd like to manage the listing yourself, hours, links, details,
      the claim button on that page takes two minutes.</p>
      <p>Best,<br><b>Roman Zelenka</b><br>Publisher, BarMagazine</p>
      <div style="margin-top:32px;padding-top:14px;border-top:1px solid #ECE7DE;color:#9A9A9A;font-size:12px;line-height:1.5;">
        <p style="margin:0;">You're receiving this one-time note because ${name} is listed in our public directory. Reply and I'll update or remove the listing.<br>Don't want emails about your listing? Reply 'unsubscribe' and we won't email this address again.</p>
      </div>
    </div>
  `;
}
function textFor(bar) {
  const link = `https://barmagazine.com/bars/${bar.slug}`;
  return [
    `Hi ${bar.name} team,`, '',
    `Recently we listed ${bar.name} in the BarMagazine Bar Directory. The profile is live and getting traffic, but it's still missing the thing visitors look at first: a photo. Reply with your favorite shot of the room and we'll add it the same day, free.`,
    `See the profile: ${link}`, '',
    "And if you'd like to manage the listing yourself, hours, links, details, the claim button on that page takes two minutes.", '',
    'Best,', 'Roman Zelenka, Publisher, BarMagazine', '',
    "Don't want emails about your listing? Reply 'unsubscribe' and we won't email this address again.",
  ].join('\n');
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
console.log(`${slugs.length} to send${live && !overrideTo ? ` — will be logged as ${BATCH} (${TODAY})` : ''}\n`);
for (const slug of slugs) {
  const res = await fetch(`${SUPA_URL}/rest/v1/bars?select=name,slug,email&slug=eq.${encodeURIComponent(slug)}&is_active=eq.true`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  const bar = (await res.json())[0];
  if (!bar) { console.error(`SKIP ${slug}: not found/active`); continue; }
  if (OPTED_OUT.has(String(bar.email || '').trim().toLowerCase())) {
    console.log(`EXCLUDED ${slug}: opted out (no bypass)`); continue;
  }
  const corp = corporateMatch(bar.email);
  if (corp) { console.log(`EXCLUDED ${slug}: corporate domain (${corp})`); continue; }
  const to = overrideTo || bar.email;
  if (!to) { console.error(`SKIP ${slug}: no email on file`); continue; }
  if (!overrideTo && !live) { console.log(`DRY RUN would send: ${bar.name} -> ${to}`); continue; }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], reply_to: 'zelenka@barmagazine.com', subject: SUBJ(bar.name), html: htmlFor(bar), text: textFor(bar) }),
  });
  const out = await r.json();
  if (r.ok) {
    console.log(`SENT ${bar.name} -> ${to} (id ${out.id})`);
    if (!overrideTo) appendFileSync(SENT_LOG, `${slug}\t${TODAY}\t${BATCH}\n`, 'utf8');
  } else {
    console.log(`FAIL ${bar.name} -> ${to}: ${JSON.stringify(out)}`);
  }
  await sleep(1200);
}
