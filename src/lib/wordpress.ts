// WordPress.com public API — the site identifier for the WP.com REST API.
// IMPORTANT: This staging domain is ONLY used as a site identifier in the API URL.
// It must NEVER appear in rendered HTML. The sanitizeResponse() function below
// rewrites all staging-domain references in API responses before they reach
// any component. DO NOT remove or bypass this sanitisation.
const STAGING_DOMAIN = 'romanzelenka-wjgek.wpcomstaging.com';
export const WP_API = `https://public-api.wordpress.com/wp/v2/sites/${STAGING_DOMAIN}`;
const PROD_DOMAIN = 'barmagazine.com';

/**
 * Globally rewrite every occurrence of the WordPress staging domain in a raw
 * API response string so that the staging hostname never leaks into rendered
 * HTML, RSC payloads, or serialised JSON.
 *
 * Rules (applied in order):
 * 1. CDN-wrapped image URLs  → rewrite origin to production domain
 *    `i0.wp.com/romanzelenka-…/wp-content/uploads/` → `i0.wp.com/barmagazine.com/wp-content/uploads/`
 * 2. Raw image/upload URLs   → wrap with CDN + production domain
 *    `romanzelenka-…/wp-content/uploads/` → `i0.wp.com/barmagazine.com/wp-content/uploads/`
 * 3. All remaining refs      → replace with production domain
 *    `romanzelenka-…/some-slug/` → `barmagazine.com/some-slug/`
 */
function sanitizeResponse(text: string): string {
  return text
    // 1. CDN-wrapped upload URLs → production CDN
    .replace(
      /https:\/\/i[0-9]\.wp\.com\/romanzelenka-wjgek\.wpcomstaging\.com\/wp-content\/uploads\//g,
      `https://i0.wp.com/${PROD_DOMAIN}/wp-content/uploads/`
    )
    // 2. Raw upload URLs → production CDN
    .replace(
      /https:\/\/romanzelenka-wjgek\.wpcomstaging\.com\/wp-content\/uploads\//g,
      `https://i0.wp.com/${PROD_DOMAIN}/wp-content/uploads/`
    )
    // 3. Everything else (post links, guid, _links, etc.) → production domain
    .replace(
      /https:\/\/romanzelenka-wjgek\.wpcomstaging\.com\//g,
      `https://${PROD_DOMAIN}/`
    )
    // 4. Catch any remaining bare domain references (without protocol)
    .replace(
      /romanzelenka-wjgek\.wpcomstaging\.com/g,
      PROD_DOMAIN
    );
}

// ---------- Types ----------
export interface WPPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  categories: number[];
  tags: number[];
  meta?: {
    bold_title?: string;
    [key: string]: unknown;
  };
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[];
    'wp:term'?: WPCategory[][];
    author?: WPAuthor[];
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes: {
      thumbnail?: { source_url: string };
      medium?: { source_url: string };
      medium_large?: { source_url: string };
      large?: { source_url: string };
      full?: { source_url: string };
    };
  };
}

export interface WPAuthor {
  id: number;
  name: string;
  url: string;
  description: string;
  slug: string;
  link: string;
  avatar_urls: { [key: string]: string };
}

export interface WPTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

// ---------- Fetch helpers ----------
async function fetchWithRetry(url: string, retries = 5, delay = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (res.ok || res.status < 500) return res;
    } catch (e) {
      if (i >= retries - 1) throw e;
    }
    if (i < retries - 1) await new Promise(r => setTimeout(r, delay * (i + 1)));
  }
  return fetch(url, { next: { revalidate: 300 } });
}

