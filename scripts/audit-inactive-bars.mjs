#!/usr/bin/env node
/**
 * Inactive-bars audit (one-shot, READ-ONLY).
 *
 * Pulls every row from Supabase `bars` (active + inactive) using the
 * service role key — service role bypasses RLS, which is the only way to
 * see the ~199 inactive rows. Cross-references against published WP
 * articles to score each inactive row, buckets it via the prompt's
 * decision tree, and writes:
 *
 *   outputs/inactive-bars-audit.csv
 *   outputs/inactive-bars-summary.md
 *
 * Strict guardrails:
 *   - SELECT only. No UPDATE / INSERT / DELETE statements anywhere.
 *   - Service role key is read from process.env, never echoed to logs.
 *   - email + phone columns are intentionally omitted from the CSV (per
 *     the prompt's privacy guidance — those may be owner-private).
 *
 * Run:
 *   set -a && . ./.env.local && set +a && node scripts/audit-inactive-bars.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const outDir = join(repoRoot, 'outputs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WP_API =
  process.env.WP_API ??
  'https://public-api.wordpress.com/wp/v2/sites/romanzelenka-wjgek.wpcomstaging.com';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.',
  );
  process.exit(1);
}

// ---------- Heuristic config ----------

const REQUIRED_FIELDS = [
  'name',
  'slug',
  'city',
  'country',
  'address',
  'description',
  'image_url', // synthesized from photos[] — see hasImage()
];

// Names that false-positive as substring matches. Editor uses
// name_likely_common_word to discount surprising name_mentions_raw spikes.
const COMMON_WORD_STOPLIST = new Set([
  // From the prompt
  'cure',
  'argo',
  'anvil',
  'taos',
  'atlas',
  'arca',
  'signature',
  'eco',
  // Plausible additions (single common English words)
  'home',
  'sky',
  'eden',
  'fox',
  'bird',
  'sip',
  'roe',
  'oak',
  'roof',
  'arc',
  'pulse',
  'heart',
  'star',
  'vine',
  'sage',
  'rye',
  'salt',
  'noir',
  'tonic',
]);

// ---------- Fetchers ----------

async function fetchAllBars() {
  const url = `${SUPABASE_URL}/rest/v1/bars?select=*&limit=10000`;
  const r = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
  if (!r.ok) {
    throw new Error(`Supabase /bars: ${r.status} ${await r.text()}`);
  }
  return r.json();
}

async function fetchAllWpPosts() {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const url = `${WP_API}/posts?per_page=100&page=${page}&_fields=slug,title,content,categories`;
    const r = await fetch(url);
    if (!r.ok) {
      if (r.status === 400) break;
      throw new Error(`WP /posts page ${page}: ${r.status}`);
    }
    const items = await r.json();
    if (!items.length) break;
    out.push(...items);
    if (items.length < 100) break;
  }
  return out;
}

// ---------- Helpers ----------

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#?\w+;/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasImage(bar) {
  return Array.isArray(bar.photos) && bar.photos.length > 0 && !!bar.photos[0];
}

function firstPhoto(bar) {
  return Array.isArray(bar.photos) && bar.photos.length > 0 ? bar.photos[0] : '';
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function isCommonWordName(name) {
  if (!name) return false;
  const trimmed = name.trim();
  if (!trimmed) return false;
  const isSingleShort = !/\s/.test(trimmed) && trimmed.length <= 5;
  if (isSingleShort) return true;
  return COMMON_WORD_STOPLIST.has(trimmed.toLowerCase());
}

function looksLikeTestData(bar, isBulkMinute) {
  const name = String(bar.name || '');
  if (/^(test|lorem|example|untitled|demo)\b/i.test(name)) return true;
  if (/example\.com/i.test(String(bar.website || ''))) return true;
  // Bulk-minute import heuristic — flagged only if also missing core data.
  if (isBulkMinute && (!bar.address || !bar.city)) return true;
  return false;
}

// ---------- Mention scoring ----------

/**
 * For a bar (name, city), scan the lowercased+stripped article bodies and
 * return:
 *   raw — total \b{name}\b matches across all bodies
 *   plusCity — articles where any \b{name}\b match has the city within
 *              ±300 chars in the same body. Each article counted once.
 *
 * Names < 2 chars are skipped (too noisy). City may be empty — then
 * plusCity is always 0 by definition.
 */
