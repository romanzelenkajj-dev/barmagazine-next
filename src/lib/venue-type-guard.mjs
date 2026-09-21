/**
 * Hold a row for review when an award is about to admit a venue we do not list.
 *
 * WHY. Two rows reached the directory purely because a James Beard
 * "Outstanding Bar" 2026 listing named them: Onyx Coffee Lab, a coffee
 * roaster in Rogers, Arkansas, and Bow & Arrow Brewing Co., a brewery in
 * Albuquerque. Both are legitimate winners of that award. Neither is a
 * cocktail bar, which is what this directory lists. The award was treated as
 * an admission rule, and it is not one.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO. It does not drop the row. A silent drop
 * is the failure mode that produced the batch 15 mail-out with 19 of 22
 * missing: work that looks like it ran. This returns a REASON, the caller
 * prints it and holds the row, and a person decides. A brewery with a serious
 * cocktail programme is a real thing and only a human should rule on it.
 *
 * It is also deliberately keyword-based and shallow. A cleverer classifier
 * would be wrong in ways nobody could predict from the output; this is wrong
 * only in ways you can read off the matched word, which is printed.
 */

/**
 * Words that describe the venue's PRIMARY trade, not a detail of it.
 * Each maps to what the venue actually is, so the held row explains itself.
 */
const EXCLUDED = [
  [/\bcoffee\s+(lab|roaster|roasting|company|co\.?|bar|house)\b/i, 'a coffee roaster or coffee house'],
  [/\bcoffee\s+shop\b/i, 'a coffee shop'],
  [/\b(roastery|roasters)\b/i, 'a coffee roastery'],
  [/\bbrewing\s+(co\.?|company)\b/i, 'a brewery'],
  [/\b(brewery|brewpub|braueri|cervecer[ií]a)\b/i, 'a brewery'],
  [/\btap\s?room\b/i, 'a taproom'],
  [/\b(winery|vineyard|bodega|cantina\s+vinicola)\b/i, 'a winery'],
  [/\bdistiller(y|ies)\b/i, 'a distillery'],
  [/\b(bakery|patisserie|boulangerie)\b/i, 'a bakery'],
  [/\b(jewell?ers?|jewell?ery)\b/i, 'a jeweller'],
];

/** A bar TYPE we list outright settles it, whatever the name says. */
const ACCEPTED_TYPES = /^(cocktail bar|speakeasy|hotel bar|wine bar|rooftop bar|tiki bar|pub|restaurant bar|whisky bar|sports bar|beach bar|dive bar|nightclub)$/i;

/**
 * Does this row look like a venue type we do not list?
 *
 * @param {{name?: string, description?: string, type?: string, accolades?: unknown}} row
 * @returns {{reason: string, matched: string} | null} null when nothing is wrong.
 */
export function venueTypeConcern(row) {
  if (!row) return null;
  // The NAME is the strong signal: a venue that calls itself a roastery is
  // one. A description may merely mention that the bar roasts its own coffee.
  const name = typeof row.name === 'string' ? row.name : '';
  for (const [re, reason] of EXCLUDED) {
    const hit = name.match(re);
    if (hit) return { reason, matched: hit[0] };
  }
  // Only consult the description when the type is not one we list, so a
  // cocktail bar that happens to mention a nearby brewery is not held.
  const type = typeof row.type === 'string' ? row.type : '';
  if (ACCEPTED_TYPES.test(type.trim())) return null;
  const desc = typeof row.description === 'string' ? row.description : '';
  for (const [re, reason] of EXCLUDED) {
    const hit = desc.match(re);
    if (hit) return { reason, matched: hit[0] };
  }
  return null;
}

/** True when the row carries at least one accolade. */
export function hasAccolade(row) {
  return Array.isArray(row?.accolades) && row.accolades.length > 0;
}

/**
 * The line to print for a held row. Says what was matched and what to do,
 * because a guard that only says "held" teaches nobody anything.
 */
export function holdMessage(slug, concern, row) {
  const why = hasAccolade(row)
    ? 'It is here on an award, and an award is not an admission rule'
    : 'Nothing admitted it except this wave';
  return [
    `HOLD ${slug}: looks like ${concern.reason} (matched "${concern.matched}").`,
    `      ${why}.`,
    '      NOT inserted and NOT dropped. Decide, then re-run with --allow-venue-type',
    '      if it really is a bar we list.',
  ].join('\n');
}
