#!/usr/bin/env node
/**
 * SEO regression guard for barmagazine.com (Part A — A11).
 *
 * Two modes:
 *   --mode=build  Pre-build sanity check. Hits WordPress directly and
 *                 confirms there are >= MIN_HEALTHY_ARTICLE_URLS published
 *                 posts. If WP itself returns less, the sitemap-articles
 *                 route will too — fail the build before deploy.
 *                 Wired into package.json `prebuild`.
 *
 *   --mode=live   Post-deploy live-URL checks. Pass --url=<base-url> (a
 *                 Vercel preview or production). Reports pass/warn/fail
 *                 per check; exits 1 only on REQUIRED failures.
 *
 * Each check has a `severity`:
 *   - "enforce" → failures exit non-zero and block the build/deploy.
 *   - "pending" → failures log a warning but DO NOT block. Use this for
 *                 acceptance criteria from prompt items that haven't
 *                 shipped yet (A2 archive, A3 pagination, A9 H1, etc).
 *                 As each PR lands, flip its check from pending → enforce.
 *
 * Network errors against WP fall through to "warn" so a transient outage
 * doesn't block deploys; only a definitive low-count answer fails.
 */

import process from 'node:process';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.split('=');
    return [k.replace(/^--/, ''), v ?? true];
  }),
);

const mode = args.mode ?? 'build';
const baseUrl = String(args.url ?? 'https://barmagazine.com').replace(/\/$/, '');

const WP_API =
  process.env.WP_API ??
  'https://public-api.wordpress.com/wp/v2/sites/romanzelenka-wjgek.wpcomstaging.com';

const MIN_HEALTHY_ARTICLE_URLS = 50;

const results = [];

function record(name, status, severity, detail) {
  results.push({ name, status, severity, detail });
}

async function safeFetchText(url, opts = {}) {
  try {
    const res = await fetch(url, { redirect: 'manual', ...opts });
    const text = await res.text();
    return { ok: true, status: res.status, headers: res.headers, text };
  } catch (err) {
    return { ok: false, error: err };
  }
}

async function safeFetchHead(url, opts = {}) {
  try {
    const res = await fetch(url, { redirect: 'manual', ...opts });
    return { ok: true, status: res.status, headers: res.headers };
  } catch (err) {
    return { ok: false, error: err };
  }
}

// ---------- BUILD-MODE CHECKS ----------

async function checkWpPostCount() {
  const url = `${WP_API}/posts?per_page=1&_fields=id`;
  const r = await safeFetchHead(url);
  if (!r.ok) {
    // Network blip — don't block the build on transient infra.
    record('wp-post-count', 'warn', 'pending', `network error (${r.error.message}); skipping`);
    return;
  }
  if (r.status !== 200) {
    record(
      'wp-post-count',
      'warn',
      'pending',
      `WP returned ${r.status} for ${url}; skipping (likely transient)`,
    );
    return;
  }
  const total = Number(r.headers.get('x-wp-total'));
  if (!Number.isFinite(total)) {
    record('wp-post-count', 'fail', 'enforce', 'X-WP-Total header missing or non-numeric');
    return;
  }
  if (total < MIN_HEALTHY_ARTICLE_URLS) {
    record(
      'wp-post-count',
      'fail',
      'enforce',
      `WP reports only ${total} published posts (< ${MIN_HEALTHY_ARTICLE_URLS}); sitemap-articles would be near-empty`,
    );
    return;
  }
  record(
    'wp-post-count',
    'pass',
    'enforce',
    `${total} published posts (>= ${MIN_HEALTHY_ARTICLE_URLS})`,
  );
}

// ---------- LIVE-MODE CHECKS ----------

async function checkSitemapArticlesUrlCount() {
  const r = await safeFetchText(`${baseUrl}/sitemap-articles.xml`);
  if (!r.ok) {
    record('sitemap-articles', 'fail', 'enforce', `network error: ${r.error.message}`);
    return;
  }
  if (r.status >= 500) {
    record(
      'sitemap-articles',
      'fail',
      'enforce',
      `HTTP ${r.status} (5xx — WP fetch likely failed)`,
    );
    return;
  }
  if (r.status !== 200) {
    record('sitemap-articles', 'fail', 'enforce', `HTTP ${r.status}`);
    return;
  }
  const count = (r.text.match(/<loc>/g) ?? []).length;
  if (count < MIN_HEALTHY_ARTICLE_URLS) {
    record(
      'sitemap-articles',
      'fail',
      'enforce',
      `only ${count} <loc> entries (< ${MIN_HEALTHY_ARTICLE_URLS})`,
    );
    return;
  }
  record('sitemap-articles', 'pass', 'enforce', `${count} <loc> entries`);
}

async function checkSitemapIndex() {
  const r = await safeFetchText(`${baseUrl}/sitemap.xml`);
  if (!r.ok || r.status !== 200) {
    record('sitemap-index', 'fail', 'enforce', `HTTP ${r.status ?? 'network-error'}`);
    return;
  }
  const subs = (r.text.match(/<sitemap>/g) ?? []).length;
  // Currently 3 (articles, bars, news). After A6 ships, expect 4 (+ categories).
  if (subs < 3) {
    record('sitemap-index', 'fail', 'enforce', `index has ${subs} sub-sitemaps (< 3)`);
    return;
  }
  record('sitemap-index', 'pass', 'enforce', `${subs} sub-sitemap entries`);
}

