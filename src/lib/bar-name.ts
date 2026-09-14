/**
 * Detection of directory-style noise in a bar's name.
 *
 * Bars arrive from imports and from the public add-your-bar form with the
 * city or the venue type glued onto the name ("Kura Stockholm", "Alenka
 * Cocktail bar Prague"), because that is how aggregator listings write them.
 * A name-quality audit found 119 such rows, so the accumulation is steady.
 *
 * This DETECTS and does not rewrite. Stripping automatically would be wrong
 * often enough to be dangerous: plenty of venues really are called "Wave
 * Cocktail Bar", "Experimental Cocktail Club" or "Handshake Speakeasy", and
 * a few genuinely carry their city ("Harry's New York Bar"). Only the venue's
 * own channels can settle it, so the job here is to raise a hand at the point
 * a human is already reviewing the record.
 */

/** Venue-type phrases that commonly get appended to an imported name. */
const TYPE_SUFFIXES = [
  'cocktail bar',
  'cocktail club',
  'cocktail lounge',
  'cocktail room',
  'speakeasy bar',
  'speakeasy',
  'rooftop bar',
  'sky bar',
  'wine bar',
  'hotel bar',
  'tiki bar',
  'whisky bar',
  'whiskey bar',
  'gin bar',
  'music bar',
  'lounge bar',
  'bar & lounge',
  'bar and lounge',
  'brew pub',
  'brewpub',
];

/** Separators an aggregator might use before the appended part. */
const SEP = '[\\s\\-\\u2013\\u2014|,]+';

function endsWithPhrase(name: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${SEP}${escaped}\\s*$`, 'i').test(name);
}

export interface NameFlag {
  /** 'city' when the bar's own city is appended, 'type' for a venue type. */
  kind: 'city' | 'type';
  /** The appended phrase exactly as it appears at the end of the name. */
  suffix: string;
  /** Reviewer-facing explanation. */
  message: string;
}

/**
 * Flag a name that looks like it carries an appended city or venue type.
 *
 * Returns null for a clean name. A name that is ONLY the suffix is never
 * flagged: "The Cocktail Club" and "Sky Bar" are the venue's whole name, not
 * a name plus a label.
 */
export function flagBarName(
  name: unknown,
  city?: unknown,
  type?: unknown
): NameFlag | null {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (!trimmed) return null;

  // The city the record itself claims, appended to the end of the name.
  if (typeof city === 'string' && city.trim()) {
    const c = city.trim();
    if (endsWithPhrase(trimmed, c) && trimmed.toLowerCase() !== c.toLowerCase()) {
      return {
        kind: 'city',
        suffix: c,
        message: `Name ends with its own city ("${c}"). Check the venue's own site or Instagram: strip it unless the city is genuinely part of the name, or unless this is an outpost of a multi-city brand where the city disambiguates.`,
      };
    }
  }

  // A venue-type phrase on the end. Longest first, so "speakeasy bar" wins
  // over "speakeasy" and the reported suffix is the full one.
  const byLength = [...TYPE_SUFFIXES].sort((a, b) => b.length - a.length);
  for (const phrase of byLength) {
    if (!endsWithPhrase(trimmed, phrase)) continue;
    // Guard: the name must have something before the suffix.
    const head = trimmed.slice(0, trimmed.toLowerCase().lastIndexOf(phrase)).replace(/[\s\-–—|,]+$/, '');
    if (!head || /^the$/i.test(head)) return null;
    const echoesType =
      typeof type === 'string' && type.trim().toLowerCase() === phrase.toLowerCase();
    return {
      kind: 'type',
      suffix: phrase,
      message: `Name ends with the venue type "${phrase}"${echoesType ? ', which repeats this bar’s type field' : ''}. Check the venue's own site or Instagram: many bars really are named this way, so only strip it if the venue does not use it.`,
    };
  }

  return null;
}
