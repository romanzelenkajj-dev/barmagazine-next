/**
 * Award claims in a description must be backed by the bar's accolade records.
 *
 * WHY THIS EXISTS (task 102, 2026-09-22). An audit of every active bar found
 * 460 descriptions naming an award program. Most were right. The ones that
 * were not had a shape a reader cannot see: Polite Provisions said it won
 * its Spirited Award "at the 2025 Spirited Awards" when the win was 2014; Young
 * Blood said "in 2025" for a 2023 placing; Spare Room's hotel-bar win moved
 * from 2020 to 2025; Tiki-Ti's Timeless award from 2023 to 2025; Bar Mood was
 * "on Asia's 50 Best every year since 2019" with two years missing. Every
 * award badge on a profile comes from `bars.accolades`, so a sentence that
 * disagrees with the records is a page arguing with itself.
 *
 * THE RULE, in Roman's words: a description may name a program (50 Best,
 * Spirited, James Beard, Pinnacle, Bartenders' Choice) only if the bar has an
 * accolade record for that program, and any year in an award sentence must
 * match a record.
 *
 * WHAT IT DOES NOT DO. It does not verify the record against the official
 * list; that is the audit's job. It checks that the prose and the records
 * agree, which is the invariant that keeps a corrected record from being
 * undone by an uncorrected sentence, or the reverse.
 *
 * Pure: no network, no database. `scripts/audit-award-claims.mjs` feeds it the
 * live rows; the vitest file feeds it fixtures, including the real failures
 * above so they cannot come back.
 */

/**
 * Program phrases -> org_key(s) that satisfy them.
 *
 * Order matters: the regional 50 Best lists are matched before the generic
 * "50 Best" so that "Asia's 50 Best Bars" resolves to a50b and not to w50b.
 * The generic phrase accepts any of the family, because a description that
 * says "a World's 50 Best fixture" about a bar with only a regional record is
 * loose rather than false, and the audit judged that acceptable.
 */
