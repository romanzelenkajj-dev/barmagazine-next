#!/usr/bin/env node
/**
 * IndexNow one-shot backfill — pushes every URL we want indexed through
 * IndexNow so AI engines (Bing/Copilot, Perplexity, ChatGPT-search) pick
 * them up immediately rather than waiting on natural crawl cycles.
 *
 * Reads the four sub-sitemaps directly via HTTP (the live, post-deploy
 * versions are the authoritative URL list — same view a search engine
 * sees), dedupes, and POSTs in 1000-URL batches.
 *
 * Run:
 *   set -a && . ./.env.local && set +a && node scripts/indexnow-backfill.mjs
 *
 * Requires INDEXNOW_KEY in env. The .txt key file at /{KEY}.txt must
 * already be deployed and reachable — search engines fetch it to verify
 * domain ownership before accepting submitted URLs.
 *
 * Idempotent: re-running submits the same URLs. IndexNow accepts re-
 * submissions; engines only re-crawl URLs whose Last-Modified actually
 * changed. Safe to run after every deploy until the cron lands.
 *
 * NOTE: the notify logic is inlined here. Will be extracted to
 * src/lib/indexnow.ts when the cron handler is added in a follow-up PR.
 * Reference spec: https://www.indexnow.org/documentation
 */

import process from 'node:process';

const SITE = 'https://barmagazine.com';
const HOST = 'barmagazine.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH_SIZE = 1000;

const SITEMAPS = [
  '/sitemap-articles.xml',
  '/sitemap-bars.xml',
  '/sitemap-categories.xml',
  '/sitemap-news.xml',
];

const KEY = process.env.INDEXNOW_KEY;
if (!KEY) {
  console.error('Missing INDEXNOW_KEY in env. Add it to .env.local or your shell.');
  process.exit(1);
}

const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

async function fetchSitemapLocs(path) {
  const r = await fetch(`${SITE}${path}?ts=${Date.now()}`);
  if (!r.ok) {
    console.warn(`[backfill] ${path} returned ${r.status}; skipping`);
    return [];
  }
  const xml = await r.text();
  // Lightweight extraction — sitemap XML is well-formed enough for regex.
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) ?? [];
  return matches.map((m) => m.replace(/<\/?loc>/g, '').trim()).filter(Boolean);
}

async function notifyBatch(urls) {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls,
      }),
    });
    return { count: urls.length, status: res.status, statusText: res.statusText };
  } catch (err) {
    return {
      count: urls.length,
      status: 0,
      statusText: 'network error',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  console.log('[backfill] fetching sub-sitemaps...');
  const all = [];
  for (const sm of SITEMAPS) {
    const locs = await fetchSitemapLocs(sm);
    console.log(`  ${sm}: ${locs.length} URLs`);
    all.push(...locs);
  }

  // Plus the homepage and the bar directory hub — sometimes not in any
  // sub-sitemap explicitly but we want crawlers to revisit on every backfill.
  all.push(`${SITE}/`, `${SITE}/bars`);

  // De-dup + filter to canonical host (IndexNow rejects mixed-host batches).
  const seen = new Set();
  const filtered = all.filter((u) => {
    if (typeof u !== 'string' || u.length === 0) return false;
    if (!u.startsWith(`${SITE}/`)) return false;
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
  console.log(`[backfill] ${filtered.length} unique URLs after dedup`);

  const batches = [];
  for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
    const chunk = filtered.slice(i, i + BATCH_SIZE);
    const result = await notifyBatch(chunk);
    batches.push(result);
    console.log(
      `  batch ${batches.length} (${chunk.length} URLs): ${result.status} ${result.statusText}${result.error ? ` — ${result.error}` : ''}`,
    );
  }

  // 200 = accepted. 202 = accepted (key validation pending). Anything else
  // is a real failure (400/403/422/429).
  const ok = batches.every((b) => b.status === 200 || b.status === 202);
  console.log('');
  console.log(`[backfill] submitted: ${filtered.length} URLs in ${batches.length} batch(es)`);
  if (!ok) {
    console.error('[backfill] one or more batches failed.');
    process.exit(1);
  }
  console.log('[backfill] ok');
}

main().catch((err) => {
  console.error('[backfill] fatal:', err);
  process.exit(1);
});
