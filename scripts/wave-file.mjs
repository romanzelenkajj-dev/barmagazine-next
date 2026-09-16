// Shared parser for the "verified wave" markdown files in Claude outputs/:
// "## <slug>" blocks with "key: value" lines. Returns [{slug, fields}].
import { readFileSync } from 'node:fs';

export function parseWaveFile(path) {
  const text = readFileSync(path, 'utf8');
  const blocks = [];
  let cur = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\r$/, '');
    const h = /^## ([a-z0-9-]+)\s*$/.exec(line);
    if (h) {
      cur = { slug: h[1], fields: {} };
      blocks.push(cur);
      continue;
    }
    if (!cur) continue;
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (kv) cur.fields[kv[1]] = kv[2].trim();
  }
  // Section headings such as "## DATA FLAGS" are uppercase and never match
  // the lowercase slug pattern, so only bar blocks are returned.
  return blocks;
}

export function loadEnv(file, keys) {
  const env = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && keys.includes(m[1])) env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
  return env;
}
