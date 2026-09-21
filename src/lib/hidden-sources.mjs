/**
 * Research sources we use to FIND bars but never name to a reader.
 *
 * WHY THIS EXISTS. Falstaff is a research source: it admits a bar, it goes in
 * `editorial_sources` as an audit trail, and nothing about it reaches a
 * visitor. No glasses, no points, not on a profile, not in a card, not in a
 * meta description, not in an owner email.
 *
 * That rule was already being broken before this guard existed. Two live
 * descriptions named it and one carried its score:
 *
 *   seiberts-bar: "first place in the Falstaff Barguide 2025/26 with 98 points"
 *   tur-7:        "American Bar of the Year in the Falstaff Bar Guide 2026"
 *
 * Both got in the ordinary way: whoever wrote the description worked from a
 * page that quoted the guide, and the guide's name came along with the facts.
 * That is not carelessness, it is what happens when you write a hundred
 * descriptions from sources that all cite the same guide. So the check belongs
 * in the machine rather than in the writer's attention.
 *
 * A FALSE REFUSAL IS CHEAP: reword the sentence. A false accept ships the
 * word to every reader of that profile and to Google. The thresholds below are
 * set accordingly.
 */

/** Named sources that must never appear in anything a visitor can read. */
export const HIDDEN_SOURCES = ['falstaff'];

/**
 * Scoring vocabulary of those guides. "98 points" and "four glasses" are how
 * Falstaff rates a bar, and quoting the score is naming the source without
 * using its name, which is the same leak wearing a hat.
 */
const SCORE_PATTERNS = [
  { re: /\b\d{2,3}\s*points?\b/i, what: 'a points score' },
  { re: /\b(one|two|three|four|five|\d)\s*glass(es)?\b/i, what: 'a glasses rating' },
  { re: /\bbar\s*guide\s*20\d\d\b/i, what: 'a bar-guide year' },
];

/**
 * The first violation in a piece of visitor-facing text, or null.
 *
 * @param {unknown} text
 * @returns {{kind: string, matched: string, what: string} | null}
 */
export function visitorCopyViolation(text) {
  if (typeof text !== 'string' || !text) return null;
  const lower = text.toLowerCase();
  for (const name of HIDDEN_SOURCES) {
    const i = lower.indexOf(name);
    if (i >= 0) {
      return {
        kind: 'hidden-source',
        matched: text.slice(Math.max(0, i - 40), i + name.length + 40).trim(),
        what: `the research source "${name}" is named`,
      };
    }
  }
  for (const { re, what } of SCORE_PATTERNS) {
    const m = text.match(re);
    if (m) return { kind: 'score', matched: m[0], what };
  }
  return null;
}

/**
 * Every visitor-facing field of a row, checked together.
 *
 * `admin_notes` is deliberately NOT checked: it is internal, and recording
 * where a bar came from is the whole point of keeping it.
 */
export const VISITOR_FIELDS = ['name', 'description', 'short_excerpt', 'status_note', 'specials', 'opening_hours'];

/** @returns {{field: string, kind: string, matched: string, what: string} | null} */
export function rowCopyViolation(row) {
  if (!row) return null;
  for (const field of VISITOR_FIELDS) {
    const v = visitorCopyViolation(row[field]);
    if (v) return { field, ...v };
  }
  return null;
}
