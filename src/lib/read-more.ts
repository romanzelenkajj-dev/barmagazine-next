/**
 * Drop WordPress's trailing read-more marker from an auto-excerpt. The
 * excerpt.rendered field ends with a link whose text is "More" (or "Read
 * more", "Continue reading"), usually after an ellipsis or "[...]"; stripping
 * the tags keeps the link text, so the site's meta description ended
 * "...2026. More" (Roman, 2026-09-16). End of string only, case-insensitive,
 * with the ellipsis or bracket that precedes it and the surrounding
 * whitespace. Pure, so client components can use it.
 */
export function stripReadMore(text: string): string {
  return text
    .replace(/\s*(?:\[\s*(?:\u2026|\.{3})\s*\]|\u2026|\.{3})?\s*(?:read\s+more|continue\s+reading|more)\s*(?:\u2026|\.{3})?\s*$/i, '')
    .trim();
}
