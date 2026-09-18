/**
 * House style for bar descriptions, written down once.
 *
 * WHY THIS FILE EXISTS. The rules lived in Roman's head, so every owner
 * submission arrived as marketing and was rewritten by hand. This is the
 * single source that the review-screen rewrite reads from, and that any
 * future automated check should read from too. If the style changes, it
 * changes here and both follow.
 *
 * WHAT THE REWRITE IS AND IS NOT. It is deliberately deterministic: it
 * deletes, reorders and substitutes known equivalents, and that is all. It
 * has no model behind it and cannot invent an opening year, a neighbourhood
 * or a specialty, because "no claim that is not in the source text" is the
 * rule that matters most and the cheapest way to guarantee it is to make
 * adding a claim impossible rather than unlikely.
 *
 * The consequence is that the rewrite is a DRAFT. Where it cannot do a
 * conversion cleanly it says so in `notes` and leaves the sentence for the
 * reviewer rather than mangling it. Nothing here publishes anything: the
 * review screen chooses.
 */

export const MIN_WORDS = 90;
export const MAX_WORDS = 120;

/** The rules, in the order a reviewer would check them. */
export const HOUSE_STYLE_RULES: { id: string; rule: string }[] = [
  { id: 'person', rule: 'Third person, never first. The bar is described, it does not speak.' },
  { id: 'length', rule: `${MIN_WORDS} to ${MAX_WORDS} words.` },
  { id: 'plain', rule: 'Plain description over assertion: what the bar is, what it pours, when it is open, what makes it itself.' },
  { id: 'cta', rule: 'No calls to action.' },
  { id: 'dash', rule: 'No dashes. Use periods, commas or colons. No em dashes anywhere.' },
  { id: 'food', rule: 'No food negation. A description never says a bar has no kitchen or serves no food.' },
  { id: 'awards', rule: 'Awards never appear in the description. They belong in the accolades field and render as their own credentials line.' },
  { id: 'us-english', rule: 'US English.' },
  { id: 'no-invention', rule: 'No claim that is not in the source text. The rewrite reorganises and cuts, it never adds.' },
];

/** One paragraph of the same thing, for the review screen and the form. */
export const HOUSE_STYLE_SUMMARY =
  'Third person, 90 to 120 words, plain description rather than assertion: what the bar is, '
  + 'what it pours, when it is open, what makes it itself. No calls to action, no dashes, no '
  + 'food negation, no awards in the description, US English, and no claim that is not in the '
  + 'owner’s own text.';

/** The line shown under the description field on the submission form. */
export const SUBMISSION_HELP =
  'Describe the bar plainly: what it is, what you pour, when you are open. '
  + 'We edit submissions into our house style before publishing.';

/* ────────────────────────────── detection ────────────────────────────── */

/** Sentences whose job is to make the reader do something. */
const CTA_OPENERS = [
  'come', 'stay', 'join', 'book', 'visit', 'call', 'follow', 'expect', 'reserve',
  'order', 'drop by', 'swing by', 'stop by', 'pop in', 'discover', 'experience',
  'indulge', 'embrace', 'treat yourself', 'don’t miss', "don't miss", 'do not miss',
  'find us', 'see you', 'let us', 'why not',
];

const CTA_PHRASES = [
  'book now', 'book a table', 'get in touch', 'contact us', 'follow us',
  'see you soon', 'we look forward', 'come and see', 'make a reservation',
];

/** Award and ranking language, which belongs in the accolades field. */
const AWARD_PATTERNS = [
  /\baward[\s-]?winning\b/i, /\bawards?\b/i, /\bwinner\b/i, /\bvoted\b/i,
  /\bbest bar\b/i, /\bone of the best\b/i, /\branked\b/i, /\brating\b/i,
  /\b\d+\s*stars?\b/i, /\bmichelin\b/i, /\b50 best\b/i, /\bguide\b/i,
  /\bprize\b/i, /\baccolade/i, /\bshortlist/i, /\bnominee\b/i, /\bnominated\b/i,
];

