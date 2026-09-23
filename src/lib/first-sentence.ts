/**
 * The first sentence of a paragraph, for the list-page band (task 112):
 * the band shows one grey line that must never break mid-sentence, so it
 * shows the first sentence whole rather than a clamped run of the intro.
 *
 * A sentence ends at ".", "!" or "?" (an optional closing quote or bracket
 * after it) followed by whitespace and an upper-case letter, a digit or an
 * opening quote. A period after a known abbreviation ("No. 69", "St. James",
 * "Dr.") or a single initial is not an end. Falls back to the whole text when
 * no boundary is found. Never touches the text itself.
 */
const ABBREVIATIONS = new Set(['no', 'nos', 'st', 'mt', 'dr', 'mr', 'mrs', 'ms', 'jr', 'sr', 'vs', 'etc', 'approx', 'ave', 'blvd', 'rd']);

export function firstSentence(text: string | null | undefined): string {
  if (!text) return '';
  const t = text.trim();
  const re = /([.!?])(["'’”)]?)\s+(?=["'“(]?[A-Z0-9])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    if (m[1] === '.') {
      const before = t.slice(0, m.index);
      const word = (/([A-Za-z]+)$/.exec(before) || [])[1] || '';
      if (ABBREVIATIONS.has(word.toLowerCase()) || /^[A-Z]$/.test(word)) continue;
    }
    return t.slice(0, m.index + 1 + m[2].length).trim();
  }
  return t;
}