async function wpFetch<T>(endpoint: string, params: Record<string, string | number> = {}, fallback?: T): Promise<T> {
  const url = new URL(`${WP_API}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  try {
    const res = await fetchWithRetry(url.toString());
    if (!res.ok) {
      console.warn(`WP API error: ${res.status} on ${endpoint}`);
      if (fallback !== undefined) return fallback;
      throw new Error(`WP API error: ${res.status} on ${endpoint}`);
    }
    const raw = await res.text();
    return JSON.parse(sanitizeResponse(raw));
  } catch (e) {
    console.warn(`WP API fetch failed on ${endpoint}:`, e);
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

async function wpFetchWithTotal<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<{ data: T; total: number; totalPages: number }> {
  const url = new URL(`${WP_API}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  try {
    const res = await fetchWithRetry(url.toString());
    if (!res.ok) {
      console.warn(`WP API error: ${res.status} on ${endpoint}, returning empty`);
      return { data: [] as unknown as T, total: 0, totalPages: 0 };
    }
    const raw = await res.text();
    return {
      data: JSON.parse(sanitizeResponse(raw)),
      total: parseInt(res.headers.get('X-WP-Total') || '0'),
      totalPages: parseInt(res.headers.get('X-WP-TotalPages') || '0'),
    };
  } catch (e) {
    console.warn(`WP API fetch failed on ${endpoint}:`, e);
    return { data: [] as unknown as T, total: 0, totalPages: 0 };
  }
}

// ---------- Posts ----------
export async function getPosts(page = 1, perPage = 12, categoryId?: number, categoryIds?: number[]) {
  const params: Record<string, string | number> = {
    page,
    per_page: perPage,
    _embed: 'true',
  };
  if (categoryIds && categoryIds.length > 0) {
    params.categories = categoryIds.join(',');
  } else if (categoryId) {
    params.categories = categoryId;
  }
  return wpFetchWithTotal<WPPost[]>('/posts', params);
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>('/posts', { slug, _embed: 'true' }, []);
  return posts[0] || null;
}

export async function getPostsByCategory(categorySlug: string, page = 1, perPage = 12) {
  const cats = await wpFetch<WPCategory[]>('/categories', { slug: categorySlug }, []);
  if (!cats[0]) return { data: [] as WPPost[], total: 0, totalPages: 0 };
  return getPosts(page, perPage, cats[0].id);
}

// ---------- Categories ----------
export async function getCategories() {
  return wpFetch<WPCategory[]>('/categories', { per_page: 50 }, []);
}

export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
  const cats = await wpFetch<WPCategory[]>('/categories', { slug }, []);
  return cats[0] || null;
}

// ---------- Media ----------
export async function getMedia(id: number) {
  return wpFetch<WPMedia>(`/media/${id}`);
}

// ---------- Tags ----------
export async function getTags(perPage = 20) {
  return wpFetch<WPTag[]>('/tags', { per_page: perPage, orderby: 'count', order: 'desc' }, []);
}

// ---------- Search ----------
export async function searchPosts(query: string, perPage = 100) {
  // orderby=relevance ensures WordPress ranks by how well the title/content matches
  // the query, not by modified date. Without this, recent bulk-edited posts crowd out
  // older but highly relevant posts (e.g. 50 Best articles).
  return wpFetch<WPPost[]>('/posts', { search: query, per_page: perPage, orderby: 'relevance', order: 'desc', _embed: 'true' }, []);
}

// ---------- Helpers ----------
export function getFeaturedImageUrl(post: WPPost, size: 'thumbnail' | 'medium' | 'medium_large' | 'large' | 'full' = 'large'): string | null {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media) return null;
  const url = media.media_details?.sizes?.[size]?.source_url || media.source_url || null;
  return url ? rewriteImageUrl(url) : null;
}

export function getFeaturedImageData(post: WPPost, size: 'thumbnail' | 'medium' | 'medium_large' | 'large' | 'full' = 'large'): { url: string; width: number; height: number } | null {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media) return null;
  const sizeData = media.media_details?.sizes?.[size];
  const url = sizeData?.source_url || media.source_url;
  if (!url) return null;
  // Use size-specific dimensions if available, fall back to full image dimensions
  const width = (sizeData as any)?.width || media.media_details?.width || 1200;
  const height = (sizeData as any)?.height || media.media_details?.height || 675;
  return { url: rewriteImageUrl(url), width, height };
}

export function getPostCategories(post: WPPost): WPCategory[] {
  return post._embedded?.['wp:term']?.[0] || [];
}

export function getPostAuthor(post: WPPost): WPAuthor | null {
  return post._embedded?.author?.[0] || null;
}

export function getPostTags(post: WPPost): WPTag[] {
  // Tags are the second array in wp:term (first is categories)
  return (post._embedded?.['wp:term']?.[1] as unknown as WPTag[]) || [];
}

export function stripHtml(html: string): string {
  let text = html.replace(/<[^>]*>/g, '').trim();
  // Decode HTML entities
  text = text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8230;/g, '…')
    .replace(/&#\d+;/g, '');
  return text;
}

export function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLen * 0.6 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

export function estimateReadTime(content: string): number {
  const words = stripHtml(content).split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 250));
}

// ---------- Image URL helpers ----------
/**
 * Rewrite barmagazine.com or wpcomstaging.com image URLs to use the WordPress.com CDN
 * (i0.wp.com) so images keep working after DNS points barmagazine.com to Vercel.
 */
