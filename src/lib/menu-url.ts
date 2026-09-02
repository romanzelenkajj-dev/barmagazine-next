/**
 * Menu-link sanity checks, shared by the owner edit form (friendly inline
 * message) and the owner API (server-side reject).
 *
 * Born from Apothéke LA's first real edit session: the owner pasted a Google
 * search results URL from their address bar as the menu link. A search page is
 * never anyone's menu, so those are rejected outright; a menu hosted somewhere
 * other than the bar's own website (Linktree, a PDF host, the hotel group's
 * domain) is perfectly common, so that only warrants a soft warning.
 */

/** Hosts/paths that are search results or map listings, never a menu page. */
function parsed(raw: string): URL | null {
  const v = raw.trim();
  if (!v) return null;
  try {
    return new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
  } catch {
    return null;
  }
}

export function isSearchOrMapsUrl(raw: string): boolean {
  const u = parsed(raw);
  if (!u) return false;
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const path = u.pathname.toLowerCase();

  // Google properties: search results, maps (any TLD), and share links.
  if (/^google\.[a-z.]+$/.test(host)) {
    if (path.startsWith('/search') || path.startsWith('/maps') || path.startsWith('/url')) return true;
  }
  if (/^maps\.google\.[a-z.]+$/.test(host) || host === 'maps.app.goo.gl' || host === 'goo.gl') return true;

  if (host === 'bing.com' && (path.startsWith('/search') || path.startsWith('/maps'))) return true;
  if (host === 'duckduckgo.com' && u.searchParams.has('q')) return true;
  if (/(^|\.)search\.yahoo\.com$/.test(host)) return true;
  if (/^yandex\.[a-z.]+$/.test(host) && path.startsWith('/search')) return true;

  return false;
}

/**
 * True when both URLs parse and their registrable hosts clearly differ —
 * "menu.yourbar.com" vs "yourbar.com" counts as matching. Missing or
 * unparseable values are NOT a mismatch: the warning must never fire on an
 * empty website field.
 */
export function menuDomainDiffers(menuUrl: string, websiteUrl: string): boolean {
  const menu = parsed(menuUrl);
  const site = parsed(websiteUrl);
  if (!menu || !site) return false;
  const strip = (h: string) => h.toLowerCase().replace(/^www\./, '');
  const m = strip(menu.hostname);
  const s = strip(site.hostname);
  return m !== s && !m.endsWith(`.${s}`) && !s.endsWith(`.${m}`);
}

/** Social profiles: already linked from the profile, never a menu page. */
export function isSocialMediaUrl(raw: string): boolean {
  const u = parsed(raw);
  if (!u) return false;
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  return (
    host === 'instagram.com' ||
    host === 'facebook.com' ||
    host === 'fb.com' ||
    host === 'm.facebook.com' ||
    host === 'tiktok.com' ||
    host.endsWith('.tiktok.com')
  );
}

export const SEARCH_URL_MESSAGE =
  'That link is a search or maps results page. Please link your menu page directly — the page that shows your drinks.';

export const SOCIAL_URL_MESSAGE =
  'Please link your menu page — your Instagram is already on your profile.';

/**
 * One verdict for a proposed menu link: the message to show, or null when the
 * link is acceptable. The soft domain-mismatch warning is separate — it never
 * blocks.
 */
export function menuUrlProblem(raw: string): string | null {
  if (isSearchOrMapsUrl(raw)) return SEARCH_URL_MESSAGE;
  if (isSocialMediaUrl(raw)) return SOCIAL_URL_MESSAGE;
  return null;
}
