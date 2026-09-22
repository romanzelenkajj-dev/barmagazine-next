#!/usr/bin/env node
/**
 * Pass 1 of the email harvest: read a bar's OWN website for its address.
 *
 *   node scripts/harvest-emails.mjs --countries "United States,Germany"
 *   node scripts/harvest-emails.mjs --countries Germany --limit 20
 *   node scripts/harvest-emails.mjs --slugs a,b,c
 *
 * Writes outreach/harvest-<stamp>.tsv and never touches the database. Storing
 * what it finds is a separate, reviewed step.
 *
 * THE METHOD IS THE ONE BATCH 10 ESTABLISHED (report 60), not a fresh guess:
 *
 *   - The contact page is the WORST place to look. It is almost always a bare
 *     form now. A plain contact-page scrape missed about half the addresses.
 *   - Structured data is the BEST: LocalBusiness / Organization JSON-LD and
 *     contact-form recipient config produced seven of harvest 1's fifteen.
 *   - Then the pages nobody designs: private events, press, FAQ, careers,
 *     accessibility, and privacy or legal notices, which must name a data
 *     controller. In Germany the Impressum is a legal requirement and names an
 *     address outright, which matters here because Germany is the second
 *     biggest country in this list.
 *   - Cloudflare email obfuscation hides addresses from a plain regex: the
 *     real address exists only as a hex `data-cfemail` attribute. Decoding it
 *     surfaced two bars that were otherwise invisible.
 *
 * Instagram bios are pass 2 and are deliberately not here. Batch 10 tried them
 * on all 34 bars and got ONE address: the bios carry a phone number, a
 * WhatsApp link or a Linktree instead, and five Linktrees held nothing.
 */
