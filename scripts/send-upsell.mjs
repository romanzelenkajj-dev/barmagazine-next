#!/usr/bin/env node
/**
 * send-upsell.mjs — send the free→Featured upsell email via Resend.
 *
 * Usage:
 *   node scripts/send-upsell.mjs --to you@x.com <slug> [...]   # TEST: all emails go to --to
 *   node scripts/send-upsell.mjs <slug> [...]                   # DRY RUN: prints, sends nothing
 *   node scripts/send-upsell.mjs --send <slug> [...]            # LIVE: emails the bars' real addresses
 *
 * Reads RESEND_API_KEY and NEXT_PUBLIC_SUPABASE_URL/ANON_KEY from .env.vercel,
 * .env.local or .env (first match wins per var). Never commits anything.
 * Sends sequentially, 1.2s apart. From/Reply-To: zelenka@barmagazine.com.
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
const RESEND = process.env.RESEND_API_KEY;
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!RESEND) { console.error('Missing RESEND_API_KEY (run: vercel env pull .env.vercel)'); process.exit(1); }
if (!SUPA_URL || !SUPA_KEY) { console.error('Missing Supabase env'); process.exit(1); }

const args = process.argv.slice(2);
let overrideTo = null, live = false;
const slugs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--to') { overrideTo = args[++i]; }
  else if (args[i] === '--send') { live = true; }
  else slugs.push(args[i]);
}
if (!slugs.length) { console.error('No bar slugs given.'); process.exit(1); }

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
  console.log(r.ok ? `SENT ${bar.name} -> ${to} (id ${out.id})` : `FAIL ${bar.name} -> ${to}: ${JSON.stringify(out)}`);
  await sleep(1200);
}