/** Saying what a bar does not have is never our description's job. */
const FOOD_NEGATION = [
  /\bno (full )?(kitchen|food|menu)\b/i,
  /\b(does|do|doesn’t|doesn't|don’t|don't) not serve (any )?food\b/i,
  /\bserves? no food\b/i,
  /\bwithout a kitchen\b/i,
  /\bno food (is )?(served|available)\b/i,
];

const FIRST_PERSON = /\b(we|we’re|we're|we’ve|we've|we’ll|we'll|us|our|ours|ourselves|i’m|i'm|i’ve|i've)\b/i;

/** Any dash used as punctuation, plus the spaced hyphen that acts as one. */
const DASHES = /\s*[—–−]\s*|\s+-\s+/g;

/* ────────────────────────────── rewriting ────────────────────────────── */

/**
 * First person to third. Only the forms listed here are converted; anything
 * else is reported rather than guessed at, because conjugating an unknown
 * verb produces "the bar gos" and a wrong word in a live profile is worse
 * than a sentence the reviewer has to touch.
 */
const VERB_FORMS: [RegExp, string][] = [
  [/\bwe are\b/gi, 'the bar is'],
  [/\bwe’re\b|\bwe're\b/gi, 'the bar is'],
  [/\bwe have\b/gi, 'the bar has'],
  [/\bwe’ve\b|\bwe've\b/gi, 'the bar has'],
  [/\bwe had\b/gi, 'the bar had'],
  [/\bwe do not\b|\bwe don’t\b|\bwe don't\b/gi, 'the bar does not'],
  [/\bwe will\b|\bwe’ll\b|\bwe'll\b/gi, 'the bar will'],
  [/\bwe can\b/gi, 'the bar can'],
  [/\bwe offer\b/gi, 'the bar offers'],
  [/\bwe serve\b/gi, 'the bar serves'],
  [/\bwe pour\b/gi, 'the bar pours'],
  [/\bwe stay\b/gi, 'the bar stays'],
  [/\bwe focus\b/gi, 'the bar focuses'],
  [/\bwe prefer\b/gi, 'the bar prefers'],
  [/\bwe specialis[ez]e?\b/gi, 'the bar specializes'],
  [/\bwe create\b/gi, 'the bar creates'],
  [/\bwe make\b/gi, 'the bar makes'],
  [/\bwe use\b/gi, 'the bar uses'],
  [/\bwe open\b/gi, 'the bar opens'],
  [/\bwe welcome\b/gi, 'the bar welcomes'],
  [/\bwe host\b/gi, 'the bar hosts'],
  [/\bwe run\b/gi, 'the bar runs'],
  [/\bwe keep\b/gi, 'the bar keeps'],
  [/\bwe craft\b/gi, 'the bar crafts'],
  [/\bwe want\b/gi, 'the bar wants'],
  [/\bwe believe\b/gi, 'the bar believes'],
  [/\bwe aim\b/gi, 'the bar aims'],
  [/\bwe work\b/gi, 'the bar works'],
  [/\bour own\b/gi, 'its own'],
  [/\bour\b/gi, 'its'],
  [/\bours\b/gi, 'its'],
  [/\bourselves\b/gi, 'itself'],
];

/** Lowercase-only, so proper nouns such as Theatre Royal are left alone. */
const US_SPELLING: [RegExp, string][] = [
  [/\bspecialise/g, 'specialize'], [/\bspecialising/g, 'specializing'],
  [/\borganise/g, 'organize'], [/\brealise/g, 'realize'],
  [/\bflavour/g, 'flavor'], [/\bcolour/g, 'color'], [/\bfavourite/g, 'favorite'],
  [/\bneighbourhood/g, 'neighborhood'], [/\bharbour/g, 'harbor'],
  [/\bcentre\b/g, 'center'], [/\btheatre\b/g, 'theater'],
  [/\bprogramme\b/g, 'program'], [/\bcatalogue\b/g, 'catalog'],
  [/\blicence\b/g, 'license'], [/\bmetres?\b/g, 'meters'], [/\blitres?\b/g, 'liters'],
  [/\bcosy\b/g, 'cozy'], [/\bwhilst\b/g, 'while'], [/\bgrey\b/g, 'gray'],
  [/\bstorey\b/g, 'story'], [/\btravelling\b/g, 'traveling'],
];

export interface RewriteResult {
  /** The rewritten draft. Never published without a human choosing it. */
  text: string;
  /** What the rewrite did, in reviewer-readable terms. */
  notes: string[];
  /** Where the reviewer must look. A non-empty list means "edit before using". */
  warnings: string[];
  wordCount: number;
}

const words = (s: string) => s.trim() ? s.trim().split(/\s+/).length : 0;

/**
 * Split on sentence ends, keeping the terminator.
 *
 * Written as a match rather than a split on lookbehind: this codebase's
 * tsconfig predates lookbehind and it is banned in src/.
 */
function sentences(text: string): string[] {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (!flat) return [];
  const out: string[] = [];
  let start = 0;
  for (let i = 0; i < flat.length; i++) {
    const c = flat[i];
    if (c === '.' || c === '!' || c === '?') {
      // Only break when the terminator is followed by a space or the end,
      // so "St. Anthony" and "8 p.m." stay in one piece.
      const next = flat[i + 1];
      if (next === undefined || next === ' ') {
        out.push(flat.slice(start, i + 1).trim());
        start = i + 2;
        i++;
      }
    }
  }
  if (start < flat.length) out.push(flat.slice(start).trim());
  return out.filter(Boolean);
}

const isCta = (s: string): boolean => {
  const t = s.toLowerCase().replace(/^[^a-z’']+/, '');
  if (CTA_PHRASES.some(p => t.includes(p))) return true;
  return CTA_OPENERS.some(o => t.startsWith(o + ' ') || t === o + '.' || t.startsWith(o + ','));
};

const hasAward = (s: string) => AWARD_PATTERNS.some(r => r.test(s));
const hasFoodNegation = (s: string) => FOOD_NEGATION.some(r => r.test(s));

/**
 * Rewrite an owner's description towards house style.
 *
 * `barName` is used only to replace a first-person pronoun with the subject
 * it already referred to. That is a substitution, not a new claim.
 */
export function rewriteToHouseStyle(source: string, barName?: string): RewriteResult {
  const notes: string[] = [];
  const warnings: string[] = [];
  const original = String(source || '').trim();
  if (!original) {
    return { text: '', notes: [], warnings: ['The submission has no description to rewrite.'], wordCount: 0 };
  }

  // Dashes go first, so a dash-joined clause survives sentence splitting.
  const working = original.replace(DASHES, ', ');
  if (working !== original) notes.push('Replaced dashes with commas.');

  let list = sentences(working);
  const started = list.length;

  const dropped = { cta: 0, award: 0, food: 0 };
  list = list.filter(s => {
    if (isCta(s)) { dropped.cta++; return false; }
    if (hasAward(s)) { dropped.award++; return false; }
    if (hasFoodNegation(s)) { dropped.food++; return false; }
    return true;
  });
  if (dropped.cta) notes.push(`Removed ${dropped.cta} call${dropped.cta > 1 ? 's' : ''} to action.`);
  if (dropped.award) notes.push(`Removed ${dropped.award} sentence${dropped.award > 1 ? 's' : ''} naming an award or ranking. Put those in the accolades field.`);
  if (dropped.food) notes.push(`Removed ${dropped.food} food negation.`);

  // First person to third.
  const subject = (barName || '').trim();
  let converted = 0;
  list = list.map(s => {
    let out = s;
    for (const [re, to] of VERB_FORMS) {
      const before = out;
      out = out.replace(re, to);
      if (out !== before) converted++;
    }
    // "The bar" reads oddly as the very first words; use the name once.
    return out;
  });
  if (converted) notes.push('Converted first person to third.');
  // Name the bar once, but only if the owner's own text has not already named
  // it. Sackville opens "The Sackville Lounge is familiar but new", and
  // substituting the name again two sentences later just reads as repetition.
  if (subject && !new RegExp(`\\b${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(list.join(' '))) {
    const i = list.findIndex(s => /\bthe bar\b/i.test(s));
    if (i >= 0) list[i] = list[i].replace(/\bthe bar\b/i, subject);
  }

  let text = list.join(' ');

  for (const [re, to] of US_SPELLING) {
    const before = text;
    text = text.replace(re, to);
    if (text !== before && !notes.includes('Converted to US English.')) notes.push('Converted to US English.');
  }

  // Trim from the end until it fits, sentence by sentence so nothing is cut
  // mid-thought.
  if (words(text) > MAX_WORDS) {
    const keep: string[] = [];
    for (const s of sentences(text)) {
      if (words(keep.concat(s).join(' ')) > MAX_WORDS) break;
      keep.push(s);
    }
    if (keep.length) {
      notes.push(`Trimmed to ${MAX_WORDS} words. ${sentences(text).length - keep.length} sentence(s) dropped from the end.`);
      text = keep.join(' ');
    }
  }

  text = text.replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();

  // The pronoun substitutions above always produce a lowercase "the bar", so a
  // sentence that began "We stay true..." comes back as "the bar stays true...".
  // Recapitalise sentence openings rather than special-casing each verb form.
  text = sentences(text)
    .map(s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s))
    .join(' ');

  // What the reviewer must look at.
  const wc = words(text);
  if (FIRST_PERSON.test(text)) {
    warnings.push('First person survives in the draft. The rewrite only converts verb forms it knows, so this sentence needs you.');
  }
  if (wc < MIN_WORDS) {
    warnings.push(`${wc} words, under the ${MIN_WORDS} minimum. Nothing can be added without inventing a fact the owner did not supply, so this needs a human or a question to the owner.`);
  }
  if (started > 1 && list.length === 0) {
    warnings.push('Every sentence was removed. The submission was entirely marketing.');
  }
  if (/[—–]/.test(text)) warnings.push('An em or en dash survives.');

  return { text, notes, warnings, wordCount: wc };
}

/**
 * Check text against the rules without changing it. This is the "future
 * check" hook: same rules, read from the same place.
 */
export function checkHouseStyle(text: string): { id: string; problem: string }[] {
  const out: { id: string; problem: string }[] = [];
  const t = String(text || '');
  const wc = words(t);
  if (FIRST_PERSON.test(t)) out.push({ id: 'person', problem: 'Written in first person.' });
  if (wc < MIN_WORDS) out.push({ id: 'length', problem: `${wc} words, under ${MIN_WORDS}.` });
  if (wc > MAX_WORDS) out.push({ id: 'length', problem: `${wc} words, over ${MAX_WORDS}.` });
  if (/[—–−]/.test(t) || /\s-\s/.test(t)) out.push({ id: 'dash', problem: 'Contains a dash.' });
  for (const s of sentences(t)) {
    if (isCta(s)) { out.push({ id: 'cta', problem: `Call to action: "${s.slice(0, 60)}"` }); break; }
  }
  for (const s of sentences(t)) {
    if (hasAward(s)) { out.push({ id: 'awards', problem: `Award or ranking in the description: "${s.slice(0, 60)}"` }); break; }
  }
  for (const s of sentences(t)) {
    if (hasFoodNegation(s)) { out.push({ id: 'food', problem: 'States what the bar does not serve.' }); break; }
  }
  for (const [re] of US_SPELLING) {
    if (re.test(t)) { out.push({ id: 'us-english', problem: 'Contains British spelling.' }); break; }
  }
  return out;
}