export const PROGRAMS = [
  { re: /North America[’']s 50 Best/i, keys: ['na50b'], label: "North America's 50 Best" },
  { re: /Asia[’']s 50 Best/i, keys: ['a50b'], label: "Asia's 50 Best" },
  { re: /Europe[’']s 50 Best/i, keys: ['e50b'], label: "Europe's 50 Best" },
  { re: /World[’']s 50 Best Bars|\b50 Best Bars\b|World[’']s 50 Best\b/i, keys: ['w50b', 'a50b', 'e50b', 'na50b'], label: "World's 50 Best" },
  { re: /Spirited Award|Tales of the Cocktail/i, keys: ['totc'], label: 'Spirited Awards' },
  { re: /James Beard/i, keys: ['jbf'], label: 'James Beard' },
  // Case-sensitive on purpose: "pin shop" is not the Pinnacle Guide.
  { re: /Pinnacle Guide|\bPINs?\b/, keys: ['pinnacle'], label: 'Pinnacle Guide' },
  { re: /Bartenders[’']? Choice Award/i, keys: ['bca'], label: "Bartenders' Choice" },
];

/**
 * Phrases that look like a program but are not an award of THIS bar, and so
 * carry no record: the 50 Best Discovery directory, the Restaurants list, and
 * the special awards handed out at the ceremony to people or to design.
 */
const NOT_AN_AWARD_OF_THE_BAR = /50 Best Discovery|Discovery (list|guide|platform)|50 Best Restaurants|Bartenders[’']? Bartender|One To Watch|Sustainable Bar Award|Bar Design Award|Bartender of the Year|Best (American|U\.?S\.?|International) Bartender|Bar Mentor|Cocktail Service|Beverage Service|Brand Ambassador/i;

/**
 * A year that is a date, not an award year. "opened in 2014" shares a
 * sentence with "No.37 in 2024" often enough that the audit could not treat
 * every year in an award sentence as a claim. "since 2019" is NOT here on
 * purpose: "on the list every year since 2019" is exactly the kind of claim
 * this guard exists to check.
 */
const DATE_NOT_AWARD = /(opened|founded|established|launched|opening|born|closed|began|since opening|institution since|open since)[^.;]{0,60}?\b(19|20)\d\d/gi;

const YEAR = /\b(19[89]\d|20[0-3]\d)\b/g;

function sentences(text) {
  return String(text || '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/);
}

/**
 * Check one bar. Returns a list of problems; empty means the prose and the
 * records agree.
 *
 * @param {{slug:string, description?:string|null, accolades?:any}} bar
 * @param {{exempt?: Record<string,string>}} [opts] slugs whose program
 *   mentions are about somebody else (a sister bar, a chef, a consultant) and
 *   so are allowed without a record, with the reason recorded next to them.
 */
export function checkAwardClaims(bar, opts = {}) {
  const exempt = opts.exempt || {};
  const problems = [];
  const records = Array.isArray(bar.accolades) ? bar.accolades : [];
  const keysHeld = new Set(records.map(r => r.org_key));
  const yearsByKey = new Map();
  for (const r of records) {
    if (!yearsByKey.has(r.org_key)) yearsByKey.set(r.org_key, new Set());
    yearsByKey.get(r.org_key).add(Number(r.year));
  }

  for (const sentence of sentences(bar.description)) {
    if (NOT_AN_AWARD_OF_THE_BAR.test(sentence)) continue;
    let named = PROGRAMS.filter(p => p.re.test(sentence));
    // "Asia's 50 Best Bars" also matches the generic World's 50 Best pattern.
    // A regional match is the specific claim; drop the generic one so a bar
    // is not asked for a world record it never claimed.
    if (named.some(p => p.keys.length === 1 && p.label.endsWith("50 Best"))) {
      named = named.filter(p => !(p.label === "World's 50 Best" && !/World[’']s 50 Best/i.test(sentence)));
    }
    if (!named.length) continue;
    if (exempt[bar.slug]) continue;

    const satisfiedKeys = new Set();
    for (const p of named) {
      const held = p.keys.filter(k => keysHeld.has(k));
      if (!held.length) {
        problems.push({ slug: bar.slug, kind: 'no-record', program: p.label, sentence });
      } else {
        held.forEach(k => satisfiedKeys.add(k));
      }
    }
    if (!satisfiedKeys.size) continue; // already reported as no-record

    const dated = new Set();
    for (const m of sentence.matchAll(DATE_NOT_AWARD)) {
      for (const y of m[0].matchAll(YEAR)) dated.add(Number(y[1]));
    }
    // A sentence that names any 50 Best list is checked against the whole
    // family's years: "No.3 in the world (2020), No.30 in Europe 2026" names
    // Europe and cites a world year, and both are true.
    const FAMILY = ['w50b', 'a50b', 'e50b', 'na50b'];
    if (FAMILY.some(k => satisfiedKeys.has(k))) FAMILY.forEach(k => { if (keysHeld.has(k)) satisfiedKeys.add(k); });
    const recordYears = new Set();
    satisfiedKeys.forEach(k => (yearsByKey.get(k) || new Set()).forEach(y => recordYears.add(y)));
    // A year is an award-year claim only when it sits close to a program
    // phrase. "Mixology's Bar of the Year Austria 2025 and the only Austrian
    // entry on Europe's 50 Best" cites 2025 for a different award; the 40
    // characters are enough to keep "every year since 2019" and "in 2023".
    const NEAR = 40;
    const spans = [];
    for (const p of named) { const m = p.re.exec(sentence); if (m) spans.push([m.index, m.index + m[0].length]); }
    for (const m of sentence.matchAll(YEAR)) {
      const y = Number(m[1]);
      if (dated.has(y)) continue;
      const near = spans.some(([a, b]) => m.index >= a - NEAR && m.index <= b + NEAR);
      if (!near) continue;
      if (!recordYears.has(y)) {
        problems.push({ slug: bar.slug, kind: 'year-mismatch', year: y, recordYears: [...recordYears].sort(), sentence });
      }
    }
  }
  return problems;
}

/**
 * Bars whose descriptions name a program about SOMEBODY ELSE. Kept here, not
 * in the data, so the reason travels with the exemption and a reviewer can
 * argue with it. Add a slug only with the sentence in mind.
 */
export const AWARD_CLAIM_EXEMPT = {
  'kyara': "names Tayēr + Elementary's World's 50 Best placing; Kyara is the founders' new bar",
  'shakerato': "names Handshake Speakeasy's World's 50 Best placing; Shakerato is the team's Amsterdam bar",
  'white-whale': "names Attaboy's North America's 50 Best placing for its consulting partner Sam Ross",
  'bar-ana': "the James Beard semifinalist is the pastry chef, not the bar",
  'cafe-la-trova': "the James Beard winner is the collaborating chef, not the bar",
  'la-jefa-philadelphia': "James Beard is named for a collaborator and for a different venue",
  'yacht-club-denver': "the James Beard finalists are the owners, in a person category",
  'superbueno': "the James Beard nod is for Outstanding Cocktail Service, a person category",
  'side-door': "the Bartenders' Bartender Award is a person award to Bannie Kang",
  'julep': "names North America's 50 Best in the same sentence as its James Beard win; both are on record",
  'salmon-guru-milan': "says the Madrid flagship is a World's 50 Best fixture; the Milan bar makes no claim of its own",
  'nocturno': "names Youngblood's North America's 50 Best placing for a bar manager who used to work there",
  'walrus-and-carpenter-seattle': "counts the city's bars on the extended list; no claim about this one",
  'off-the-record-dc': "speculates about the next North America's 50 Best list; no claim",
  'bisou-canal': "prose about the launch of Europe's 50 Best Bars; no claim",
  'wing-lei-bar': "hosted the Asia's 50 Best Bars 2025 ceremony; hosting is not a placing",
  'bar-tonique': "mentions the Tales of the Cocktail festival as a fact about New Orleans, not as an award",
  'floreria-atlantico-dc': "the World's 50 Best fixture is the Buenos Aires original; the DC outpost's own record is its 2026 Spirited nod",
};
