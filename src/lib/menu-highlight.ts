import type { MenuHighlight } from './supabase';

/**
 * The "Order this" callout on the Top 10 city cards: a drink name and its
 * ingredients, with no dash anywhere in the block (no em dashes site-wide).
 *
 * The data already separates name and ingredients; a name that carries its
 * own "Irish Coffee — Jameson ..." is split on the first spaced dash when
 * there is no ingredients field. Any dash left inside either part is
 * rendered as a comma.
 */
const SPACED_DASH = /\s+[—–-]\s+/;

export function splitHighlight(h: Pick<MenuHighlight, 'name' | 'ingredients'>): { name: string; ingredients: string | null } {
  let name = (h.name || '').trim();
  let ingredients = (h.ingredients || '').trim();
  if (!ingredients) {
    const m = SPACED_DASH.exec(name);
    if (m && m.index > 0) {
      ingredients = name.slice(m.index + m[0].length).trim();
      name = name.slice(0, m.index).trim();
    }
  }
  const clean = (s: string) => s.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',').trim();
  name = clean(name);
  ingredients = clean(ingredients);
  return { name, ingredients: ingredients || null };
}
