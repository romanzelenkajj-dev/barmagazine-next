/**
 * Does a bar name still fit the card's two-line name box at the normal size?
 *
 * The card reserves exactly two lines for the name so that every location
 * line in a row sits on the same baseline. A name that needs a third line is
 * clamped, which loses words. Rather than lose them, the card renders that
 * name one font size down, and the decision is made HERE, at render time, so
 * the page never reflows in front of the reader the way a measure-then-shrink
 * script would.
 *
 * MEASURED, NOT GUESSED. The two thresholds below come from probing all
 * 1,646 active bar names against the real card box in the browser:
 *
 *   desktop  241px box at 21px  ->  1 name of 1,646 needs a third line
 *   tablet   249px box at 16px  ->  0 names
 *   mobile   one column, wider  ->  0 names
 *
 * The single overflowing name is "Cause Effect Cocktail Kitchen & Cape Brandy
 * Bar" (47 characters), and it fits two lines comfortably at 17px.
 */

/**
 * Characters above which the name drops a size.
 *
 * Set to 42 rather than to the 47 that actually overflows, because 46 fits
 * and 47 does not: the true boundary depends on where the words happen to
 * break, so sitting on it would make the layout depend on luck. Four names in
 * the directory are at or above 42. Rendering a name that would just barely
 * have fitted at the smaller size costs nothing; clamping one that does not
 * fit costs words.
 */
export const LONG_NAME_CHARS = 42;

/**
 * Characters in a single unbreakable word above which the name drops a size.
 *
 * A long enough token cannot be wrapped at all and sets the box's minimum
 * width on its own. At 21px the box holds about 23 characters on one line.
 * No active bar name currently has a token this long, so this guard is here
 * for the next one rather than for anything on the site today.
 */
export const LONG_NAME_TOKEN_CHARS = 22;

/** True when the name should render one font size down. */
export function isLongCardName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length >= LONG_NAME_CHARS) return true;
  return trimmed.split(/\s+/).some(word => word.length >= LONG_NAME_TOKEN_CHARS);
}
