#!/usr/bin/env node
/**
 * A4: generate /{slug} → /bars/{slug} redirects from Supabase + WordPress.
 *
 * Runs in package.json `prebuild` so the JSON is on disk by the time
 * next.config.mjs is evaluated. Output is intentionally gitignored —
 * the source of truth is Supabase, and we want every Vercel deploy to
 * regenerate against current bar inventory rather than depending on a
 * checked-in file going stale.
 *
 * Algorithm (per the Part-A audit, item A4):
 *   1. Fetch active bars from Supabase via the anon key + public-read
 *      RLS policy on `bars`. We need columns: slug, wp_article_slug.
 *   2. Fetch all WP post + page slugs from the WP.com public API.
 *   3. For each bar slug s:
 *        - skip if s collides with a Next.js reserved top-level route
 *        - skip if s collides with an existing manual redirect in
 *          next.config.mjs (denylist below)
 *        - else if s NOT in WP slugs           → REDIRECT (root 404s today)
 *        - else if bar.wp_article_slug === s   → REDIRECT (WP post IS this bar's listing)
 *        - else                                → SKIP, flag for manual review
 *   4. Write src/lib/bar-redirects.generated.json
 *
 * Tolerant of missing env vars and network errors — emits an empty redirect
 * list (with `reason`) rather than failing the build. The build will go on
 * with zero bar redirects, which is no worse than today; ops should notice
 * the warning and fix the env / network.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const outPath = join(repoRoot, 'src/lib/bar-redirects.generated.json');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const WP_API =
  process.env.WP_API ??
  'https://public-api.wordpress.com/wp/v2/sites/romanzelenka-wjgek.wpcomstaging.com';

// Top-level Next.js routes a bar slug must not shadow. Keep in sync with
// app/ directory entries — search before adding to be sure.
const RESERVED_ROUTES = new Set([
  'add-your-bar', 'admin', 'api', 'articles', 'bars', 'bars-map', 'bars-preview',
  'category', 'claim-your-bar', 'events', 'favicon.ico', 'owner-dashboard',
  'privacy', 'robots.txt', 'search', 'terms', 'work-with-us',
  'sitemap.xml', 'sitemap-articles.xml', 'sitemap-bars.xml', 'sitemap-news.xml',
  '_next', 'cdn-cgi', 'partner', 'wp-content',
]);

// Slugs that already have a hand-curated root-level redirect in
// next.config.mjs. If a bar slug matches one of these, we must not emit
// a duplicate (Next.js rejects duplicate `source` values at build time).
const EXISTING_ROOT_REDIRECTS = new Set([
  'trending', 'about', 'contact', 'homepage', 'bar-directory', 'list-your-bar',
  'cocktails', 'privacy-policy', 'advertise', 'home',
  '2025-shake-it-up-national-finals', 'tales-of-the-cocktail-2025',
  'athens-bar-show-2025', 'india-bar-show-2025', 'the-bars-of-barcelona',
  'the-art-of-wine-production', 'drinky-juznej-ameriky',
  'bartenders-choice-awards-2026',
  'feed', 'wp-login.php', 'wp-admin',
]);

function writeOutput(payload) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

function emitEmpty(reason) {
  console.warn(`[generate-bar-redirects] ${reason}`);
  console.warn(`[generate-bar-redirects] writing empty redirect list to ${outPath}`);
  writeOutput({
    generatedAt: new Date().toISOString(),
    reason,
    counts: { bars: 0, redirects: 0, skipped: 0 },
    redirects: [],
    skipped: [],
  });
}

async function fetchBars() {
  // Direct Supabase REST — no SDK dependency in the build script. The
  // public-read RLS policy on `bars` (using is_active = true) means the
  // anon key returns only active rows even without an explicit filter,
  // but we add eq.is_active for clarity.
  const url = `${SUPABASE_URL}/rest/v1/bars?select=slug,wp_article_slug&is_active=eq.true&limit=10000`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase /rest/v1/bars returned ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function fetchWpSlugSet(endpoint) {
  const out = new Set();
  for (let page = 1; page <= 20; page++) {
    const url = `${WP_API}/${endpoint}?per_page=100&page=${page}&_fields=slug`;
    const res = await fetch(url);
    if (!res.ok) {
      // 400 from WP REST = "page beyond last", normal pagination end.
      if (res.status === 400) break;
      throw new Error(`WP ${endpoint} page ${page} returned ${res.status}`);
    }
    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) break;
    for (const i of items) if (i && i.slug) out.add(i.slug);
    if (items.length < 100) break;
  }
  return out;
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    emitEmpty(
      'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing ' +
        '(typical for local dev without env). Build continues with 0 bar redirects.',
    );
    return;
  }

  let bars, wpPostSlugs, wpPageSlugs;
  try {
    [bars, wpPostSlugs, wpPageSlugs] = await Promise.all([
      fetchBars(),
      fetchWpSlugSet('posts'),
      fetchWpSlugSet('pages'),
    ]);
  } catch (err) {
    emitEmpty(`upstream fetch failed: ${err.message}`);
    return;
  }

  const wpAll = new Set([...wpPostSlugs, ...wpPageSlugs]);
  const redirects = [];
  const skipped = [];
  const seen = new Set();

  for (const bar of bars) {
    const s = typeof bar?.slug === 'string' ? bar.slug.trim() : '';
    if (!s) continue;
    if (seen.has(s)) continue; // belt-and-suspenders against accidental dupes
    seen.add(s);

    // Defense-in-depth against non-ASCII slugs (e.g., the historical 'kwãnt'
    // case fixed in PR #18). The Supabase CHECK constraint
    // bars_slug_ascii_only should already prevent these, but if a row sneaks
    // through (race / manual SQL / pre-constraint legacy), skip it: a
    // redirect like /kwãnt → /bars/kwãnt would be rewritten by Vercel
    // normalization to /bars/kwant, which 404s if the data isn't ASCII-clean.
    if (!/^[a-z0-9-]+$/.test(s)) {
      skipped.push({
        slug: s,
        reason:
          'non-ASCII slug; expected ^[a-z0-9-]+$. ' +
          'Supabase CHECK constraint bars_slug_ascii_only should prevent this — investigate the data row',
      });
      continue;
    }

    if (RESERVED_ROUTES.has(s)) {
      skipped.push({ slug: s, reason: 'collides with a reserved Next.js route' });
      continue;
    }
    if (EXISTING_ROOT_REDIRECTS.has(s)) {
      skipped.push({ slug: s, reason: 'collides with a hand-curated redirect in next.config.mjs' });
      continue;
    }

    if (!wpAll.has(s)) {
      redirects.push({ from: `/${s}`, to: `/bars/${s}` });
      continue;
    }

    if (bar.wp_article_slug && bar.wp_article_slug === s) {
      redirects.push({ from: `/${s}`, to: `/bars/${s}` });
      continue;
    }

    skipped.push({
      slug: s,
      reason:
        `WP post at /${s} exists and isn't linked to this bar ` +
        `(wp_article_slug=${bar.wp_article_slug ?? 'null'}); likely editorial — manual review`,
    });
  }

  // Stable sort for reproducible output.
  redirects.sort((a, b) => a.from.localeCompare(b.from));
  skipped.sort((a, b) => a.slug.localeCompare(b.slug));

  writeOutput({
    generatedAt: new Date().toISOString(),
    counts: {
      bars: bars.length,
      redirects: redirects.length,
      skipped: skipped.length,
      wpPosts: wpPostSlugs.size,
      wpPages: wpPageSlugs.size,
    },
    redirects,
    skipped,
  });

  console.log(
    `[generate-bar-redirects] bars=${bars.length} wp-slugs=${wpAll.size} ` +
      `redirects=${redirects.length} skipped=${skipped.length}`,
  );
  if (skipped.length > 0) {
    console.log(`[generate-bar-redirects] first 5 skipped (manual review):`);
    for (const s of skipped.slice(0, 5)) {
      console.log(`  - /${s.slug}: ${s.reason}`);
    }
  }
}

main().catch((err) => {
  // Last-ditch safety: never let an unexpected error fail the prebuild.
  console.error('[generate-bar-redirects] unexpected:', err);
  emitEmpty(`unexpected error: ${err.message}`);
});
