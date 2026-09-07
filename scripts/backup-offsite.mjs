#!/usr/bin/env node
/**
 * Off-platform backup: the copy that survives account-level compromise.
 *
 * Writes a dated snapshot OUTSIDE the repo and outside every hosted account,
 * to ~/BarMagazineBackups/<YYYY-MM-DD>/ :
 *
 *   db/<table>.json          — every row of every table, via the service key
 *                              (paginated past the 1000-row cap)
 *   db/pg_dump.sql           — a real pg_dump, ONLY when SUPABASE_DB_URL is
 *                              set in .env.backup and pg_dump is installed
 *                              (brew install libpq). The JSON export always
 *                              runs regardless.
 *   storage/bar-photos/...   — every object in the bar-photos bucket
 *   wordpress/*.json         — all posts/pages/categories/tags/media metadata
 *                              via the public WP REST API
 *   manifest.json            — counts + sizes for a quick integrity glance
 *
 * Scheduling: cron runs this weekly (see RESTORE.md). Roman syncs
 * ~/BarMagazineBackups to storage he controls (external drive / his own
 * cloud) — that sync is the off-platform hop.
 *
 * Secrets come from the repo's .env.vercel (gitignored, local-only).
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const env = readFileSync(join(REPO, '.env.vercel'), 'utf8');
const get = k => (env.match(new RegExp('^' + k + '="?([^"\\n]+)', 'm')) || [])[1];
const SUPA_URL = get('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_KEY = get('SUPABASE_SERVICE_ROLE_KEY');
const ADMIN = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };

const WP_API = 'https://public-api.wordpress.com/wp/v2/sites/romanzelenka-wjgek.wpcomstaging.com';
const TABLES = ['bars', 'bar_claims', 'bar_owners', 'bar_submissions', 'owner_submissions'];

const ROOT = process.env.BACKUP_ROOT || join(homedir(), 'BarMagazineBackups');
const today = new Date().toISOString().slice(0, 10);
const SNAP = join(ROOT, today);
const manifest = { date: today, tables: {}, storage: { files: 0, bytes: 0 }, wordpress: {}, pg_dump: false };

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} on ${url}`);
  return res.json();
}

async function dumpTables() {
  mkdirSync(join(SNAP, 'db'), { recursive: true });
  for (const table of TABLES) {
    const rows = [];
    for (let from = 0; ; from += 1000) {
      const page = await fetchJson(
        `${SUPA_URL}/rest/v1/${table}?select=*&order=created_at.asc&limit=1000&offset=${from}`,
        ADMIN
      );
      rows.push(...page);
      if (page.length < 1000) break;
    }
    writeFileSync(join(SNAP, 'db', `${table}.json`), JSON.stringify(rows, null, 1));
    manifest.tables[table] = rows.length;
    console.log(`db/${table}.json: ${rows.length} rows`);
  }
}

function tryPgDump() {
  // Optional full-fidelity path: needs SUPABASE_DB_URL in .env.backup next
  // to this repo's .env.vercel, plus pg_dump on PATH (brew install libpq).
  let dbUrl = null;
  try {
    const extra = readFileSync(join(REPO, '.env.backup'), 'utf8');
    dbUrl = (extra.match(/^SUPABASE_DB_URL="?([^"\n]+)/m) || [])[1] || null;
  } catch { /* no .env.backup */ }
  if (!dbUrl) return console.log('pg_dump: skipped (no SUPABASE_DB_URL in .env.backup)');
  try {
    execFileSync('pg_dump', ['--no-owner', '--no-privileges', '-f', join(SNAP, 'db', 'pg_dump.sql'), dbUrl], { stdio: 'inherit' });
    manifest.pg_dump = true;
    console.log('db/pg_dump.sql written');
  } catch (e) {
    console.log('pg_dump: failed or not installed —', e.message);
  }
}

async function listStorage(prefix) {
  const out = [];
  const res = await fetch(`${SUPA_URL}/storage/v1/object/list/bar-photos`, {
    method: 'POST',
    headers: { ...ADMIN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
  });
  if (!res.ok) throw new Error(`storage list ${res.status}`);
  for (const entry of await res.json()) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) out.push(...(await listStorage(path))); // folder
    else out.push({ path, size: entry.metadata?.size ?? 0 });
  }
  return out;
}

async function dumpStorage() {
  const files = await listStorage('');
  writeFileSync(join(SNAP, 'storage', 'file-list.json'), JSON.stringify(files, null, 1));
  for (const f of files) {
    const dest = join(SNAP, 'storage', 'bar-photos', f.path);
    mkdirSync(dirname(dest), { recursive: true });
    if (existsSync(dest) && statSync(dest).size === f.size) continue;
    const res = await fetch(`${SUPA_URL}/storage/v1/object/bar-photos/${f.path}`, { headers: ADMIN });
    if (!res.ok) { console.warn(`storage SKIP ${f.path}: ${res.status}`); continue; }
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    manifest.storage.files++;
    manifest.storage.bytes += f.size;
  }
  console.log(`storage: ${manifest.storage.files} files, ${(manifest.storage.bytes / 1e6).toFixed(1)}MB`);
}

async function dumpWordPress() {
  mkdirSync(join(SNAP, 'wordpress'), { recursive: true });
  for (const type of ['posts', 'pages', 'categories', 'tags', 'media']) {
    const rows = [];
    for (let page = 1; ; page++) {
      // media attachments carry status 'inherit', which the public API only
      // serves without an explicit status filter
      const statusParam = type === 'media' ? '' : '&status=publish';
      const res = await fetch(`${WP_API}/${type}?per_page=100&page=${page}${statusParam}`);
      if (res.status === 400) break; // past the last page
      if (res.status === 401 && type === 'media') {
        // The staging site locks the media listing. Not fatal: every image
        // URL is embedded in posts.json content, and the one-time WXR export
        // (RESTORE.md) carries media properly.
        console.log('wordpress/media: endpoint requires auth - skipped (image URLs live in posts.json)');
        manifest.wordpress[type] = 'unavailable';
        return writeFileSync(join(SNAP, 'wordpress', `${type}.json`), '[]');
      }
      if (!res.ok) throw new Error(`WP ${type} page ${page}: ${res.status}`);
      const batch = await res.json();
      rows.push(...batch);
      if (batch.length < 100) break;
    }
    writeFileSync(join(SNAP, 'wordpress', `${type}.json`), JSON.stringify(rows, null, 1));
    manifest.wordpress[type] = rows.length;
    console.log(`wordpress/${type}.json: ${rows.length} items`);
  }
}

(async () => {
  mkdirSync(join(SNAP, 'storage'), { recursive: true });
  console.log(`Snapshot: ${SNAP}`);
  await dumpTables();
  tryPgDump();
  await dumpStorage();
  await dumpWordPress();
  writeFileSync(join(SNAP, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('DONE', JSON.stringify(manifest));
})().catch(e => {
  console.error('BACKUP FAILED:', e);
  process.exit(1);
});
