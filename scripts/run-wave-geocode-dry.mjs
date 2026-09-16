// Bundles scripts/wave-geocode-dry.ts with esbuild and runs it on a wave file.
//   node scripts/run-wave-geocode-dry.mjs "Claude outputs/<wave>.md"
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseWaveFile, loadEnv } from './wave-file.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = process.argv[2];
if (!file) { console.error('usage: node scripts/run-wave-geocode-dry.mjs <wave file>'); process.exit(2); }
const out = path.join(root, 'node_modules', '.cache', 'wave-geocode-dry.mjs');

await build({
  entryPoints: [path.join(root, 'scripts', 'wave-geocode-dry.ts')],
  bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'error',
});
const env = { ...process.env, ...loadEnv(path.join(root, '.env.local'), ['NEXT_PUBLIC_MAPBOX_TOKEN']) };
const blocks = parseWaveFile(path.resolve(root, file));
const r = spawnSync(process.execPath, [out, JSON.stringify(blocks)], { stdio: 'inherit', env });
process.exit(r.status ?? 1);
