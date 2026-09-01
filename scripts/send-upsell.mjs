#!/usr/bin/env node
/**
 * send-upsell.mjs — send the free→Featured upsell email via Resend.
 *
 * Usage:
 *   node scripts/send-upsell.mjs --to you@x.com <slug> [...]   # TEST: all emails go to --to
 *   node scripts/send-upsell.mjs <slug> [...]                   # DRY RUN: prints, sends nothing
 *   node scripts/send-upsell.mjs --send <slug> [...]            # LIVE: emails the bars' real addresses
 *   node scripts/send-upsell.mjs --send --resend <slug> [...]   # LIVE, ignoring the duplicate guard
 *
 * CORPORATE EXCLUSION: bars whose on-file email routes through a chain-hotel
 * or luxury-group domain are partner-track — approached by hand at group
 * level, never blasted. The screen used to be a manual grep before each
 * batch; it is enforced here so those bars can never slip into a selection.
 * There is deliberately NO bypass flag: --resend does not override it. A
 * partner-track bar gets mailed from Roman's own inbox or not at all.
 *
 * DUPLICATE GUARD: outreach/sent-log.txt lists every bar already contacted.
 * Any slug found there is dropped before the dry run and reported under
 * "already contacted", so a handed-over batch never needs a manual
 * cross-check. --resend bypasses it for deliberate follow-ups and says so
 * loudly. Successful live sends append to the log immediately, one line each,
 * so an interrupted run keeps what it already sent; failures are not recorded
 * and stay eligible for a retry.
 *
 * Reads RESEND_API_KEY and NEXT_PUBLIC_SUPABASE_URL/ANON_KEY from .env.vercel,
 * .env.local or .env (first match wins per var). Never commits anything.
 * Sends sequentially, 1.2s apart. From/Reply-To: zelenka@barmagazine.com.
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
if (!RESEND) { console.error('Missing RESEND_API_KEY (run: vercel env pull .env.vercel)'); process.exit(1); }
if (!SUPA_URL || !SUPA_KEY) { console.error('Missing Supabase env'); process.exit(1); }

const args = process.argv.slice(2);
let overrideTo = null, live = false, resend = false, batchLabel = null;
const requested = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--to') { overrideTo = args[++i]; }
  else if (args[i] === '--send') { live = true; }
  else if (args[i] === '--resend') { resend = true; }
  else if (args[i] === '--batch') { batchLabel = args[++i]; }
  else requested.push(args[i]);
}
if (!requested.length) { console.error('No bar slugs given.'); process.exit(1); }

// ---------------------------------------------------------------- sent log
const SENT_LOG = resolve(ROOT, 'outreach/sent-log.txt');

/** slug -> { date, batch } for every bar already contacted. */
function loadSentLog() {
  const seen = new Map();
  if (!existsSync(SENT_LOG)) return seen;
  for (const line of readFileSync(SENT_LOG, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    // Tolerate a torn final line from an interrupted write: a record without
    // its date/batch is still proof the bar was contacted, so keep the slug.
    const [slug, date, batch] = trimmed.split('\t');
    if (slug) seen.set(slug, { date: date || 'unknown date', batch: batch || 'unknown batch' });
  }
  return seen;
}

const sentLog = loadSentLog();

/** Next batch label, so a normal run needs no --batch argument. */
function nextBatchLabel() {
  if (batchLabel) return batchLabel;
  let max = 0;
  for (const { batch } of sentLog.values()) {
    const m = /^batch-(\d+)$/.exec(batch || '');
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `batch-${max + 1}`;
}

const BATCH = nextBatchLabel();
const TODAY = new Date().toISOString().slice(0, 10);

// Append one complete line per successful send, immediately. appendFileSync
// opens with O_APPEND and never truncates, so existing records cannot be lost
// and a kill mid-run leaves every prior record intact.
function recordSent(slug) {
  appendFileSync(SENT_LOG, `${slug}\t${TODAY}\t${BATCH}\n`, 'utf8');
}

// ------------------------------------------------------- duplicate guard
const alreadySent = requested.filter(s => sentLog.has(s));
const slugs = resend ? requested : requested.filter(s => !sentLog.has(s));

if (resend) {
  console.log('!!'.repeat(34));
  console.log('!! --resend ACTIVE: the duplicate guard is OFF.');
  if (alreadySent.length) {
    console.log(`!! ${alreadySent.length} of these ${requested.length} slug(s) were already contacted and WILL be mailed again:`);
    for (const slug of alreadySent) {
      const { date, batch } = sentLog.get(slug);
      console.log(`!!   ${slug} (sent ${date}, ${batch})`);
    }
  } else {
    console.log('!! (none of these slugs had been contacted before, so nothing is being re-mailed.)');
  }
  console.log('!!'.repeat(34));
  console.log('');
}

if (!resend && alreadySent.length) {
  console.log(`ALREADY CONTACTED — skipped (${alreadySent.length}):`);
  for (const slug of alreadySent) {
    const { date, batch } = sentLog.get(slug);
    console.log(`  ${slug} — sent ${date} (${batch})`);
  }
  console.log('  Pass --resend to mail these anyway.');
  console.log('');
}

if (!slugs.length) {
  console.log('Nothing left to send: every requested slug has already been contacted.');
  process.exit(0);
}

console.log(`${slugs.length} to send${live && !overrideTo ? ` — will be logged as ${BATCH} (${TODAY})` : ''}`);
console.log('');

// ------------------------------------------------- corporate exclusion
// Substring match over the email's DOMAIN, matching the semantics of the
// manual grep screens used for batches 1-5 (so 'marriott' still catches
// marriotthotels.com). Kept-on-purpose single properties pass because they
// use their own domains (the-library-bar-london, provocateur, fitzs-bar…).
const CORPORATE_DOMAINS = [
  'fourseasons', 'mandarinoriental', 'mohg', 'rosewoodhotels', 'ritzcarlton',
  'shangri-la', 'marriott', 'whotels', 'hyatt', 'hilton', 'editionhotels',
  'gucci', 'ralphlauren', 'anantara', 'minor',
  // Added after the Europe wave 1 screen exposed them:
  'roccofortehotels', 'bulgarihotels', 'ihg', 'morgansoriginals',
];

function corporateMatch(email) {
  const domain = String(email || '').split('@')[1]?.toLowerCase() || '';
  return CORPORATE_DOMAINS.find(d => domain.includes(d)) || null;
}

const FROM = 'Roman Zelenka <zelenka@barmagazine.com>';
const SUBJ = (name) => `${name} is listed on BarMagazine`;
const TMPL = "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f4f2ee;padding:24px 0;\"><tr><td align=\"center\">\n<table role=\"presentation\" width=\"560\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:560px;max-width:100%;background:#ffffff;border:1px solid #e6e2da;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;\">\n<tr><td style=\"background:#0a0a0a;padding:22px 32px;\" align=\"left\">\n  <img src=\"https://barmagazine.com/logo-white.png\" alt=\"BarMagazine\" height=\"34\" style=\"display:block;height:34px;border:0;\">\n</td></tr>\n<tr><td style=\"padding:34px 32px 8px;\">\n  <p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;\">Hi {{BAR_NAME}} team,</p>\n  <p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;\">I'm Roman Zelenka, the publisher of <b>BarMagazine</b>. {{BAR_NAME}} has a live profile in our Bar Directory, a curated guide to 1,200+ of the world's best cocktail bars, read by industry professionals and by cocktail lovers deciding where to drink next.</p>\n  <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin:6px 0 22px;\"><tr><td style=\"background:#0a0a0a;border-radius:999px;\">\n    <a href=\"{{PROFILE_URL}}\" style=\"display:inline-block;padding:12px 26px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;letter-spacing:.04em;color:#ffffff;text-decoration:none;\">SEE YOUR PROFILE</a>\n  </td></tr></table>\n  <p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;\"><b>Your listing is free, and stays free.</b> It already shows your address, opening hours, map location and links to your website and Instagram. Claiming it takes two minutes. Once verified, you can correct or update your details whenever you like.</p>\n  <p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;\">One thing most listings are still missing is a photo. Reply to this email with your favorite shot of the bar and we'll add it to your profile, free.</p>\n  <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin:6px 0 26px;\"><tr><td style=\"background:#B08D3F;border-radius:999px;\">\n    <a href=\"{{CLAIM_URL}}\" style=\"display:inline-block;padding:12px 26px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;letter-spacing:.04em;color:#ffffff;text-decoration:none;\">CLAIM YOUR FREE LISTING</a>\n  </td></tr></table>\n  <p style=\"margin:0 0 6px;font-size:13px;font-family:Arial,Helvetica,sans-serif;letter-spacing:.1em;color:#B08D3F;\"><b>WANT YOUR PAGE TO DO MORE?</b></p>\n  <p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;\"><b>Featured</b> bars get their profile turned into a full landing page: your complete drinks menu, a photo gallery, and a featured article about your bar on BarMagazine.com. Many bars use it as their main website.</p>\n  <p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;\"><b>Featured&nbsp;+&nbsp;Social</b> adds promotion to our Instagram audience of <a href=\"https://www.instagram.com/barmagazine\" style=\"color:#8a6a24;\">88,000+ organic followers</a> from the bar industry and cocktail scene: 2 posts or Reels a year, each amplified with 3 Stories.</p>\n  <p style=\"margin:0 0 24px;font-size:15px;line-height:1.7;\">See a Featured page live: <a href=\"https://barmagazine.com/bars/dangerous-water-palma-de-mallorca\" style=\"color:#8a6a24;\">Dangerous Water, Palma de Mallorca, Spain</a><br>\n  Plans &amp; pricing: <a href=\"https://barmagazine.com/feature-your-bar?bar={{BAR_SLUG}}#pricing\" style=\"color:#8a6a24;\">barmagazine.com/feature-your-bar</a></p>\n  <p style=\"margin:0 0 4px;font-size:16px;line-height:1.6;\">Cheers,<br><b>Roman Zelenka</b><br>Publisher, BarMagazine</p>\n</td></tr>\n<tr><td style=\"padding:16px 32px;border-top:1px solid #eee6d8;\">\n  <p style=\"margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9a9284;\">BarMagazine &middot; The cocktail bar directory &middot; <a href=\"https://barmagazine.com/bars\" style=\"color:#9a9284;\">barmagazine.com/bars</a><br>You're receiving this one-time note because {{BAR_NAME}} is listed in our public directory. Reply and I'll update or remove the listing.</p>\n</td></tr>\n</table></td></tr></table>";

const escapeHtml = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function htmlFor(bar) {
  return TMPL
    .replaceAll('{{BAR_NAME}}', escapeHtml(bar.name))
    .replaceAll('{{PROFILE_URL}}', 'https://barmagazine.com/bars/' + bar.slug)
    .replaceAll('{{CLAIM_URL}}', 'https://barmagazine.com/claim-your-bar?bar=' + encodeURIComponent(bar.slug))
    .replaceAll('{{BAR_SLUG}}', encodeURIComponent(bar.slug));
}
function textFor(bar) {
  return [
    `Hi ${bar.name} team,`, '',
    `I'm Roman Zelenka, the publisher of BarMagazine. ${bar.name} has a live profile in our Bar Directory, a curated guide to 1,200+ of the world's best cocktail bars.`, '',
    `See your profile: https://barmagazine.com/bars/${bar.slug}`, '',
    'Your listing is free, and stays free. It already shows your address, opening hours, map location, website and Instagram. Claiming it takes two minutes, and once verified you can update your details any time:',
    `https://barmagazine.com/claim-your-bar?bar=${bar.slug}`, '',
    "One thing most listings are still missing is a photo. Reply to this email with your favorite shot of the bar and we'll add it to your profile, free.", '',
    'Want your page to do more? Featured bars get a full landing page: complete drinks menu, photo gallery and a featured article about your bar on BarMagazine.com. Featured + Social adds promotion to our Instagram audience of 88,000+ organic followers from the bar industry and cocktail scene (2 posts or Reels a year, 3 Stories each): https://www.instagram.com/barmagazine',
    'Example: https://barmagazine.com/bars/dangerous-water-palma-de-mallorca',
    `Pricing: https://barmagazine.com/feature-your-bar?bar=${bar.slug}`, '',
    'Cheers,', 'Roman Zelenka', 'Publisher, BarMagazine'
  ].join('\n');
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

for (const slug of slugs) {
  const res = await fetch(`${SUPA_URL}/rest/v1/bars?select=name,slug,email&slug=eq.${encodeURIComponent(slug)}&is_active=eq.true`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  const rows = await res.json();
  if (!rows.length) { console.error(`SKIP ${slug}: not found/active`); continue; }
  const bar = rows[0];
  const corp = corporateMatch(bar.email);
  if (corp) {
    console.log(`EXCLUDED ${slug}: routes through '${corp}' — partner track, not blasted (no bypass)`);
    continue;
  }
  const to = overrideTo || bar.email;
  if (!to) { console.error(`SKIP ${slug}: no email on file`); continue; }
  if (!overrideTo && !live) { console.log(`DRY RUN would send: ${bar.name} -> ${to}`); continue; }

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: 'zelenka@barmagazine.com',
      subject: SUBJ(bar.name),
      html: htmlFor(bar),
      text: textFor(bar),
    }),
  });
  const out = await r.json();
  if (r.ok) {
    console.log(`SENT ${bar.name} -> ${to} (id ${out.id})`);
    // Only a real send to the bar's own address counts as contact: a --to
    // test send goes to us, so it must not mark the bar as done. Recorded
    // per-send, before the next request, so an interruption loses nothing.
    if (!overrideTo) recordSent(slug);
  } else {
    // Deliberately NOT recorded — a failed send stays eligible for a retry.
    console.log(`FAIL ${bar.name} -> ${to}: ${JSON.stringify(out)}`);
  }
  await sleep(1200);
}
