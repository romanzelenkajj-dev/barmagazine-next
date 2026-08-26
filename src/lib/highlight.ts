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

/** Longest-first so "executive bar manager" wins over "bar manager". */
const ROLES = [
  'executive bar manager',
  'head bartender',
  'beverage director',
  'bar director',
  'bar manager',
  'co-founder',
  'founder',
  'owner',
];

export const MAX_BOLD_SPANS = 4;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const PHRASE_RE = new RegExp(`\\b(?:${PHRASES.map(escapeRe).join('|')})\\b`, 'gi');

// Case-insensitive for the role only. The name is matched separately and
// case-SENSITIVELY — folding the whole pattern would let [A-Z] match
// lowercase and bold ordinary words after "owner".
const ROLE_RE = new RegExp(`\\b(?:${ROLES.map(escapeRe).join('|')})s?\\s+`, 'gi');
// Tokens joined by whitespace rather than each requiring trailing whitespace:
// "co-founder David Barzelay, the team…" must capture BOTH names — a comma
// (or dash, or sentence end) right after the surname is the normal case, and
// the old form dropped every token that touched punctuation.
const NAME_RE = /^[A-Z][\w.'-]*(?:\s+[A-Z][\w.'-]*){0,2}/;

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
