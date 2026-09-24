import { toUrlSlug } from './utils';

/**
 * Slug for a new bar row, from its name and city.
 *
 * Task 127 (2026-09-24): "庙前三酉 SanYou" in Guangzhou came out as "-sanyou".
 * The old builder deleted every non-Latin character first and trimmed
 * whitespace, not hyphens, so a name that STARTS with Chinese, Japanese,
 * Thai or Cyrillic text kept the hyphen that stood in for it. The rules now:
 *
 *   1. Accented Latin transliterates (São Paulo → sao-paulo), everything
 *      else that is not a-z or 0-9 becomes a hyphen, and hyphens never lead
 *      or trail. So the Latin part of a mixed name is the slug: "sanyou".
 *   2. A name with no Latin letter or digit at all (a fully Chinese name,
 *      say) falls back to "bar-<city>", never to an empty string or a bare
 *      hyphen; the caller's collision handling adds the city or a suffix as
 *      it always did.
 *
 * `withCity` is the second candidate the approval route tries when the
 * first collides: "<slug>-<city>", or just "<city>-bar" when the slug is
 * already the city fallback (no "bar-guangzhou-guangzhou").
 */
export function barSlug(name: string, city: string): { slug: string; withCity: string } {
  // Apostrophes vanish rather than becoming hyphens, as the old builder did
  // ("Bourke's" is /bars/bourkes, not bourke-s).
  const apostrophes = /['\u2019`]/g;
  const citySlug = toUrlSlug((city || '').replace(apostrophes, '')) || 'bar';
  const fromName = toUrlSlug((name || '').replace(apostrophes, ''));
  if (fromName) return { slug: fromName, withCity: `${fromName}-${citySlug}` };
  return { slug: `bar-${citySlug}`, withCity: `${citySlug}-bar` };
}
