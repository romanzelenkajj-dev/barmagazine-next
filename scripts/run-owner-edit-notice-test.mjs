// Bundles scripts/owner-edit-notice-test.ts with esbuild and runs it with the
// production Resend key (.env.vercel) and the Supabase keys (.env.local).
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'node_modules', '.cache', 'owner-edit-notice-test.mjs');

function loadEnv(file, keys) {
  const env = {};
  for (const line of readFileSync(path.join(root, file), 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && keys.includes(m[1])) env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
  return env;
}

await build({
  entryPoints: [path.join(root, 'scripts', 'owner-edit-notice-test.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: out,
  external: ['@supabase/supabase-js'],
  logLevel: 'error',
});

const env = {
  ...process.env,
  ...loadEnv('.env.local', ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']),
  ...loadEnv('.env.vercel', ['RESEND_API_KEY']),
};
const r = spawnSync(process.execPath, [out, ...process.argv.slice(2)], { stdio: 'inherit', env });
process.exit(r.status ?? 1);