async function checkRobotsHasSitemap() {
  const r = await safeFetchText(`${baseUrl}/robots.txt`);
  if (!r.ok || r.status !== 200) {
    record('robots-txt', 'fail', 'enforce', `HTTP ${r.status ?? 'network-error'}`);
    return;
  }
  if (!/^Sitemap:\s*\S+/m.test(r.text)) {
    record('robots-txt', 'fail', 'enforce', 'no Sitemap: directive found');
    return;
  }
  record('robots-txt', 'pass', 'enforce', 'Sitemap directive present');
}

// Pending checks below — flip to "enforce" as the corresponding PR ships.

async function checkHomepageH1() {
  // Pending: A9 (add H1 to homepage hero, NEEDS-APPROVAL).
  const r = await safeFetchText(baseUrl + '/');
  if (!r.ok || r.status !== 200) {
    record('homepage-h1', 'fail', 'enforce', `homepage HTTP ${r.status ?? 'network-error'}`);
    return;
  }
  const h1s = (r.text.match(/<h1\b/gi) ?? []).length;
  const status = h1s === 1 ? 'pass' : 'warn';
  const severity = h1s === 1 ? 'enforce' : 'pending';
  record('homepage-h1', status, severity, `${h1s} <h1> on homepage (target: exactly 1, A9)`);
}

async function checkArticlesArchive() {
  // Pending: A2 (build /articles archive, NEEDS-APPROVAL).
  const r = await safeFetchText(`${baseUrl}/articles`);
  const status = r.ok && r.status === 200 ? 'pass' : 'warn';
  const severity = r.ok && r.status === 200 ? 'enforce' : 'pending';
  record(
    'articles-archive',
    status,
    severity,
    `/articles returned ${r.status ?? 'network-error'} (target: 200, A2)`,
  );
}

async function checkCategoryPagination() {
  // Pending: A3 (paginate /category/*, NEEDS-APPROVAL).
  // Today /category/cocktails?page=2 returns 200 but renders page 1 content
  // (Next.js ignores the unhandled query param). Require BOTH a 200 AND a
  // `<link rel="next">` so this only flips to PASS once real pagination ships.
  const r = await safeFetchText(`${baseUrl}/category/cocktails?page=2`);
  const ok =
    r.ok && r.status === 200 && /<link\s+rel=["']next["']/i.test(r.text);
  const status = ok ? 'pass' : 'warn';
  const severity = ok ? 'enforce' : 'pending';
  record(
    'category-pagination',
    status,
    severity,
    `/category/cocktails?page=2 → HTTP ${r.status ?? 'network-error'}, rel=next ${ok ? 'present' : 'missing'} (target: 200 + rel=next, A3)`,
  );
}

async function checkWwwRedirect() {
  // Pending: B5 (configure www subdomain in Vercel).
  const r = await safeFetchHead('https://www.barmagazine.com/');
  if (!r.ok) {
    record(
      'www-redirect',
      'warn',
      'pending',
      `DNS or fetch error: ${r.error.message} (B5 not shipped)`,
    );
    return;
  }
  const status = r.status >= 300 && r.status < 400 ? 'pass' : 'warn';
  const severity = r.status >= 300 && r.status < 400 ? 'enforce' : 'pending';
  record('www-redirect', status, severity, `www returned ${r.status} (target: 30x, B5)`);
}

async function checkHomepageWeight() {
  // Pending: A10 (reduce homepage payload < 300 KB compressed).
  let bytes = 0;
  try {
    const res = await fetch(baseUrl + '/');
    const buf = await res.arrayBuffer();
    bytes = buf.byteLength;
  } catch (err) {
    record('homepage-weight', 'warn', 'pending', `fetch error: ${err.message}`);
    return;
  }
  const target = 300_000;
  const status = bytes < target ? 'pass' : 'warn';
  const severity = bytes < target ? 'enforce' : 'pending';
  record(
    'homepage-weight',
    status,
    severity,
    `${bytes} bytes (target: < ${target}, A10)`,
  );
}

// ---------- DRIVER ----------

async function run() {
  if (mode === 'build') {
    await checkWpPostCount();
  } else if (mode === 'live') {
    await Promise.all([
      checkSitemapArticlesUrlCount(),
      checkSitemapIndex(),
      checkRobotsHasSitemap(),
      checkHomepageH1(),
      checkArticlesArchive(),
      checkCategoryPagination(),
      checkWwwRedirect(),
      checkHomepageWeight(),
    ]);
  } else {
    console.error(`Unknown --mode=${mode}; use --mode=build or --mode=live`);
    process.exit(2);
  }

  let hardFails = 0;
  for (const r of results) {
    const tag = r.status === 'pass' ? 'PASS' : r.status === 'warn' ? 'WARN' : 'FAIL';
    const sev = r.severity === 'enforce' ? 'enforce' : 'pending';
    console.log(`[${tag}] [${sev}] ${r.name}: ${r.detail}`);
    if (r.status === 'fail' && r.severity === 'enforce') hardFails++;
  }

  console.log('');
  if (hardFails > 0) {
    console.error(`SEO check (mode=${mode}): ${hardFails} REQUIRED check(s) failed.`);
    process.exit(1);
  }
  console.log(`SEO check (mode=${mode}): ok`);
}

run().catch((err) => {
  console.error('SEO check crashed:', err);
  process.exit(1);
});
