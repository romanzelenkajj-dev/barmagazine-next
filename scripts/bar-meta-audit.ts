/**
 * Dry run of the bar profile title and description rewrite over every active
 * bar, plus the before and after table for the Search Console zero-click set.
 *
 * Reads a local dump of the bars table (no network), so it can be re-run while
 * comparing. Writes two files under "Claude outputs/".
 *
 *   npx vite-node scripts/bar-meta-audit.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { barTitle, barDescription, shortHours, titleAccolade, TITLE_MAX, DESCRIPTION_MAX } from '../src/lib/bar-seo-meta';
import { cityLabel, subdivisionName } from '../src/lib/city-location';
import { formatBarType } from '../src/lib/utils';
import { fallbackDescription } from '../src/lib/bar-fallback';

type Row = Parameters<typeof barTitle>[0] & {
  slug: string; type: string; description?: string | null;
};

const bars: Row[] = JSON.parse(readFileSync('/tmp/claude-501/bars-dump.json', 'utf8'));

// The root layout appends "%s | BarMagazine" to every title, so the old title
// as SERVED carried the brand too. Compare like with like.
const oldTitle = (b: Row) =>
  `${b.name} | ${formatBarType(b.type)} in ${cityLabel(b.city, b.country, subdivisionName(b.state, b.country))} | BarMagazine`;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const oldDesc = (b: Row) => b.description || fallbackDescription(b as any);

const out = bars.map(b => ({
  slug: b.slug,
  oldTitle: oldTitle(b),
  newTitle: barTitle(b),
  oldDesc: oldDesc(b),
  newDesc: barDescription(b),
  hasHours: !!shortHours(b.opening_hours, b.country),
  hasCredential: !!titleAccolade(b.accolades),
}));

const BAD = /\s{2}|,\s*\||\|\s*$|,\s*$|\.\.|,\s*\.|\s+[,.]|[–—]/;
const longT = out.filter(r => r.newTitle.length > TITLE_MAX);
const longD = out.filter(r => r.newDesc.length > DESCRIPTION_MAX);
const badT = out.filter(r => BAD.test(r.newTitle));
const badD = out.filter(r => BAD.test(r.newDesc));
const emptyD = out.filter(r => r.newDesc.trim().length === 0);
const avg = (ns: number[]) => (ns.reduce((a, b) => a + b, 0) / ns.length).toFixed(1);

console.log(`bars: ${out.length}`);
console.log(`title  avg ${avg(out.map(r => r.newTitle.length))} chars, max ${Math.max(...out.map(r => r.newTitle.length))}, over ${TITLE_MAX}: ${longT.length}`);
console.log(`desc   avg ${avg(out.map(r => r.newDesc.length))} chars, max ${Math.max(...out.map(r => r.newDesc.length))}, over ${DESCRIPTION_MAX}: ${longD.length}`);
console.log(`old title avg ${avg(out.map(r => r.oldTitle.length))}, old desc avg ${avg(out.map(r => r.oldDesc.length))}`);
console.log(`with readable hours: ${out.filter(r => r.hasHours).length}`);
console.log(`with a title credential: ${out.filter(r => r.hasCredential).length}`);
console.log(`punctuation problems: title ${badT.length}, description ${badD.length}; empty descriptions ${emptyD.length}`);
for (const r of [...longT, ...badT].slice(0, 8)) console.log(`  TITLE  ${r.slug}: ${r.newTitle}`);
for (const r of [...longD, ...badD, ...emptyD].slice(0, 8)) console.log(`  DESC   ${r.slug}: ${r.newDesc}`);

// ---------------------------------------------------------------------------
// The Search Console set: profiles at position 5 to 15 with impressions and
// no clicks, recorded now so the change is measurable in two weeks.
// ---------------------------------------------------------------------------
const csv = readFileSync('/Users/romanzelenka/Downloads/barmagazine/Pages.csv', 'utf8').trim().split('\n');
const gsc = csv.slice(1).map(line => {
  const m = /^(.*),(\d+),(\d+),([\d.]+)%,([\d.]+)$/.exec(line);
  if (!m) return null;
  return { url: m[1], clicks: +m[2], impressions: +m[3], ctr: +m[4], position: +m[5] };
}).filter(Boolean) as { url: string; clicks: number; impressions: number; ctr: number; position: number }[];

const bySlug = new Map(out.map(r => [r.slug, r]));
const allZero = gsc
  .filter(g => /\/bars\/[^/]+$/.test(g.url) && !g.url.includes('/bars/city/'))
  .filter(g => g.clicks === 0 && g.position >= 5 && g.position <= 15)
  .sort((a, b) => b.impressions - a.impressions);
// The cohort Roman named: page one, real impressions, no clicks at all. The
// 30-impression floor is what reproduces his count of 65 from this export.
const MIN_IMPRESSIONS = 30;
const zero = allZero.filter(g => g.impressions >= MIN_IMPRESSIONS);

const lines = [
  '# Bar profile metadata: the Search Console zero-click set, before and after',
  '',
  `_Recorded ${new Date().toISOString().slice(0, 10)} from the Pages.csv export, last 7 days._`,
  '',
  `**The tracked cohort: ${zero.length} bar profiles** at position 5 to 15, at least ${MIN_IMPRESSIONS} impressions each,`,
  `zero clicks. ${zero.reduce((a, g) => a + g.impressions, 0)} impressions, 0 clicks, 0.00% CTR between them.`,
  '',
  `The whole zero-click tail is wider: ${allZero.length} profiles at position 5 to 15 with`,
  `${allZero.reduce((a, g) => a + g.impressions, 0)} impressions and no clicks at all. The table below is the cohort,`,
  'because a page with three impressions cannot show a CTR change.',
  '',
  'Compare the same set in two weeks.',
  '',
  '| Page | Impressions | Position | Title before | Title after | Description before | Description after |',
  '|---|---|---|---|---|---|---|',
];
const cell = (s: string) => s.replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
for (const g of zero) {
  const slug = g.url.split('/bars/')[1];
  const r = bySlug.get(slug);
  if (!r) { lines.push(`| ${slug} | ${g.impressions} | ${g.position} | not in the active table | | | |`); continue; }
  lines.push(`| ${slug} | ${g.impressions} | ${g.position} | ${cell(r.oldTitle)} | ${cell(r.newTitle)} | ${cell(r.oldDesc).slice(0, 180)} | ${cell(r.newDesc)} |`);
}
writeFileSync('Claude outputs/bar-meta-zero-click-baseline.md', lines.join('\n') + '\n');
console.log(`\nzero-click set: ${zero.length} pages, ${zero.reduce((a, g) => a + g.impressions, 0)} impressions -> Claude outputs/bar-meta-zero-click-baseline.md`);

writeFileSync('/tmp/claude-501/bar-meta-all.json', JSON.stringify(out));
