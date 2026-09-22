/**
 * Render-time bold highlighting for bar descriptions and excerpts.
 *
 * The data stays plain text — markup is NEVER written into the DB. This
 * computes which spans of a given string deserve <strong> at render time, so
 * the rules can change tomorrow without touching a single row.
 *
 * Two kinds of span:
 *  - exact award/institution phrases from a fixed list (case-insensitive,
 *    word-boundary safe), and
 *  - a person's name directly following a role title ("bar director Maura
 *    Milia" bolds only "Maura Milia").
 *
 * Capped at MAX_BOLD_SPANS per text so nothing looks shouty; first spans in
 * reading order win. Pure string→segments so it is unit-testable; the JSX
 * lives in components/HighlightedText.
 */

/** Phrases worth bolding wherever they appear. */
const PHRASES = [
  "World's 50 Best Bars",
  "Asia's 50 Best Bars",
  "Europe's 50 Best Bars",
  "North America's 50 Best Bars",
  '50 Best Discovery',
  'Tales of the Cocktail',
  'Spirited Awards',
  "Bartenders' Choice Awards",
  'Michelin',
  'James Beard',
];

/** Longest-first so "executive bar manager" wins over "bar manager" and
    "head mixologist" over "mixologist". */
const ROLES = [
  'executive bar manager',
  'creative director',
  'head mixologist',
  'head bartender',
  'beverage director',
  'bar director',
  'head of bars',
  'bar manager',
  'mixologist',
  'bar chef',
  'co-founder',
  'founder',
  'owner',
];

// Award phrase + two ranks + a name is a normal sentence now that rank
// tokens bold too — 4 forced good spans to fight for room.
export const MAX_BOLD_SPANS = 6;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const PHRASE_RE = new RegExp(`\\b(?:${PHRASES.map(escapeRe).join('|')})\\b`, 'gi');

// Case-insensitive for the role only. The name is matched separately and
// case-SENSITIVELY — folding the whole pattern would let [A-Z] match
// lowercase and bold ordinary words after "owner".
const ROLE_RE = new RegExp(`\\b(?:${ROLES.map(escapeRe).join('|')})s?\\s+`, 'gi');
// Tokens joined by whitespace rather than each requiring trailing whitespace:
// "co-founder David Barzelay, the team…" must capture BOTH names — a comma
// (or dash, or sentence end) right after the surname is the normal case, and
// the old form dropped every token that touched punctuation. Lowercase
// particles (Eric VAN Beek, Ana DE LA Rosa) may sit between capitalized
// tokens — a name never ends on one.
const NAME_PATTERN = "[A-Z][\\w.'-]*(?:\\s+(?:(?:van|von|de|del|der|da|di|la|le)\\s+){0,2}[A-Z][\\w.'-]*){0,2}";
const NAME_RE = new RegExp(`^${NAME_PATTERN}`);

// Competition titles bold the adjacent name too — descriptions credit
// people through wins as often as through job titles.
const COMPETITIONS = [
  'Bacardi Legacy',
  'World Class',
  "Bartenders' Bartender",
  'Bartender of the Year',
];

// Forward order: "World Class winner Kaitlyn Stewart".
const COMPETITION_ROLE_RE = new RegExp(
  `\\b(?:${COMPETITIONS.map(escapeRe).join('|')})[\\w\\s]{0,20}?\\b(?:champion|winner)s?\\s+`,
  'gi'
);

// Apposition order: "Eric van Beek, the 2018 Bacardi Legacy World Champion".
// The clause after the comma must contain BOTH a known competition and
// champion/winner before any clause break, so "Mexico City, the 2024 host"
// and "Maria, the marathon winner" stay plain.
const NAME_APPOSITION_RE = new RegExp(
  `\\b(${NAME_PATTERN}),\\s+(?:the\\s+)?(?:\\d{4}\\s+)?([^,.;:]{0,60})`,
  'g'
);
const APPOSITION_QUALIFIER_RE = new RegExp(
  `\\b(?:${COMPETITIONS.map(escapeRe).join('|')})\\b`,
  'i'
);

// Rank tokens ("No. 12", "No.12", "#93") — bold ONLY in a ranking context,
// so street numbers and seat counts stay plain.
const RANK_RE = /\bNo\.\s?\d+|#\d+/g;

// A sentence is a ranking context when it names a list phrase or talks about
// ranking. "50 Best" alone counts too — the full phrases don't cover
// wordings like "on the 50 Best list".
//
// The bare word "list" is NOT a context (task 104). "The cocktail list runs
// to … Aging Partiers #3" is a drinks menu, and it bolded a drink's name as
// if it were a placing. "on the 50 Best list" still qualifies through
// "50 Best"; a ranking sentence that says only "list" and nothing else about
// ranking is rare enough to lose.
const RANK_CONTEXT_RE = new RegExp(
  `\\b(?:globally|ranked|50\\s?Best|${PHRASES.map(escapeRe).join('|')})\\b`,
  'i'
);