export function rewriteImageUrl(url: string): string {
  if (!url) return url;
  // Already on wp.com CDN
  if (url.includes('i0.wp.com') || url.includes('i1.wp.com') || url.includes('i2.wp.com')) return url;
  // Rewrite barmagazine.com/wp-content/ to CDN
  if (url.includes('barmagazine.com/wp-content/')) {
    return url.replace('https://barmagazine.com/', 'https://i0.wp.com/barmagazine.com/');
  }
  // Rewrite wpcomstaging.com URLs to CDN (via production domain)
  if (url.includes(`${STAGING_DOMAIN}/wp-content/`)) {
    return url.replace(
      `https://${STAGING_DOMAIN}/`,
      `https://i0.wp.com/${PROD_DOMAIN}/`
    );
  }
  return url;
}

/**
 * Rewrite all image URLs inside HTML content (in src, data-src, srcset, etc.).
 * Handles both barmagazine.com and wpcomstaging.com origins.
 */
export function rewriteContentImageUrls(html: string): string {
  if (!html) return html;
  let result = html;
  // Fix malformed href values missing the https:// prefix (e.g. href="www.example.com")
  result = result.replace(
    /href="(www\.[^"]+)"/g,
    'href="https://$1"'
  );
  // Rewrite staging domain article links to barmagazine.com (NOT images/uploads)
  result = result.replace(
    /href="https:\/\/romanzelenka-wjgek\.wpcomstaging\.com\/(?!wp-content\/uploads\/)([^"]*)"/g,
    `href="https://${PROD_DOMAIN}/$1"`
  );
  // Rewrite barmagazine.com image URLs to CDN
  result = result.replace(
    /https:\/\/barmagazine\.com\/wp-content\/uploads\/([^"'\s)]+)/g,
    `https://i0.wp.com/${PROD_DOMAIN}/wp-content/uploads/$1`
  );
  // Rewrite wpcomstaging.com image URLs to CDN (via production domain)
  result = result.replace(
    /https:\/\/romanzelenka-wjgek\.wpcomstaging\.com\/wp-content\/uploads\/([^"'\s)]+)/g,
    `https://i0.wp.com/${PROD_DOMAIN}/wp-content/uploads/$1`
  );
  return result;
}

/**
 * Extract FAQ-style Q&A pairs from article HTML content.
 * Detects bold questions followed by paragraph answers, or h2/h3 headings
 * phrased as questions (containing "?") followed by content.
 * Returns up to 5 pairs for FAQPage schema.
 */
export function extractFaqPairs(html: string): Array<{ question: string; answer: string }> {
  if (!html) return [];
  const pairs: Array<{ question: string; answer: string }> = [];

  // Pattern 1: Bold text ending with "?" followed by a paragraph
  const boldQA = Array.from(html.matchAll(/<(?:b|strong)[^>]*>([^<]*\?)<\/(?:b|strong)>\s*<\/p>\s*<p[^>]*>(.*?)<\/p>/gi));
  for (const m of boldQA) {
    const q = m[1].replace(/<[^>]+>/g, '').trim();
    const a = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (q.length > 15 && q.length < 200 && a.length > 30 && a.length < 500) {
      pairs.push({ question: q, answer: a });
    }
  }

  // Pattern 2: H2/H3 headings phrased as questions
  if (pairs.length < 3) {
    const headingQA = Array.from(html.matchAll(/<h[23][^>]*>([^<]*\?[^<]*)<\/h[23]>\s*<p[^>]*>(.*?)<\/p>/gi));
    for (const m of headingQA) {
      const q = m[1].replace(/<[^>]+>/g, '').trim();
      const a = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (q.length > 15 && q.length < 200 && a.length > 30 && a.length < 500) {
        pairs.push({ question: q, answer: a });
      }
    }
  }

  // Pattern 3: Numbered list items with questions ("1. What is...") — common in listicle articles
  if (pairs.length < 3) {
    const numberedQA = Array.from(html.matchAll(/<h[23][^>]*>\s*(?:\d+\.?\s*)?([^<]*\?[^<]*)<\/h[23]>\s*(?:<[^>]+>)*\s*<p[^>]*>(.*?)<\/p>/gi));
    for (const m of numberedQA) {
      const q = m[1].replace(/<[^>]+>/g, '').trim();
      const a = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (q.length > 15 && q.length < 200 && a.length > 30) {
        pairs.push({ question: q, answer: a.slice(0, 500) });
      }
    }
  }

  // Deduplicate and limit to 5
  const seen = new Set<string>();
  return pairs.filter(p => {
    if (seen.has(p.question)) return false;
    seen.add(p.question);
    return true;
  }).slice(0, 5);
}

// Category ID map (from the live site)
export const CATEGORY_MAP: Record<string, number> = {
  'bar-tour': 6,
  'bars': 63,
  'blog': 1,
  'cocktails': 8,
  'features': 40,
  'flavours': 44,
  'news': 52,
  'people': 199,
  'awards': 200,
  'brands': 201,
  'events': 202,
};