function scoreMentions(name, city, strippedBodies) {
  const nameLower = String(name || '')
    .trim()
    .toLowerCase();
  const cityLower = String(city || '')
    .trim()
    .toLowerCase();
  if (!nameLower || nameLower.length < 2) return { raw: 0, plusCity: 0 };

  const escaped = escapeRe(nameLower);
  // \b is ASCII word-boundary in JS regex. Most bar names are ASCII; for
  // accented names this may under-match, which we accept (false negatives
  // route to needs_editor_review, not real_bar_likely_reactivate, which
  // is the safer direction).
  const re = new RegExp(`\\b${escaped}\\b`, 'gi');

  let raw = 0;
  let plusCity = 0;
  for (const body of strippedBodies) {
    if (!body.includes(nameLower)) continue; // fast pre-filter
    const matches = [...body.matchAll(re)];
    if (matches.length === 0) continue;
    raw += matches.length;
    if (cityLower) {
      for (const m of matches) {
        const idx = m.index ?? 0;
        const start = Math.max(0, idx - 300);
        const end = Math.min(body.length, idx + nameLower.length + 300);
        if (body.slice(start, end).includes(cityLower)) {
          plusCity += 1;
          break;
        }
      }
    }
  }
  return { raw, plusCity };
}

// ---------- Main ----------

