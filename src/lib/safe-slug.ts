export type WithSlug = { slug: string };

export function hasSlug<T extends { slug?: string | null }>(
  entry: T,
): entry is T & WithSlug {
  return typeof entry?.slug === 'string' && entry.slug.length > 0 && entry.slug !== 'null' && entry.slug !== 'undefined';
}

export function safeHref(base: string, slug: string | null | undefined): string {
  if (typeof slug !== 'string' || !slug || slug === 'null' || slug === 'undefined') {
    return base;
  }
  const cleanSlug = slug.replace(/^\/+/, '');
  return `${base.endsWith('/') ? base : `${base}/`}${cleanSlug}`;
}
