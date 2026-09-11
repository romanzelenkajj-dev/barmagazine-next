/**
 * Display-time formatting of opening hours per country convention.
 *
 * Stored `opening_hours` strings are free text, house-formatted from
 * enrichment ("Daily 5pm-12am (kitchen until 11pm)", "Mon–Thu 10:00–01:00,
 * Fri–Sun 10:00–02:00", multiline with "Sun closed"). Storage is NEVER
 * rewritten; this converts at render time only.
 *
 * Strategy: token conversion, not a full grammar. Only unambiguous time
 * tokens are touched - "5pm" / "5:30pm" / "noon" / "midnight" (12-hour) and
 * "17:00" (24-hour with a colon). Everything else, including day words,
 * punctuation, and free-text notes, passes through byte-for-byte, so a
 * string like "(kitchen until 11pm)" converts its time and keeps its words.
 * Bare integers ("happy hour 4-6") are ambiguous and are never converted.
 * A string with no recognizable time tokens renders exactly as stored.
 */

/**
 * Countries whose readers expect am/pm opening hours. Everyone else gets
 * 24-hour. Deliberately short - most of the world reads 24-hour. UK and
 * Ireland are included because venue hours there are near-universally
 * posted am/pm; flag to editorial if that call changes.
 */
const TWELVE_HOUR_COUNTRIES = new Set([
  'United States',
  'United Kingdom',
  'Ireland',
  'Canada',
  'Australia',
  'New Zealand',
  'Philippines',
  'India',
]);

export function hoursFormatForCountry(country: string | null | undefined): '12h' | '24h' {
  return country && TWELVE_HOUR_COUNTRIES.has(country) ? '12h' : '24h';
}

/** "17"+"00" -> "5pm"; "17"+"30" -> "5:30pm"; "00"+"00" -> "12am". */
function to12h(h: number, m: number): string {
  const suffix = h < 12 ? 'am' : 'pm';
  let hour = h % 12;
  if (hour === 0) hour = 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, '0')}${suffix}`;
}

/** "5","30","pm" -> "17:30"; "12","0","am" -> "00:00". */
function to24h(h: number, m: number, suffix: string): string {
  let hour = h % 12;
  if (suffix.toLowerCase() === 'pm') hour += 12;
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// 12-hour tokens: 5pm, 5.30pm, 5:30 pm, noon, midnight. The digit form
// requires the am/pm marker so bare integers stay untouched.
const TWELVE_RE = /\b(\d{1,2})(?:[:.](\d{2}))?\s?(am|pm)\b|\b(noon|midnight)\b/gi;
// 24-hour tokens: must have the colon, hour 0-24, minutes 00-59. 24:00 is
// treated as midnight. The lookahead keeps "6:30 PM" (a 12-hour time that
// happens to carry a colon) out of this pattern entirely.
const TWENTYFOUR_RE = /\b(\d{1,2})[:.](\d{2})\b(?!\s?(?:am|pm)\b)/gi;

/**
 * Render an opening_hours string in the given format. Returns the input
 * unchanged when it is null, already in the target format, or carries no
 * recognizable time tokens.
 */
export function formatHours(stored: string | null | undefined, format: '12h' | '24h'): string {
  if (!stored) return '';
  if (format === '24h') {
    return stored.replace(TWELVE_RE, (full, h, m, suffix, word) => {
      if (word) return word.toLowerCase() === 'noon' ? '12:00' : '00:00';
      const hour = parseInt(h, 10);
      if (hour < 1 || hour > 12) return full;
      return to24h(hour, m ? parseInt(m, 10) : 0, suffix);
    });
  }
  return stored.replace(TWENTYFOUR_RE, (full, h, m) => {
    const hour = parseInt(h, 10);
    const min = parseInt(m, 10);
    if (hour > 24 || min > 59) return full;
    return to12h(hour === 24 ? 0 : hour, min);
  });
}

/** Country-aware convenience used by rendering code. */
export function formatHoursForCountry(
  stored: string | null | undefined,
  country: string | null | undefined
): string {
  return formatHours(stored, hoursFormatForCountry(country));
}

/**
 * Dry-run classification of one stored string (assessment tooling and
 * tests; rendering never needs this). "converted" - at least one token
 * changed; "already-target" - tokens found, all already in the target
 * format; "no-times" - nothing recognizable, renders as stored.
 */
export function classifyHours(
  stored: string,
  format: '12h' | '24h'
): 'converted' | 'already-target' | 'no-times' {
  const out = formatHours(stored, format);
  if (out !== stored) return 'converted';
  const hasTargetTokens =
    format === '24h'
      ? /\b\d{1,2}[:.]\d{2}\b/.test(stored)
      : /\b\d{1,2}(?:[:.]\d{2})?\s?(am|pm)\b/i.test(stored);
  return hasTargetTokens ? 'already-target' : 'no-times';
}