async function main() {
  console.log('[audit] fetching Supabase bars + WP posts...');
  const [bars, posts] = await Promise.all([fetchAllBars(), fetchAllWpPosts()]);

  const active = bars.filter((b) => b.is_active === true);
  const inactive = bars.filter((b) => b.is_active === false);
  console.log(
    `[audit] bars: total=${bars.length} active=${active.length} inactive=${inactive.length}`,
  );
  console.log(`[audit] WP posts: ${posts.length}`);

  // Pre-strip + lowercase article bodies once. Big win when scanning 199
  // bars × 334 posts.
  const strippedBodies = posts.map((p) =>
    stripHtml(p.content?.rendered ?? p.content ?? ''),
  );
  const wpSlugs = new Set(posts.map((p) => p.slug));

  // Active-set lookups
  const activeSlugs = new Set(active.map((b) => b.slug));
  const activeNameCity = new Set(
    active.map(
      (b) =>
        `${(b.name || '').trim().toLowerCase()}|||${(b.city || '').trim().toLowerCase()}`,
    ),
  );

  // Bulk-minute detection: group inactive rows by created_at minute
  const inactiveByMinute = {};
  for (const b of inactive) {
    if (!b.created_at) continue;
    const minute = String(b.created_at).slice(0, 16); // YYYY-MM-DDTHH:MM
    inactiveByMinute[minute] = (inactiveByMinute[minute] || 0) + 1;
  }
  const bulkMinutes = new Set(
    Object.entries(inactiveByMinute)
      .filter(([, c]) => c >= 5)
      .map(([m]) => m),
  );

  const rows = [];
  let scored = 0;
  for (const bar of inactive) {
    const name = String(bar.name || '');
    const city = String(bar.city || '');
    const country = String(bar.country || '');
    const slug = String(bar.slug || '');
    const nameLower = name.trim().toLowerCase();
    const cityLower = city.trim().toLowerCase();

    const fieldsPresent = REQUIRED_FIELDS.filter((f) => {
      if (f === 'image_url') return hasImage(bar);
      const v = bar[f];
      return v != null && String(v).trim() !== '';
    }).length;

    const hasMinimumData = !!(
      bar.name &&
      bar.slug &&
      bar.city &&
      bar.country
    );
    const slugCollidesActive = activeSlugs.has(slug);
    const nameCityMatchesActive = activeNameCity.has(
      `${nameLower}|||${cityLower}`,
    );
    const slugAppearsInWpArticles = wpSlugs.has(slug);

    const { raw, plusCity } = scoreMentions(name, city, strippedBodies);
    const nameMentionsRaw = raw;
    const namePlusCityMentions = plusCity;

    const daysSinceUpdated = bar.updated_at
      ? Math.floor(
          (Date.now() - new Date(bar.updated_at).getTime()) / 86_400_000,
        )
      : null;

    const isBulkMinute = bulkMinutes.has(
      String(bar.created_at || '').slice(0, 16),
    );
    const looksLikeTest = looksLikeTestData(bar, isBulkMinute);
    const nameLikelyCommon = isCommonWordName(name);

    // Bucket via the decision tree (first match wins, exact order from prompt).
    let bucket;
    if (looksLikeTest) bucket = 'test_data';
    else if (nameCityMatchesActive) bucket = 'probable_duplicate';
    else if (!hasMinimumData) bucket = 'incomplete_data';
    else if (namePlusCityMentions >= 1) bucket = 'real_bar_likely_reactivate';
    else if (fieldsPresent >= 6 && hasMinimumData)
      bucket = 'real_bar_review_for_reactivation';
    else bucket = 'needs_editor_review';

    const recommendedActions = {
      test_data: 'delete',
      probable_duplicate: `compare with active /${slug} and delete loser`,
      incomplete_data:
        'fill missing fields, then reactivate — OR delete if not real',
      real_bar_likely_reactivate: 'set is_active = true',
      real_bar_review_for_reactivation: 'review and reactivate',
      needs_editor_review: 'review manually',
    };

    rows.push({
      bucket,
      recommended_action: recommendedActions[bucket],
      slug,
      name,
      city,
      country,
      field_completeness: fieldsPresent,
      has_minimum_data: hasMinimumData,
      name_city_matches_active: nameCityMatchesActive,
      slug_appears_in_wp_articles: slugAppearsInWpArticles,
      slug_collides_active: slugCollidesActive,
      name_mentions_raw: nameMentionsRaw,
      name_plus_city_mentions: namePlusCityMentions,
      name_likely_common_word: nameLikelyCommon,
      days_since_updated: daysSinceUpdated,
      looks_like_test_data: looksLikeTest,
      photos_count: Array.isArray(bar.photos) ? bar.photos.length : 0,
      address: bar.address || '',
      website: bar.website || '',
      image_url: firstPhoto(bar),
      description: bar.description || '',
      created_at: bar.created_at || '',
      updated_at: bar.updated_at || '',
      id: bar.id,
    });
    scored++;
  }
  console.log(`[audit] scored ${scored} inactive bars`);

  // Sort: bucket priority first (most actionable on top), then by
  // field_completeness desc, then name asc.
  const BUCKET_ORDER = [
    'real_bar_likely_reactivate',
    'real_bar_review_for_reactivation',
    'probable_duplicate',
    'incomplete_data',
    'test_data',
    'needs_editor_review',
  ];
  rows.sort((a, b) => {
    const ai = BUCKET_ORDER.indexOf(a.bucket);
    const bi = BUCKET_ORDER.indexOf(b.bucket);
    if (ai !== bi) return ai - bi;
    if (b.field_completeness !== a.field_completeness)
      return b.field_completeness - a.field_completeness;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Counts
  const bucketCounts = {};
  for (const r of rows) bucketCounts[r.bucket] = (bucketCounts[r.bucket] || 0) + 1;

  // CSV
  const csvCols = [
    'bucket',
    'recommended_action',
    'slug',
    'name',
    'city',
    'country',
    'field_completeness',
    'has_minimum_data',
    'name_city_matches_active',
    'slug_appears_in_wp_articles',
    'slug_collides_active',
    'name_mentions_raw',
    'name_plus_city_mentions',
    'name_likely_common_word',
    'days_since_updated',
    'looks_like_test_data',
    'photos_count',
    'address',
    'website',
    'image_url',
    'description',
    'created_at',
    'updated_at',
    'id',
  ];
  const csvLines = [csvCols.join(',')];
  for (const r of rows) {
    csvLines.push(csvCols.map((c) => csvEscape(r[c])).join(','));
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'inactive-bars-audit.csv'), csvLines.join('\n') + '\n', 'utf8');

  // Top 10 highest-confidence reactivations (top two buckets)
  const top10 = rows
    .filter(
      (r) =>
        r.bucket === 'real_bar_likely_reactivate' ||
        r.bucket === 'real_bar_review_for_reactivation',
    )
    .slice(0, 10);

  const bulkPatterns = Object.entries(inactiveByMinute)
    .filter(([, c]) => c >= 5)
    .sort((a, b) => b[1] - a[1]);

  const headlineReactivate =
    (bucketCounts['real_bar_likely_reactivate'] || 0) +
    (bucketCounts['real_bar_review_for_reactivation'] || 0);

  const md = [
    `# Inactive bars audit`,
    ``,
    `_Generated: ${new Date().toISOString()}_`,
    ``,
    `**Source:** Supabase \`bars\` table via service role key (bypasses RLS), READ-ONLY query. WP article bodies pulled from the public WordPress.com API used by sitemap-articles.`,
    ``,
    `**Total bars:** ${bars.length}. **Inactive:** ${inactive.length} (${((inactive.length / bars.length) * 100).toFixed(1)}% of directory).`,
    ``,
    `## Schema note — image_url`,
    ``,
    `The schema has \`photos text[]\` rather than a single \`image_url\`. The CSV's \`image_url\` column is the **first element** of \`photos\` (or empty if no photos). \`photos_count\` is included as a bonus column so editors can spot 0-photo rows quickly.`,
    ``,
    `## Headline`,
    ``,
    `**${headlineReactivate} bars look like clear reactivation candidates** (\`real_bar_likely_reactivate\` + \`real_bar_review_for_reactivation\` combined).`,
    ``,
    `## Bucket counts`,
    ``,
    `| Bucket | Count |`,
    `|---|---|`,
    `| \`real_bar_likely_reactivate\` (name + city co-mentioned in WP) | ${bucketCounts['real_bar_likely_reactivate'] || 0} |`,
    `| \`real_bar_review_for_reactivation\` (looks complete, no WP corroboration) | ${bucketCounts['real_bar_review_for_reactivation'] || 0} |`,
    `| \`probable_duplicate\` (matches an active row by name+city) | ${bucketCounts['probable_duplicate'] || 0} |`,
    `| \`incomplete_data\` (missing one of name/slug/city/country) | ${bucketCounts['incomplete_data'] || 0} |`,
    `| \`test_data\` (heuristic match — test/lorem/example/bulk-empty) | ${bucketCounts['test_data'] || 0} |`,
    `| \`needs_editor_review\` (the long tail) | ${bucketCounts['needs_editor_review'] || 0} |`,
    ``,
    `## Top 10 highest-confidence reactivation candidates`,
    ``,
    top10.length > 0
      ? top10
          .map(
            (r, i) =>
              `${i + 1}. \`/${r.slug}\` — **${r.name}** (${r.city}, ${r.country}) — bucket: \`${r.bucket}\`; name+city mentions: ${r.name_plus_city_mentions}; raw mentions: ${r.name_mentions_raw}${r.name_likely_common_word ? ' _(common-word name — discount the raw count)_' : ''}`,
          )
          .join('\n')
      : '_None._',
    ``,
    `## Patterns flagged`,
    ``,
    bulkPatterns.length > 0
      ? `Bulk-import minutes (${bulkPatterns.length} cluster${bulkPatterns.length === 1 ? '' : 's'} of ≥ 5 inactive rows created in the same minute):\n\n` +
        bulkPatterns
          .map(([m, c]) => `- ${c} inactive rows created at ${m}`)
          .join('\n')
      : '_No obvious bulk-import patterns detected (no minute had ≥ 5 inactive rows)._',
    ``,
    `## Heuristic notes`,
    ``,
    `- \`name_mentions_raw\` and \`name_plus_city_mentions\` are emitted side-by-side. Bucket assignment uses the proximity-checked \`name_plus_city_mentions\` only — the raw count is for editor context.`,
    `- \`name_likely_common_word\` flags single-word ≤ 5-char names plus a stoplist (\`cure\`, \`argo\`, \`anvil\`, \`taos\`, \`atlas\`, \`arca\`, \`signature\`, \`eco\`, plus a handful of plausible additions). Editor uses this to discount surprising raw-mention spikes.`,
    `- Word-boundary regex \`\\b{name}\\b\` (case-insensitive) is used for both signals, so "cure" doesn't match "obscure".`,
    `- HTML stripped from WP bodies before scanning; HTML attributes can't false-trigger.`,
    ``,
    `## Recommended next steps`,
    ``,
    `1. Editorial team opens \`outputs/inactive-bars-audit.csv\` (sortable in Excel / Google Sheets) and works the \`real_bar_likely_reactivate\` rows first — these are the highest-impact reactivations for SEO inventory recovery.`,
    `2. \`probable_duplicate\` rows: spot-check each against its active twin. Delete whichever has worse data; keep the one already linked from sitemaps and links.`,
    `3. \`test_data\` rows: bulk-delete after a quick scan to confirm the heuristic didn't catch anything real.`,
    `4. \`incomplete_data\` and \`needs_editor_review\`: defer until the higher-priority work above is done.`,
    `5. To act on these in the admin UI rather than Supabase, the optional \`is_active\` toggle + "Inactive bars" view from the audit prompt is still pending design approval.`,
    ``,
  ].join('\n');

  writeFileSync(join(outDir, 'inactive-bars-summary.md'), md, 'utf8');

  console.log(`[audit] wrote ${join(outDir, 'inactive-bars-audit.csv')}`);
  console.log(`[audit] wrote ${join(outDir, 'inactive-bars-summary.md')}`);
  console.log(`[audit] bucket counts:`, bucketCounts);
  console.log(`[audit] headline reactivation candidates: ${headlineReactivate}`);
}

main().catch((err) => {
  console.error('[audit] fatal:', err);
  process.exit(1);
});