import { readFileSync, existsSync, appendFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const argVal = (name) => {
  const i = args.indexOf(name);
  return i > -1 ? args[i + 1] : null;
};
const COUNTRIES = (argVal('--countries') || '').split(',').map(s => s.trim()).filter(Boolean);
const ONLY_SLUGS = (argVal('--slugs') || '').split(',').map(s => s.trim()).filter(Boolean);
const LIMIT = Number(argVal('--limit') || 0);
const OUT = argVal('--out') || resolve(ROOT, 'outreach', `harvest-${new Date().toISOString().slice(0, 10)}.tsv`);
const CONCURRENCY = Number(argVal('--concurrency') || 6);

/* ---------------------------------------------------------------- classify */

/**
 * Hotel, resort and restaurant-group domains. An address here belongs to a
 * chain's reservations desk, not to the bar, and mailing it is the mistake
 * parked.txt exists to prevent.
 */
const GROUP_DOMAINS = [
  'marriott', 'marriotthotels', 'hilton', 'waldorfastoria', 'ritzcarlton', 'stregis',
  'mohg', 'mandarinoriental', 'fourseasons', 'hyatt', 'andaz', 'ihg', 'accor',
  'rosewoodhotels', 'roccofortehotels', 'capellahotels', 'kempinski', 'raffles',
  'fairmont', 'editionhotels', 'mondrianhotels', 'bulgarihotels', 'tajhotels',
  'theleela', 'pestana', 'tuguhotels', 'shangri-la', 'shangrila', 'peninsula',
  'sofitel', 'radisson', 'sheraton', 'westin', 'whotels', 'fourpoints', 'hotelindigo',
  'nh-hotels', 'meliá', 'melia', 'barcelo', 'iberostar', 'riu', 'wyndham',
  'intercontinental', 'jumeirah', 'oetkerhotels', 'belmond', 'aman', 'sixsenses',
  'lhw', 'preferredhotels', 'thesocialhub', 'sommerrohouse', 'morgansoriginals',
  'rwsentosa', 'grandhotel', 'ihcltata', 'langhamhotels', 'corinthia', 'dorchestercollection',
];

/** Departmental mailboxes: real, but not the person who runs the bar. */
const ROLE_PREFIXES = /^(press|media|pr|marketing|recruitment|jobs|careers|hr|privacy|dpo|legal|datenschutz|webmaster|postmaster|abuse|noreply|no-reply|donotreply)@/i;

/** Addresses that are never a venue: agencies, platforms, CMS boilerplate. */
const JUNK = /@(sentry|wixpress|squarespace|shopify|godaddy|example|domain|yourdomain|email|sentry\.io|wordpress|elementor|cloudflare)\./i;

/**
 * HTML and JSON escape residue glued to the front of a real address.
 *
 * `>` is an escaped ">", and every character in it is legal in a local
 * part, so the regex swallows it and produces u003edata.privacy@kempinski.com
 * alongside the real data.privacy@kempinski.com. Both then look like distinct
 * addresses. Caught on the first twelve bars.
 */
const ESCAPE_RESIDUE = /^(?:u00[0-9a-f]{2}|x3[ce]|amp|quot|lt|gt|nbsp|#\d+);?/i;
const stripResidue = (email) => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const cleaned = local.replace(ESCAPE_RESIDUE, '');
  return cleaned && cleaned !== local ? `${cleaned}@${domain}` : email;
};

const registrable = (host) => String(host || '').toLowerCase().replace(/^www\./, '').split('.').slice(-2).join('.');

function classify(email, siteHost) {
  const lower = email.toLowerCase();
  const domain = lower.split('@')[1] || '';
  if (JUNK.test(`@${domain}.`) || /\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i.test(lower)) return { kind: 'junk', reason: 'not a real mailbox' };
  const base = domain.split('.')[0];
  const hit = GROUP_DOMAINS.find(g => base === g || domain.startsWith(`${g}.`));
  if (hit) return { kind: 'group', reason: `${hit} group or hotel inbox` };
  if (ROLE_PREFIXES.test(lower)) return { kind: 'role', reason: `departmental mailbox (${lower.split('@')[0]}@)` };
  if (siteHost && registrable(domain) === registrable(siteHost)) return { kind: 'venue', reason: "the venue's own domain" };
  if (/^(gmail|googlemail|outlook|hotmail|yahoo|icloud|proton|protonmail|gmx|web|mail|yandex|naver|qq|163)\./.test(`${domain}.`)) {
    return { kind: 'venue', reason: 'free mailbox published on the venue\'s own site' };
  }
  return { kind: 'offsite', reason: `off-domain (${domain})` };
}

/* ------------------------------------------------------------- extraction */

/** Cloudflare hides addresses as hex behind a one-byte XOR key. */
function decodeCfEmail(hex) {
  try {
    const key = parseInt(hex.slice(0, 2), 16);
    let out = '';
    for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
    return /.+@.+\..+/.test(out) ? out : null;
  } catch { return null; }
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function extract(html) {
  const found = new Map(); // email -> where

  for (const m of html.matchAll(/data-cfemail=["']([0-9a-f]+)["']/gi)) {
    const dec = decodeCfEmail(m[1]);
    if (dec) found.set(dec.toLowerCase(), 'cloudflare-obfuscated');
  }

  // JSON-LD and form config first: batch 10 found these the most productive.
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    for (const e of (m[1].match(EMAIL_RE) || [])) if (!found.has(e.toLowerCase())) found.set(e.toLowerCase(), 'json-ld');
  }
  for (const m of html.matchAll(/(?:recipient|mailto|email_to|admin_email|to_email|contact_email)["'\s:=]+([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi)) {
    if (!found.has(m[1].toLowerCase())) found.set(m[1].toLowerCase(), 'form-config');
  }
  for (const m of html.matchAll(/mailto:([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi)) {
    if (!found.has(m[1].toLowerCase())) found.set(m[1].toLowerCase(), 'mailto');
  }
  for (const e of (html.match(EMAIL_RE) || [])) {
    if (!found.has(e.toLowerCase())) found.set(e.toLowerCase(), 'page-text');
  }
  // Escape residue can only be judged against the whole set: drop a candidate
  // when stripping the residue yields an address we already found for real.
  const cleaned = new Map();
  for (const [email, where] of found) {
    const fixed = stripResidue(email);
    if (fixed !== email && found.has(fixed)) continue;
    if (!cleaned.has(fixed)) cleaned.set(fixed, where);
  }
  return cleaned;
}

/* --------------------------------------------------------------- crawling */

/** Ordered by what actually paid off, not by what looks obvious. */
const PATHS = [
  '', '/impressum', '/kontakt', '/privacy', '/privacy-policy', '/datenschutz',
  '/legal', '/legal-notice', '/mentions-legales', '/aviso-legal', '/about',
  '/about-us', '/contact', '/contact-us', '/private-events', '/events',
  '/press', '/faq', '/careers', '/jobs', '/accessibility', '/info',
];

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function get(url, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,*/*' }, redirect: 'follow', signal: ctrl.signal });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (!/text|html|json/i.test(ct)) return null;
    return (await res.text()).slice(0, 900_000);
  } catch { return null; }
  finally { clearTimeout(t); }
}

function siteUrl(website) {
  const w = String(website || '').trim();
  if (!w) return null;
  try { return new URL(w.startsWith('http') ? w : `https://${w}`); } catch { return null; }
}

/**
 * Links the site itself offers, filtered to the kinds of page that pay off.
 *
 * GUESSING PATHS IS NOT ENOUGH, and the first full run proved it: 67 of 117
 * United States sites returned 200 with a full page and yielded nothing,
 * because the pages that carry an address are named by the venue, not by
 * convention. /private-events-chicago and /the-bamboo-room are not in any
 * list of guesses. Batch 10 said the productive pages were private events,
 * press, FAQ and legal notices; it did not say those pages sit at tidy URLs.
 */
const LINK_HINT = /(contact|about|impressum|kontakt|privacy|datenschutz|legal|mentions|aviso|private|event|press|media|faq|career|job|accessib|info|reserve|book|hire|group)/i;

function discoverLinks(html, base, max = 10) {
  const out = [];
  const seen = new Set();
  for (const m of html.matchAll(/<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]{0,120}?)<\/a>/gi)) {
    const href = m[1];
    const label = m[2].replace(/<[^>]*>/g, ' ');
    if (!LINK_HINT.test(href) && !LINK_HINT.test(label)) continue;
    let url;
    try { url = new URL(href, base.origin); } catch { continue; }
    if (url.hostname.replace(/^www\./, '') !== base.hostname.replace(/^www\./, '')) continue;
    if (/\.(pdf|jpg|jpeg|png|gif|svg|webp|zip|mp4|webm)$/i.test(url.pathname)) continue;
    const key = url.pathname.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url.href);
    if (out.length >= max) break;
  }
  return out;
}

async function harvestBar(bar) {
  const base = siteUrl(bar.website);
  if (!base) return { bar, tried: 0, results: [] };
  const host = base.hostname;
  const seen = new Map();
  let tried = 0;
  let discovered = [];

  for (const path of PATHS.concat(['__DISCOVERED__'])) {
    if (path === '__DISCOVERED__') {
      for (const url of discovered) {
        if ([...seen.values()].some(v => v.cls.kind === 'venue')) break;
        const html = await get(url);
        tried++;
        if (!html) continue;
        for (const [email, where] of extract(html)) {
          if (!seen.has(email)) seen.set(email, { where, url, cls: classify(email, host) });
        }
      }
      break;
    }
    // Stop as soon as a venue address is in hand; the remaining paths only
    // cost politeness and time.
    if ([...seen.values()].some(v => v.cls.kind === 'venue')) break;
    const url = new URL(path || base.pathname || '/', base.origin).href;
    const html = await get(url);
    tried++;
    if (!html) continue;
    if (path === '' && !discovered.length) discovered = discoverLinks(html, base);
    for (const [email, where] of extract(html)) {
      if (seen.has(email)) continue;
      seen.set(email, { where, url, cls: classify(email, host) });
    }
  }
  const results = [...seen.entries()].map(([email, v]) => ({ email, ...v }));
  return { bar, tried, results };
}

/* ------------------------------------------------------------------- main */

/**
 * Targets come from the one definition of "who still needs an address":
 *
 *   node scripts/outreach-candidates.mjs --no-email --json > outreach/harvest-targets.json
 *
 * Kept as a file rather than recomputed here so a long crawl works from a
 * fixed list and can be resumed against the same one.
 */
const TARGETS = argVal('--targets') || resolve(ROOT, 'outreach/harvest-targets.json');
if (!existsSync(TARGETS)) {
  console.error(`No target list at ${TARGETS}\nBuild it with:\n  node scripts/outreach-candidates.mjs --no-email --json > outreach/harvest-targets.json`);
  process.exit(1);
}
const all = JSON.parse(readFileSync(TARGETS, 'utf8'));
let targets = all.filter(b => String(b.website || '').trim());
if (COUNTRIES.length) targets = targets.filter(b => COUNTRIES.includes(b.country));
if (ONLY_SLUGS.length) targets = targets.filter(b => ONLY_SLUGS.includes(b.slug));
if (LIMIT) targets = targets.slice(0, LIMIT);

if (!existsSync(OUT)) {
  writeFileSync(OUT, 'slug\tname\tcountry\tcity\temail\tkind\treason\tsource\turl\n', 'utf8');
}

console.error(`harvesting ${targets.length} bars, concurrency ${CONCURRENCY} -> ${OUT}`);

let done = 0, withVenue = 0;
const queue = targets.slice();
async function worker() {
  for (;;) {
    const bar = queue.shift();
    if (!bar) return;
    const { results } = await harvestBar(bar);
    const venue = results.filter(r => r.cls.kind === 'venue');
    if (venue.length) withVenue++;
    for (const r of results) {
      if (r.cls.kind === 'junk') continue;
      appendFileSync(OUT, [bar.slug, bar.name, bar.country, bar.city, r.email, r.cls.kind, r.cls.reason, r.where, r.url].join('\t') + '\n', 'utf8');
    }
    done++;
    if (done % 10 === 0) console.error(`  ${done}/${targets.length} done, ${withVenue} with a venue address`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.error(`FINISHED ${done} bars, ${withVenue} yielded a venue address -> ${OUT}`);