// A "#N" that directly follows a capitalised word is part of a name (Aging
// Partiers #3, Studio #2), not a placing. Rankings are written "ranked #93",
// "at #12", "No. 4 on …": the word before the number is lowercase, unless it
// opens the sentence ("Ranked #7 globally"), which is why the few words that
// introduce a rank are exempt. Applied to "#N" only; "No. N" never appears
// as a name suffix in this directory, and "Bars No. 12" is a real ranking.
const CAPITALISED_WORD_BEFORE_RE = /(?:^|\s)([A-Z][\w'&.-]*)\s+$/;
const RANK_LEAD_WORDS = /^(?:Ranked|Rated|Placed|Listed|Named|Number|Position|Currently|Now|At)$/;
function followsAName(before: string): boolean {
  const m = CAPITALISED_WORD_BEFORE_RE.exec(before);
  return !!m && !RANK_LEAD_WORDS.test(m[1]);
}

// Sentence ends: [.!?] then whitespace then a capital or quote. No
// lookbehind (old Safari throws at parse time), and crucially "No. 12"
// does NOT split — the period is followed by a digit.
const SENTENCE_BOUNDARY_RE = /[.!?]+\s+(?=[A-Z"'\u201C])/g;

/** [start, end) sentence windows over the text. */
function sentenceSpans(text: string): Span[] {
  const spans: Span[] = [];
  let start = 0;
  for (const m of Array.from(text.matchAll(SENTENCE_BOUNDARY_RE))) {
    const end = m.index! + m[0].length;
    spans.push({ start, end });
    start = end;
  }
  spans.push({ start, end: text.length });
  return spans;
}

export interface Segment {
  text: string;
  bold: boolean;
}

interface Span {
  start: number;
  end: number;
}

export function highlightSegments(text: string): Segment[] {
  if (!text) return [];

  const spans: Span[] = [];

  // Array.from, not for…of: this tsconfig target predates downlevel
  // iteration of RegExp iterators.
  for (const m of Array.from(text.matchAll(PHRASE_RE))) {
    spans.push({ start: m.index!, end: m.index! + m[0].length });
  }

  for (const m of Array.from(text.matchAll(ROLE_RE))) {
    const nameStart = m.index! + m[0].length;
    const name = NAME_RE.exec(text.slice(nameStart));
    if (name) {
      // Sentence punctuation clings to surnames ("…founder Monica Berg.") —
      // strip it so the bold ends on the name. Only the name goes bold,
      // never the role title.
      const captured = name[0].replace(/[.,;:!?]+$/, '');
      spans.push({ start: nameStart, end: nameStart + captured.length });
    }
  }

  // Forward competition credits: "World Class winner Kaitlyn Stewart".
  for (const m of Array.from(text.matchAll(COMPETITION_ROLE_RE))) {
    const nameStart = m.index! + m[0].length;
    const name = NAME_RE.exec(text.slice(nameStart));
    if (name) {
      const captured = name[0].replace(/[.,;:!?]+$/, '');
      spans.push({ start: nameStart, end: nameStart + captured.length });
    }
  }

  // Apposition credits: "Eric van Beek, the 2018 Bacardi Legacy World
  // Champion, operates…" — bold the name when its very next clause names a
  // competition win.
  for (const m of Array.from(text.matchAll(NAME_APPOSITION_RE))) {
    const clause = m[2] || '';
    if (APPOSITION_QUALIFIER_RE.test(clause) && /\b(?:champion|winner)s?\b/i.test(clause)) {
      spans.push({ start: m.index!, end: m.index! + m[1].length });
    }
  }

  // Rank numbers, gated per sentence: "No. 12 on North America's 50 Best
  // Bars, plus No. 93 globally" bolds both numbers; "seats 40 at #12 Main
  // Street" bolds nothing.
  const sentences = sentenceSpans(text);
  for (const sentence of sentences) {
    const body = text.slice(sentence.start, sentence.end);
    if (!RANK_CONTEXT_RE.test(body)) continue;
    for (const m of Array.from(body.matchAll(RANK_RE))) {
      if (m[0].startsWith('#')) {
        const before = body.slice(0, m.index!);
        // "&#8220;" is a stored HTML entity, not a placing. The data is
        // decoded now, but text sourced from WordPress can bring them back.
        if (before.endsWith('&')) continue;
        if (followsAName(before)) continue;
      }
      spans.push({
        start: sentence.start + m.index!,
        end: sentence.start + m.index! + m[0].length,
      });
    }
  }

  // Reading order; drop overlaps (a name inside a phrase match or vice
  // versa), then cap.
  spans.sort((a, b) => a.start - b.start || a.end - b.end);
  const kept: Span[] = [];
  for (const s of spans) {
    const last = kept[kept.length - 1];
    if (last && s.start < last.end) continue;
    kept.push(s);
    if (kept.length >= MAX_BOLD_SPANS) break;
  }

  if (kept.length === 0) return [{ text, bold: false }];

  const out: Segment[] = [];
  let cursor = 0;
  for (const s of kept) {
    if (s.start > cursor) out.push({ text: text.slice(cursor, s.start), bold: false });
    out.push({ text: text.slice(s.start, s.end), bold: true });
    cursor = s.end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), bold: false });
  return out;
}
