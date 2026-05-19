// Text normalization for bar records.
//
// Why this exists: the directory groups countries/cities by exact string, so a
// single stray space ("Chile " vs "Chile") creates a phantom duplicate facet
// and a broken slug. This bit us with the bar "The Loft" (added with a trailing
// space in name/city/country). App-side normalization here is the first line of
// defense; a BEFORE INSERT/UPDATE trigger on `bars` (see
// scripts/normalize-bar-text-trigger.sql) is the catch-all that also covers
// writes made directly in the Supabase SQL editor.

/**
 * Collapse internal whitespace runs to a single space and trim the ends.
 * Use for identity/facet fields (name, city, country, type, slug) where a
 * stray or doubled space produces duplicate directory facets.
 */
export function normalizeFacet(v: string): string {
  return v.replace(/\s+/g, ' ').trim();
}

const FACET_FIELDS = ['name', 'city', 'country', 'type', 'slug'] as const;
const TRIM_FIELDS = [
  'address', 'website', 'instagram', 'email', 'phone',
  'description', 'short_excerpt', 'contact_name',
] as const;

/**
 * Return a copy of a partial bar record with facet fields fully normalized
 * and free-text fields end-trimmed. Non-string / absent values pass through
 * untouched, so this is safe to call on any partial update or insert object.
 * Free-text fields are only end-trimmed (not internally collapsed) to preserve
 * intentional formatting like newlines in descriptions.
 */
export function normalizeBarFields<T extends Record<string, unknown>>(rec: T): T {
  const out: Record<string, unknown> = { ...rec };
  for (const f of FACET_FIELDS) {
    if (typeof out[f] === 'string') out[f] = normalizeFacet(out[f] as string);
  }
  for (const f of TRIM_FIELDS) {
    if (typeof out[f] === 'string') out[f] = (out[f] as string).trim();
  }
  return out as T;
}
