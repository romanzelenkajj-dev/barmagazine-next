#!/usr/bin/env node
/**
 * Article <-> bar mentions, the CONSERVATIVE half.
 *
 * Scans every published article's text for the FULL name of an active bar
 * and links the pair only when the article also names the bar's city. The
 * output feeds two blocks: "Mentioned in BarMagazine" on the profile
 * (profile -> article) and "Bars in this article" on the article
 * (article -> profile). Neither edits WordPress content.
 *
 * Generic names (short, or a common word such as Atlas or Manhattan) match
 * far too easily, so they are never linked here: they are written to
 * claude/article-mentions-held.md for a hand check instead.
 *
 * Output: src/lib/article-mentions.generated.json, committed, regenerated on
 * demand with `node scripts/build-article-mentions.mjs`. It reads
 * .env.local for Supabase when the env is not already set.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const OUT = join(root, 'src/lib/article-mentions.generated.json');
const HELD = join(root, 'claude/article-mentions-held.md');
// Pairs confirmed by hand ("bar-slug -> article-slug", '#' comments). A
// confirmed pair is linked whatever the name looks like; it is the answer to
// the held list, and it survives every regeneration because it lives here.
const CONFIRMED = join(root, 'claude/article-mentions-confirmed.txt');
// Pairs the automatic rule gets wrong (same format). The classic case is a
// multi-outpost brand: the Dubai top ten mentions "the Madrid original" in
// passing, which satisfies name-plus-city for the Madrid row too.
const EXCLUDED = join(root, 'claude/article-mentions-excluded.txt');
const SITE = 'https://barmagazine.com';
const WP_API = process.env.WP_API ?? 'https://public-api.wordpress.com/wp/v2/sites/romanzelenka-wjgek.wpcomstaging.com';

function env(name) {
  if (process.env[name]) return process.env[name];
  for (const f of ['.env.local', '.env.vercel']) {
    const p = join(root, f);
    if (!existsSync(p)) continue;
    const m = new RegExp(`^${name}=(.*)$`, 'm').exec(readFileSync(p, 'utf8'));
    if (m) return m[1].trim().replace(/^"|"$/g, '');
  }
  return undefined;
}

const SUPA = env('NEXT_PUBLIC_SUPABASE_URL');
const KEY = env('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const fold = s => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
const strip = h => h.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ');

// Names that match common prose. Anything this short, or in this list, is
// held for a hand check rather than linked.
const GENERIC = new Set(['manhattan', 'atlas', 'amaro', 'artifact', 'behind', 'bisou', 'bisous', 'line', 'cure', 'swift', 'zest', 'coa', 'sips', 'monk', 'dukes', 'combat', 'velvet', 'opium', 'vesper', 'julep', 'martinez', 'rita', 'soko', 'aer', 'stir', 'gorilla', 'lubna', 'canon', 'dante', 'orchard', 'nomad', 'nightjar', 'paradiso', 'oriole', 'genever', 'penicillin', 'bluebird', 'darkside', 'himitsu', 'volare', 'thunderbolt', 'classique', 'arbella', 'margo', 'amelia', 'angelita', 'botanist', 'the spirit', 'the court', 'the hook', 'the curator', 'the back room', 'the bar', 'holiday', 'pdt', 'aabbcc', 'raa']);
const isGeneric = name => fold(name).length <= 6 || GENERIC.has(fold(name));

async function bars() {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const res = await fetch(`${SUPA}/rest/v1/bars?select=slug,name,city&is_active=eq.true&order=slug.asc&offset=${offset}&limit=1000`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    if (!res.ok) throw new Error(`bars ${res.status}`);
    const page = await res.json();
    out.push(...page);
    if (page.length < 1000) break;
  }
  return out;
}

async function posts() {
  const out = [];
  for (let page = 1; ; page++) {
    // date and jetpack_featured_media_url feed the profile's mentions card
    // (thumbnail and publish date); they change nothing about matching.
    const res = await fetch(`${WP_API}/posts?per_page=100&page=${page}&_fields=slug,title,content,excerpt,date,jetpack_featured_media_url&status=publish`);
    if (res.status === 400) break; // past the last page
    if (!res.ok) throw new Error(`posts ${res.status}`);
    const data = await res.json();
    out.push(...data);
    if (data.length < 100) break;
  }
  return out;
}

async function main() {
  if (!SUPA || !KEY) throw new Error('Supabase env missing');
  const [allBars, allPosts] = await Promise.all([bars(), posts()]);
  const texts = allPosts.map(p => ({
    slug: p.slug,
    // WP titles carry |pipes| as bold markers for the card renderer; plain
    // text here.
    title: strip(p.title.rendered).replace(/\|/g, '').replace(/\s+/g, ' ').trim(),
    date: typeof p.date === 'string' ? p.date.slice(0, 10) : null,
    image: typeof p.jetpack_featured_media_url === 'string' && p.jetpack_featured_media_url ? p.jetpack_featured_media_url : null,
    text: ' ' + fold(strip(`${p.title.rendered} ${p.content.rendered}`)) + ' ',
    // Profiles the article body ALREADY links. The article-side block must
    // not add a second link to the same profile.
    linked: new Set([...`${p.content.rendered}`.matchAll(/href="(?:https?:\/\/(?:www\.)?barmagazine\.com)?\/bars\/([^/"?#]+)/g)].map(m => m[1])),
  }));
  const bySlug = Object.fromEntries(texts.map(t => [t.slug, t]));
  const activeSlugs = new Set(allBars.map(b => b.slug));

  // Confirmed pairs: read, validated against live bars and live posts.
  const confirmed = new Map(); // bar -> Set(article)
  const badPairs = [];
  if (existsSync(CONFIRMED)) {
    for (const raw of readFileSync(CONFIRMED, 'utf8').split('\n')) {
      const line = raw.replace(/#.*$/, '').trim();
      if (!line) continue;
      const m = /^([a-z0-9-]+)\s*->\s*([a-z0-9-]+)$/.exec(line);
      if (!m) { badPairs.push(`unparseable: ${raw}`); continue; }
      const [, bar, art] = m;
      if (!activeSlugs.has(bar)) { badPairs.push(`no active bar: ${bar}`); continue; }
      if (!bySlug[art]) { badPairs.push(`no published article: ${art}`); continue; }
      (confirmed.get(bar) || confirmed.set(bar, new Set()).get(bar)).add(art);
    }
  }

  const excluded = new Map(); // bar -> Set(article)
  if (existsSync(EXCLUDED)) {
    for (const raw of readFileSync(EXCLUDED, 'utf8').split('\n')) {
      const m = /^([a-z0-9-]+)\s*->\s*([a-z0-9-]+)$/.exec(raw.replace(/#.*$/, '').trim());
      if (m) (excluded.get(m[1]) || excluded.set(m[1], new Set()).get(m[1])).add(m[2]);
    }
  }

  // Names shared by two or more active rows (Zuma, Paradiso, Employees
  // Only, Attaboy, Salmon Guru). For these the city must sit in the SAME
  // SENTENCE as the name, not merely somewhere in the article: a ranking
  // piece names exactly one venue, and "Madrid" appearing three paragraphs
  // later is how the Dubai outpost inherited the Madrid original's
  // placings (Roman, 2026-09-15).
  const nameCount = new Map();
  const siblingCities = new Map(); // folded name -> Set(folded city) of the rows sharing it
  for (const b of allBars) {
    const n = fold(b.name || '');
    nameCount.set(n, (nameCount.get(n) || 0) + 1);
    (siblingCities.get(n) || siblingCities.set(n, new Set()).get(n)).add(fold(b.city || ''));
  }
  const sentencesOf = new Map(); // article slug -> folded sentences
  const sentences = t => {
    if (!sentencesOf.has(t.slug)) sentencesOf.set(t.slug, t.text.split(/(?<=[.!?])\s+|\s{2,}|\|/).map(s => ' ' + s.trim() + ' '));
    return sentencesOf.get(t.slug);
  };

  const byBar = {}; // bar slug -> [{slug,title}]
  const held = [];  // {bar, name, city, articles:[]}
  const multiRowDropped = []; // audit: pairs the same-sentence rule removed
  for (const b of allBars) {
    if (!b.name || b.name.length < 3) continue;
    const name = fold(b.name);
    const city = fold(b.city || '');
    // Whole-word match on the full name; a name inside a longer name
    // ("Bar Leone" inside "Bar Leone Shanghai") is not a mention of this bar.
    const re = new RegExp(`(^|[^a-z0-9])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`);
    const excl = excluded.get(b.slug) || new Set();
    const multiRow = (nameCount.get(name) || 0) > 1;
    const nameRe = new RegExp(re.source, 'g');
    const cityOk = t => {
      if (!city) return true;
      if (!multiRow) return t.text.includes(city);
      // The sibling rows' cities COMPETE for the mention, and the nearest
      // one wins. Three steps:
      //   1. The title decides when it can: a city top ten is about that
      //      city, so "Top 10 Bars in Dubai" belongs to the Dubai outpost
      //      and never to the Madrid original, whatever the body says.
      //   2. Otherwise the first sibling city AFTER the name (within 100
      //      characters) decides: lists print "Salmon Guru, Madrid 64" and
      //      "Salmon Guru – Madrid", and in a dense list the entry BEFORE
      //      ends with its own city right next to our name, so "nearest in
      //      either direction" read "…Zuma – Dubai Salmon Guru – Madrid" as
      //      Dubai. Only when nothing follows does the nearest city before
      //      the name count ("Direct from Madrid, Salmon Guru…").
      //   3. If no sibling city appears near any occurrence, fall back to
      //      the same-sentence test.
      const sibs = [...siblingCities.get(name)].filter(Boolean);
      const title = fold(t.title);
      if (title.includes(city)) return true;
      if (sibs.some(c => c !== city && title.includes(c))) return false;
      let sawSibling = false;
      for (const m of t.text.matchAll(nameRe)) {
        const end = m.index + m[0].length;
        const after = t.text.slice(end, end + 100);
        let first = null;
        for (const c of sibs) {
          const i = after.indexOf(c);
          if (i !== -1 && (!first || i < first.i)) first = { c, i };
        }
        if (!first) {
          const before = t.text.slice(Math.max(0, m.index - 100), m.index);
          for (const c of sibs) {
            const i = before.lastIndexOf(c);
            if (i !== -1 && (!first || i > first.i)) first = { c, i };
          }
        }
        if (first) { sawSibling = true; if (first.c === city) return true; }
      }
      if (sawSibling) return false;
      return sentences(t).some(s => re.test(s) && s.includes(city));
    };
    const loose = isGeneric(b.name) ? [] : texts.filter(t => re.test(t.text) && (!city || t.text.includes(city)) && !excl.has(t.slug));
    const auto = loose.filter(cityOk);
    if (multiRow) for (const t of loose) if (!auto.includes(t)) multiRowDropped.push(`${b.slug} -> ${t.slug}`);
    const conf = confirmed.get(b.slug) || new Set();
    const chosen = new Map(auto.map(t => [t.slug, t]));
    for (const art of conf) chosen.set(art, bySlug[art]);
    if (chosen.size > 0) {
      byBar[b.slug] = [...chosen.values()].map(h => ({ slug: h.slug, title: h.title, date: h.date ?? null, image: h.image ?? null })).sort((x, y) => x.title.localeCompare(y.title));
    }
    if (isGeneric(b.name)) {
      // Still held: generic-name matches that nobody has confirmed yet.
      const remaining = texts.filter(t => re.test(t.text) && (!city || t.text.includes(city)) && !conf.has(t.slug));
      if (remaining.length > 0) held.push({ bar: b.slug, name: b.name, city: b.city, articles: remaining.map(h => h.slug) });
    }
  }

  const meta = Object.fromEntries(allBars.map(b => [b.slug, { name: b.name, city: b.city }]));
  const byArticle = {}; // article slug -> [{slug,name,city}]
  let alreadyLinked = 0;
  for (const [bar, arts] of Object.entries(byBar)) {
    for (const a of arts) {
      // The profile side keeps the mention; the article side skips it when
      // the body already links this profile, so no article carries two
      // links to one bar.
      if (bySlug[a.slug]?.linked.has(bar)) { alreadyLinked++; continue; }
      (byArticle[a.slug] ||= []).push({ slug: bar, ...meta[bar] });
    }
  }
  for (const k of Object.keys(byArticle)) byArticle[k].sort((x, y) => x.name.localeCompare(y.name));
  if (badPairs.length) console.warn(`[article-mentions] ${badPairs.length} confirmed pair(s) ignored:\n  ` + badPairs.join('\n  '));
  if (multiRowDropped.length) console.log(`[article-mentions] same-sentence rule dropped ${multiRowDropped.length} multi-row pair(s):\n  ` + multiRowDropped.join('\n  '));
  else console.log('[article-mentions] same-sentence rule dropped nothing');

  const payload = {
    generatedAt: new Date().toISOString(),
    rule: 'full bar name, whole-word, article text also names the bar\'s city; generic names held',
    counts: {
      bars: Object.keys(byBar).length,
      articles: Object.keys(byArticle).length,
      links: Object.values(byBar).reduce((n, a) => n + a.length, 0),
      confirmedPairs: [...confirmed.values()].reduce((n, s) => n + s.size, 0),
      articleSideSkippedAlreadyLinked: alreadyLinked,
      held: held.length,
    },
    byBar,
    byArticle,
  };
  writeFileSync(OUT, JSON.stringify(payload, null, 1) + '\n');

  const lines = [
    '# Article mentions held for a hand check',
    '',
    `Generated ${payload.generatedAt} by scripts/build-article-mentions.mjs.`,
    'These bar names are short or generic enough that a text match is not',
    'evidence of a mention. NONE of these are linked. Confirm each pair by',
    'reading the article, then either add the bar name to a per-article',
    'allowlist in the script or leave it here.',
    '',
    '| Bar | Name | City | Articles matching name + city |',
    '|---|---|---|---|',
    ...held.sort((a, b) => a.bar.localeCompare(b.bar)).map(h => `| ${h.bar} | ${h.name} | ${h.city} | ${h.articles.map(s => `${SITE}/${s}`).join('<br>')} |`),
    '',
  ];
  writeFileSync(HELD, lines.join('\n'));
  console.log(`[article-mentions] ${payload.counts.bars} bars, ${payload.counts.articles} articles, ${payload.counts.links} links; ${held.length} held -> ${HELD}`);
}

main().catch(err => { console.error(err); process.exit(1); });
